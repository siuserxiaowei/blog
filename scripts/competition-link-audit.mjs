#!/usr/bin/env node

import { lookup } from 'node:dns/promises';
import http from 'node:http';
import https from 'node:https';
import { isIP } from 'node:net';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { competitions } from '../src/data/competitions.js';

const DEFAULTS = Object.freeze({
  timeoutMs: 8_000,
  maxBytes: 64 * 1024,
  maxRedirects: 4,
  concurrency: 4,
  limit: Number.POSITIVE_INFINITY,
  dryRun: false,
  failOnDead: false,
  ids: [],
});

const BLOCKED_HOST_SUFFIXES = ['.localhost', '.local', '.internal', '.home.arpa'];
const BOT_STATUS_CODES = new Set([401, 403, 407, 429]);
const DEAD_STATUS_CODES = new Set([404, 410]);

function usage() {
  return `Usage: node scripts/competition-link-audit.mjs [options]

Options:
  --dry-run             Validate selection and network targets without sending HTTP requests
  --id <competition-id> Audit one competition ID; repeat to select several
  --limit <count>       Audit at most this many unique URLs
  --concurrency <count> Concurrent requests (default: ${DEFAULTS.concurrency})
  --timeout-ms <ms>     Per-request timeout (default: ${DEFAULTS.timeoutMs})
  --max-bytes <bytes>   Maximum response bytes read (default: ${DEFAULTS.maxBytes})
  --max-redirects <n>   Maximum redirects followed (default: ${DEFAULTS.maxRedirects})
  --fail-on-dead        Exit non-zero when any confirmed 404/410 is found
  --help                 Show this help

The command is read-only. It uses GET, follows redirects manually, validates every
redirect target, keeps TLS certificate verification enabled, and never writes data.`;
}

function parsePositiveInteger(raw, name, { allowZero = false } = {}) {
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < (allowZero ? 0 : 1)) {
    throw new Error(`${name} must be ${allowZero ? 'a non-negative' : 'a positive'} integer`);
  }
  return value;
}

export function parseArgs(argv) {
  const options = { ...DEFAULTS, ids: [] };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--help') return { ...options, help: true };
    if (arg === '--dry-run') {
      options.dryRun = true;
      continue;
    }
    if (arg === '--fail-on-dead') {
      options.failOnDead = true;
      continue;
    }

    const next = argv[index + 1];
    if (arg === '--id') {
      if (!next) throw new Error('--id requires a value');
      options.ids.push(next);
      index += 1;
      continue;
    }
    if (arg === '--limit') {
      options.limit = parsePositiveInteger(next, '--limit');
      index += 1;
      continue;
    }
    if (arg === '--concurrency') {
      options.concurrency = parsePositiveInteger(next, '--concurrency');
      index += 1;
      continue;
    }
    if (arg === '--timeout-ms') {
      options.timeoutMs = parsePositiveInteger(next, '--timeout-ms');
      index += 1;
      continue;
    }
    if (arg === '--max-bytes') {
      options.maxBytes = parsePositiveInteger(next, '--max-bytes');
      index += 1;
      continue;
    }
    if (arg === '--max-redirects') {
      options.maxRedirects = parsePositiveInteger(next, '--max-redirects', { allowZero: true });
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function ipv4ToNumber(address) {
  return address.split('.').reduce((value, octet) => ((value << 8) | Number(octet)) >>> 0, 0);
}

function inIpv4Range(address, base, bits) {
  const value = ipv4ToNumber(address);
  const network = ipv4ToNumber(base);
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  return (value & mask) === (network & mask);
}

export function isPrivateOrReservedAddress(address) {
  const version = isIP(address);
  if (version === 4) {
    return [
      ['0.0.0.0', 8],
      ['10.0.0.0', 8],
      ['100.64.0.0', 10],
      ['127.0.0.0', 8],
      ['169.254.0.0', 16],
      ['172.16.0.0', 12],
      ['192.0.0.0', 24],
      ['192.0.2.0', 24],
      ['192.168.0.0', 16],
      ['198.18.0.0', 15],
      ['198.51.100.0', 24],
      ['203.0.113.0', 24],
      ['224.0.0.0', 4],
      ['240.0.0.0', 4],
    ].some(([base, bits]) => inIpv4Range(address, base, bits));
  }

  if (version === 6) {
    const normalized = address.toLowerCase().split('%')[0];
    const mapped = normalized.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/);
    if (mapped) return isPrivateOrReservedAddress(mapped[1]);
    const mappedHex = normalized.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
    if (mappedHex) {
      const high = Number.parseInt(mappedHex[1], 16);
      const low = Number.parseInt(mappedHex[2], 16);
      const mappedIpv4 = `${high >>> 8}.${high & 0xff}.${low >>> 8}.${low & 0xff}`;
      return isPrivateOrReservedAddress(mappedIpv4);
    }

    return normalized === '::'
      || normalized === '::1'
      || /^f[cd][0-9a-f]{2}:/.test(normalized)
      || /^fe[89ab][0-9a-f]:/.test(normalized)
      || /^ff[0-9a-f]{2}:/.test(normalized)
      || /^2001:db8:/.test(normalized)
      || /^2001:2:/.test(normalized)
      || /^2001:1[0-9a-f]:/.test(normalized)
      || /^100:/.test(normalized)
      || /^64:ff9b:1:/.test(normalized);
  }

  return true;
}

export function validateUrlSyntax(rawUrl) {
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error('invalid_url');
  }

  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('unsupported_protocol');
  if (url.username || url.password) throw new Error('embedded_credentials');
  if (!url.hostname) throw new Error('missing_hostname');

  const hostname = url.hostname.toLowerCase().replace(/\.$/, '').replace(/^\[|\]$/g, '');
  if (
    hostname === 'localhost'
    || BLOCKED_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix))
    || (!hostname.includes('.') && isIP(hostname) === 0)
  ) {
    throw new Error('local_hostname');
  }

  const effectivePort = url.port || (url.protocol === 'https:' ? '443' : '80');
  if (!['80', '443'].includes(effectivePort)) throw new Error('nonstandard_port');

  if (isIP(hostname) && isPrivateOrReservedAddress(hostname)) {
    throw new Error('private_or_reserved_address');
  }

  return url;
}

export async function validateNetworkTarget(rawUrl, dnsLookup = lookup) {
  return (await resolveNetworkTarget(rawUrl, dnsLookup)).url;
}

async function withTimeout(promise, timeoutMs, label) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          const error = new Error(label);
          error.name = 'TimeoutError';
          reject(error);
        }, timeoutMs);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

async function resolveNetworkTarget(rawUrl, dnsLookup = lookup, timeoutMs = DEFAULTS.timeoutMs) {
  const url = validateUrlSyntax(rawUrl);
  const hostname = url.hostname.toLowerCase().replace(/\.$/, '').replace(/^\[|\]$/g, '');
  let answers;

  if (isIP(hostname)) {
    answers = [{ address: hostname, family: isIP(hostname) }];
  } else {
    answers = await withTimeout(
      dnsLookup(hostname, { all: true, verbatim: true }),
      timeoutMs,
      'dns_timeout',
    );
    if (!answers.length) throw new Error('dns_no_answers');
  }

  if (answers.some((answer) => isPrivateOrReservedAddress(answer.address))) {
    throw new Error('dns_resolves_private_or_reserved');
  }

  return { url, hostname, answers };
}

async function readLimitedBody(body, maxBytes) {
  if (!body) return { text: '', truncated: false, bytesRead: 0 };

  if (typeof body.getReader !== 'function') {
    const chunks = [];
    let bytesRead = 0;
    let truncated = false;

    for await (const rawChunk of body) {
      const chunk = Buffer.isBuffer(rawChunk) ? rawChunk : Buffer.from(rawChunk);
      const remaining = maxBytes - bytesRead;
      if (remaining <= 0) {
        truncated = true;
        break;
      }
      const slice = chunk.byteLength > remaining ? chunk.subarray(0, remaining) : chunk;
      chunks.push(slice);
      bytesRead += slice.byteLength;
      if (slice.byteLength < chunk.byteLength || bytesRead >= maxBytes) {
        truncated = true;
        break;
      }
    }

    if (truncated && typeof body.destroy === 'function') body.destroy();
    return {
      text: Buffer.concat(chunks).toString('utf8'),
      truncated,
      bytesRead,
    };
  }

  const reader = body.getReader();
  const chunks = [];
  let bytesRead = 0;
  let truncated = false;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value?.byteLength) continue;

      const remaining = maxBytes - bytesRead;
      if (remaining <= 0) {
        truncated = true;
        break;
      }

      const slice = value.byteLength > remaining ? value.subarray(0, remaining) : value;
      chunks.push(Buffer.from(slice));
      bytesRead += slice.byteLength;

      if (slice.byteLength < value.byteLength || bytesRead >= maxBytes) {
        truncated = true;
        break;
      }
    }
  } finally {
    if (truncated) await reader.cancel('response_body_limit_reached').catch(() => {});
    reader.releaseLock();
  }

  return {
    text: Buffer.concat(chunks).toString('utf8'),
    truncated,
    bytesRead,
  };
}

function looksLikeBotChallenge(response, bodyText) {
  const server = response.headers.get('server') ?? '';
  const lowered = `${server}\n${bodyText}`.toLowerCase();
  return /(cloudflare|captcha|access denied|verify you are human|bot detection|rate limit|security check)/.test(lowered);
}

function classifyHttpResponse(response, bodyText) {
  if (response.ok) return 'ok';
  if (BOT_STATUS_CODES.has(response.status) || looksLikeBotChallenge(response, bodyText)) return 'bot_blocked';
  if (DEAD_STATUS_CODES.has(response.status)) return 'dead';
  return 'uncertain';
}

function classifyFetchError(error) {
  const code = error?.cause?.code ?? error?.code;
  if (code === 'ENOTFOUND' || code === 'ENODATA') return { status: 'dead', reason: 'dns_not_found' };
  if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
    return { status: 'uncertain', reason: 'timeout' };
  }
  return { status: 'uncertain', reason: code ? `network_${code}` : 'network_error' };
}

function pinnedLookup(target) {
  return (hostname, options, callback) => {
    const normalizedHost = hostname.toLowerCase().replace(/\.$/, '').replace(/^\[|\]$/g, '');
    if (normalizedHost !== target.hostname) {
      callback(Object.assign(new Error('lookup_hostname_mismatch'), { code: 'ESECURITY' }));
      return;
    }

    const requestedFamily = Number(options?.family) || 0;
    const candidates = requestedFamily
      ? target.answers.filter((answer) => answer.family === requestedFamily)
      : target.answers;

    if (!candidates.length) {
      callback(Object.assign(new Error('no_valid_address_for_family'), { code: 'EADDRNOTAVAIL' }));
      return;
    }

    if (options?.all) {
      callback(null, candidates.map(({ address, family }) => ({ address, family })));
      return;
    }

    callback(null, candidates[0].address, candidates[0].family);
  };
}

function requestOnce(target, options) {
  return new Promise((resolveRequest, rejectRequest) => {
    const transport = target.url.protocol === 'https:' ? https : http;
    const request = transport.request(target.url, {
      method: 'GET',
      agent: false,
      lookup: pinnedLookup(target),
      maxHeaderSize: 32 * 1024,
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/json;q=0.8,*/*;q=0.5',
        'User-Agent': 'siuserxiaowei-competition-radar-link-audit/1.0 (+https://siuserxiaowei.com/competitions/)',
      },
    }, (incoming) => {
      const status = incoming.statusCode ?? 0;
      resolveRequest({
        status,
        ok: status >= 200 && status < 300,
        headers: {
          get(name) {
            const value = incoming.headers[name.toLowerCase()];
            return Array.isArray(value) ? value.join(', ') : value ?? null;
          },
        },
        body: incoming,
      });
    });

    request.setTimeout(options.timeoutMs, () => {
      const error = new Error('request_timeout');
      error.name = 'TimeoutError';
      request.destroy(error);
    });
    request.on('error', rejectRequest);
    request.end();
  });
}

async function closeBody(body) {
  if (!body) return;
  if (typeof body.cancel === 'function') {
    await body.cancel().catch(() => {});
    return;
  }
  if (typeof body.destroy === 'function') body.destroy();
}

async function auditUrl(entry, options) {
  let currentUrl = entry.url;
  const redirects = [];

  try {
    for (let hop = 0; hop <= options.maxRedirects; hop += 1) {
      const target = await resolveNetworkTarget(currentUrl, lookup, options.timeoutMs);
      const safeUrl = target.url;
      const response = await requestOnce(target, options);

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        await closeBody(response.body);
        if (!location) {
          return { ...entry, status: 'uncertain', reason: 'redirect_without_location', httpStatus: response.status, redirects };
        }
        if (hop >= options.maxRedirects) {
          return { ...entry, status: 'uncertain', reason: 'redirect_limit', httpStatus: response.status, redirects };
        }

        const nextUrl = new URL(location, safeUrl).toString();
        await resolveNetworkTarget(nextUrl, lookup, options.timeoutMs);
        redirects.push({ from: safeUrl.toString(), to: nextUrl, status: response.status });
        currentUrl = nextUrl;
        continue;
      }

      const body = await readLimitedBody(response.body, options.maxBytes);
      return {
        ...entry,
        status: classifyHttpResponse(response, body.text),
        reason: `http_${response.status}`,
        httpStatus: response.status,
        finalUrl: safeUrl.toString(),
        redirects,
        bytesRead: body.bytesRead,
        bodyTruncated: body.truncated,
      };
    }
  } catch (error) {
    if (
      ['invalid_url', 'unsupported_protocol', 'embedded_credentials', 'missing_hostname', 'local_hostname',
        'nonstandard_port', 'private_or_reserved_address', 'dns_resolves_private_or_reserved'].includes(error?.message)
    ) {
      return { ...entry, status: 'uncertain', reason: `unsafe_target_${error.message}`, redirects };
    }
    return { ...entry, ...classifyFetchError(error), redirects };
  }

  return { ...entry, status: 'uncertain', reason: 'unexpected_audit_state', redirects };
}

function collectEntries(options) {
  const selectedIds = new Set(options.ids);
  const selected = options.ids.length
    ? competitions.filter((competition) => selectedIds.has(competition.id))
    : competitions;

  if (options.ids.length) {
    const missing = options.ids.filter((id) => !selected.some((competition) => competition.id === id));
    if (missing.length) throw new Error(`Unknown competition IDs: ${missing.join(', ')}`);
  }

  const byUrl = new Map();
  for (const competition of selected) {
    const candidates = [
      { url: competition.url, role: 'action', sourceTitle: 'Primary action URL' },
      ...(competition.sources ?? []).map((source) => ({
        url: source.url,
        role: 'source',
        sourceTitle: source.title,
      })),
    ];

    for (const candidate of candidates) {
      if (!candidate.url) continue;
      const existing = byUrl.get(candidate.url);
      if (existing) {
        existing.references.push({ competitionId: competition.id, role: candidate.role, sourceTitle: candidate.sourceTitle });
      } else {
        byUrl.set(candidate.url, {
          url: candidate.url,
          references: [{ competitionId: competition.id, role: candidate.role, sourceTitle: candidate.sourceTitle }],
        });
      }
    }
  }

  return [...byUrl.values()].slice(0, options.limit);
}

async function mapConcurrent(items, concurrency, mapper) {
  const results = new Array(items.length);
  let cursor = 0;

  async function worker() {
    while (true) {
      const index = cursor;
      cursor += 1;
      if (index >= items.length) return;
      results[index] = await mapper(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
  return results;
}

function summarize(results) {
  const counts = { ok: 0, bot_blocked: 0, dead: 0, uncertain: 0 };
  for (const result of results) counts[result.status] += 1;
  return counts;
}

function determineExitCode(results, options) {
  if (!results.length) return 2;
  const counts = summarize(results);
  const unsafe = results.some((result) => result.reason?.startsWith('unsafe_target_'));
  if (unsafe) return 2;
  if (options.failOnDead && counts.dead > 0) return 1;

  const systemicUncertainty = counts.uncertain / results.length >= 0.5;
  const noReachableEvidence = counts.ok + counts.bot_blocked === 0;
  if (systemicUncertainty || noReachableEvidence) return 3;
  return 0;
}

async function run(options) {
  if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') {
    throw new Error('Refusing to run while NODE_TLS_REJECT_UNAUTHORIZED=0');
  }

  const entries = collectEntries(options);
  if (!entries.length) throw new Error('No URLs selected');

  if (options.dryRun) {
    const results = await mapConcurrent(entries, options.concurrency, async (entry) => {
      try {
        const url = await resolveNetworkTarget(entry.url, lookup, options.timeoutMs);
        return { ...entry, status: 'ok', reason: 'target_policy_valid', finalUrl: url.url.toString() };
      } catch (error) {
        return { ...entry, status: 'uncertain', reason: `unsafe_or_unresolved_${error.message}` };
      }
    });
    return results;
  }

  return mapConcurrent(entries, options.concurrency, (entry) => auditUrl(entry, options));
}

async function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
    if (options.help) {
      console.log(usage());
      return;
    }

    const results = await run(options);
    const summary = summarize(results);
    console.log(JSON.stringify({
      mode: options.dryRun ? 'dry-run' : 'live',
      auditedAt: new Date().toISOString(),
      selected: results.length,
      limits: {
        timeoutMs: options.timeoutMs,
        maxBytes: options.maxBytes,
        maxRedirects: options.maxRedirects,
        concurrency: options.concurrency,
      },
      summary,
      results,
    }, null, 2));

    process.exitCode = options.dryRun
      ? (results.some((result) => result.status !== 'ok') ? 2 : 0)
      : determineExitCode(results, options);
  } catch (error) {
    console.error(`competition-link-audit: ${error.message}`);
    process.exitCode = 2;
  }
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : '';
if (invokedPath === import.meta.url) await main();

export {
  auditUrl,
  classifyHttpResponse,
  collectEntries,
  determineExitCode,
  readLimitedBody,
  run,
  summarize,
};
