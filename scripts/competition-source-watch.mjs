#!/usr/bin/env node

import { createHash, randomUUID } from 'node:crypto';
import { lookup } from 'node:dns/promises';
import {
  mkdir,
  readFile,
  rename,
  unlink,
  writeFile,
} from 'node:fs/promises';
import http from 'node:http';
import https from 'node:https';
import { isIP } from 'node:net';
import { homedir } from 'node:os';
import { basename, dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { competitions } from '../src/data/competitions.js';
import {
  isPrivateOrReservedAddress,
  validateUrlSyntax,
} from './competition-link-audit.mjs';

const DEFAULT_STATE_FILE = resolve(
  homedir(),
  '.competition-monitor',
  'competition-source-watch.json',
);

const DEFAULTS = Object.freeze({
  concurrency: 4,
  dryRun: false,
  ids: [],
  json: false,
  limit: Number.POSITIVE_INFINITY,
  maxBytes: 256 * 1024,
  maxRedirects: 4,
  stateFile: DEFAULT_STATE_FILE,
  timeoutMs: 10_000,
});

const MAXIMUMS = Object.freeze({
  concurrency: 16,
  limit: 10_000,
  maxBytes: 4 * 1024 * 1024,
  maxRedirects: 10,
  timeoutMs: 120_000,
});

const BOT_STATUS_CODES = new Set([401, 403, 407, 429]);
const DEAD_STATUS_CODES = new Set([404, 410]);
const FAILURE_STATUSES = new Set(['bot-blocked', 'uncertain', 'dead']);
const MINIMUM_DEAD_CONFIRMATION_MS = 24 * 60 * 60 * 1000;
const STATE_SCHEMA_VERSION = '1.0';

function usage() {
  return `Usage: npm run radar:watch -- [options]

Options:
  --state-file PATH    Baseline state (default: ~/.competition-monitor/competition-source-watch.json)
  --dry-run            Fetch and compare, but do not write the state file
  --id ID              Select a competition ID; repeat for several IDs
  --limit N            Check at most N unique official source URLs
  --timeout-ms N       Per-request timeout (default: ${DEFAULTS.timeoutMs})
  --concurrency N      Concurrent checks (default: ${DEFAULTS.concurrency}, max: ${MAXIMUMS.concurrency})
  --max-bytes N        Maximum bytes read per response (default: ${DEFAULTS.maxBytes})
  --max-redirects N    Maximum redirects followed (default: ${DEFAULTS.maxRedirects})
  --json               Emit a JSON report
  --help               Show this message

Only sources explicitly classified as official are watched. The command performs
read-only GET requests, never logs in or submits forms, and never edits competition
data. A dry run still sends GET requests; it only suppresses state-file writes.`;
}

function parseBoundedInteger(raw, name, maximum, { allowZero = false } = {}) {
  const value = Number(raw);
  const minimum = allowZero ? 0 : 1;
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
    throw new Error(`${name} must be an integer between ${minimum} and ${maximum}`);
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
    if (arg === '--json') {
      options.json = true;
      continue;
    }

    const next = argv[index + 1];
    if (arg === '--state-file') {
      if (!next) throw new Error('--state-file requires a path');
      options.stateFile = resolve(next);
      index += 1;
      continue;
    }
    if (arg === '--id') {
      if (!next) throw new Error('--id requires a value');
      options.ids.push(next);
      index += 1;
      continue;
    }
    if (arg === '--limit') {
      options.limit = parseBoundedInteger(next, '--limit', MAXIMUMS.limit);
      index += 1;
      continue;
    }
    if (arg === '--timeout-ms') {
      options.timeoutMs = parseBoundedInteger(next, '--timeout-ms', MAXIMUMS.timeoutMs);
      index += 1;
      continue;
    }
    if (arg === '--concurrency') {
      options.concurrency = parseBoundedInteger(next, '--concurrency', MAXIMUMS.concurrency);
      index += 1;
      continue;
    }
    if (arg === '--max-bytes') {
      options.maxBytes = parseBoundedInteger(next, '--max-bytes', MAXIMUMS.maxBytes);
      index += 1;
      continue;
    }
    if (arg === '--max-redirects') {
      options.maxRedirects = parseBoundedInteger(
        next,
        '--max-redirects',
        MAXIMUMS.maxRedirects,
        { allowZero: true },
      );
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (options.dryRun && options.limit === Number.POSITIVE_INFINITY) options.limit = 10;
  return options;
}

function decodeHtmlEntities(value) {
  const named = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    nbsp: ' ',
    quot: '"',
  };

  return value.replace(/&(#(?:x[0-9a-f]+|\d+)|[a-z][a-z0-9]+);/gi, (match, entity) => {
    if (entity[0] !== '#') return named[entity.toLowerCase()] ?? match;
    const hexadecimal = entity[1]?.toLowerCase() === 'x';
    const codePoint = Number.parseInt(entity.slice(hexadecimal ? 2 : 1), hexadecimal ? 16 : 10);
    if (!Number.isInteger(codePoint) || codePoint < 0 || codePoint > 0x10ffff) return ' ';
    try {
      return String.fromCodePoint(codePoint);
    } catch {
      return ' ';
    }
  });
}

export function normalizeHtml(html) {
  return decodeHtmlEntities(String(html ?? '')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|noscript|svg)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ')
    .replace(/<(script|style|noscript|svg)\b[^>]*\/\s*>/gi, ' ')
    .replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

export function hashNormalizedText(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

function canonicalizeSourceUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    url.hash = '';
    return url.toString();
  } catch {
    return rawUrl;
  }
}

export function collectOfficialSources(records, options = {}) {
  const requestedIds = new Set(options.ids ?? []);
  const knownIds = new Set(records.map((record) => record.id));
  const missing = [...requestedIds].filter((id) => !knownIds.has(id));
  if (missing.length) throw new Error(`Unknown competition IDs: ${missing.join(', ')}`);

  const byUrl = new Map();
  for (const competition of records) {
    for (const source of competition.sources ?? []) {
      if (source.kind !== 'official' || !source.url) continue;
      const url = canonicalizeSourceUrl(source.url);
      const existing = byUrl.get(url);
      const reference = {
        competitionId: competition.id,
        sourceTitle: source.title,
      };
      if (existing) existing.references.push(reference);
      else byUrl.set(url, { url, references: [reference] });
    }
  }

  return [...byUrl.values()]
    .map((entry) => ({
      ...entry,
      references: entry.references.sort((a, b) => (
        a.competitionId.localeCompare(b.competitionId)
        || a.sourceTitle.localeCompare(b.sourceTitle)
      )),
    }))
    .filter((entry) => !requestedIds.size
      || entry.references.some((reference) => requestedIds.has(reference.competitionId)))
    .slice(0, options.limit ?? Number.POSITIVE_INFINITY);
}

function withTimeout(promise, timeoutMs, label, onTimeout = () => {}) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timer = setTimeout(() => {
        onTimeout();
        const error = new Error(label);
        error.name = 'TimeoutError';
        reject(error);
      }, timeoutMs);
    }),
  ]).finally(() => clearTimeout(timer));
}

async function resolveNetworkTarget(rawUrl, options) {
  const url = validateUrlSyntax(rawUrl);
  const hostname = url.hostname.toLowerCase().replace(/\.$/, '').replace(/^\[|\]$/g, '');
  const dnsLookup = options.dnsLookup ?? lookup;
  const answers = isIP(hostname)
    ? [{ address: hostname, family: isIP(hostname) }]
    : await withTimeout(
      dnsLookup(hostname, { all: true, verbatim: true }),
      options.timeoutMs,
      'dns_timeout',
    );

  if (!answers.length) throw new Error('dns_no_answers');
  if (answers.some((answer) => isPrivateOrReservedAddress(answer.address))) {
    throw new Error('dns_resolves_private_or_reserved');
  }
  return { answers, hostname, url };
}

function pinnedLookup(target) {
  return (hostname, options, callback) => {
    const normalized = hostname.toLowerCase().replace(/\.$/, '').replace(/^\[|\]$/g, '');
    if (normalized !== target.hostname) {
      callback(Object.assign(new Error('lookup_hostname_mismatch'), { code: 'ESECURITY' }));
      return;
    }

    const family = Number(options?.family) || 0;
    const candidates = family
      ? target.answers.filter((answer) => answer.family === family)
      : target.answers;
    if (!candidates.length) {
      callback(Object.assign(new Error('no_valid_address_for_family'), { code: 'EADDRNOTAVAIL' }));
      return;
    }
    if (options?.all) {
      callback(null, candidates.map(({ address, family: itemFamily }) => ({
        address,
        family: itemFamily,
      })));
      return;
    }
    callback(null, candidates[0].address, candidates[0].family);
  };
}

function requestOnce(target, options) {
  return new Promise((resolveRequest, rejectRequest) => {
    const transport = target.url.protocol === 'https:' ? https : http;
    const request = transport.request(target.url, {
      agent: false,
      headers: {
        Accept: 'text/html,application/xhtml+xml,text/plain;q=0.8,*/*;q=0.2',
        'Accept-Encoding': 'identity',
        'User-Agent': 'siuserxiaowei-competition-source-watch/1.0 (+https://siuserxiaowei.com/competitions/)',
      },
      lookup: pinnedLookup(target),
      maxHeaderSize: 32 * 1024,
      method: 'GET',
    }, (incoming) => {
      resolveRequest({
        body: incoming,
        headers: {
          get(name) {
            const value = incoming.headers[name.toLowerCase()];
            return Array.isArray(value) ? value.join(', ') : value ?? null;
          },
        },
        statusCode: incoming.statusCode ?? 0,
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

async function readLimitedBody(body, maxBytes, timeoutMs) {
  if (!body) return { body: Buffer.alloc(0), bytesRead: 0, truncated: false };
  const chunks = [];
  let bytesRead = 0;
  let truncated = false;

  const reading = (async () => {
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
  })();

  try {
    await withTimeout(reading, timeoutMs, 'response_timeout', () => body.destroy?.());
  } finally {
    if (truncated) body.destroy?.();
  }

  return { body: Buffer.concat(chunks), bytesRead, truncated };
}

export async function secureRequestPage(entry, options) {
  let currentUrl = entry.url;
  const redirects = [];

  for (let hop = 0; hop <= options.maxRedirects; hop += 1) {
    const target = await resolveNetworkTarget(currentUrl, options);
    const response = await requestOnce(target, options);

    if (response.statusCode >= 300 && response.statusCode < 400) {
      const location = response.headers.get('location');
      await closeBody(response.body);
      if (!location) {
        return {
          finalUrl: target.url.toString(),
          headers: response.headers,
          reason: 'redirect_without_location',
          redirects,
          statusCode: response.statusCode,
        };
      }
      if (hop >= options.maxRedirects) {
        return {
          finalUrl: target.url.toString(),
          headers: response.headers,
          reason: 'redirect_limit',
          redirects,
          statusCode: response.statusCode,
        };
      }

      const nextUrl = new URL(location, target.url).toString();
      await resolveNetworkTarget(nextUrl, options);
      redirects.push({
        from: target.url.toString(),
        status: response.statusCode,
        to: nextUrl,
      });
      currentUrl = nextUrl;
      continue;
    }

    const limited = await readLimitedBody(response.body, options.maxBytes, options.timeoutMs);
    return {
      ...limited,
      finalUrl: target.url.toString(),
      headers: response.headers,
      redirects,
      statusCode: response.statusCode,
    };
  }

  throw new Error('unexpected_redirect_state');
}

function looksLikeBotChallenge(headers, bodyText) {
  const server = headers?.get?.('server') ?? '';
  return /(cloudflare|captcha|access denied|verify you are human|bot detection|rate limit|security check)/i
    .test(`${server}\n${bodyText}`);
}

function responseCharset(contentType) {
  const match = /charset\s*=\s*["']?([^;\s"']+)/i.exec(contentType ?? '');
  return match?.[1]?.toLowerCase() || 'utf-8';
}

function decodeBody(body, contentType) {
  const bytes = Buffer.isBuffer(body) ? body : Buffer.from(body ?? '');
  try {
    return new TextDecoder(responseCharset(contentType)).decode(bytes);
  } catch {
    return new TextDecoder('utf-8').decode(bytes);
  }
}

function classifyRequestError(error) {
  const unsafeReasons = new Set([
    'embedded_credentials',
    'invalid_url',
    'local_hostname',
    'missing_hostname',
    'nonstandard_port',
    'private_or_reserved_address',
    'unsupported_protocol',
    'dns_resolves_private_or_reserved',
  ]);
  if (unsafeReasons.has(error?.message)) {
    return { reason: `unsafe_target_${error.message}`, runtimeError: true, status: 'uncertain' };
  }

  const code = error?.cause?.code ?? error?.code;
  if (code === 'ENOTFOUND' || code === 'ENODATA') {
    return { deadCandidate: true, reason: 'dns_not_found', status: 'uncertain' };
  }
  if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
    return { reason: 'timeout', status: 'uncertain' };
  }
  return { reason: code ? `network_${code}` : 'network_error', status: 'uncertain' };
}

async function observeEntry(entry, options, requestPage) {
  try {
    const response = await requestPage(entry, options);
    const contentType = response.headers?.get?.('content-type') ?? '';
    const contentEncoding = response.headers?.get?.('content-encoding') ?? 'identity';
    const bodyText = decodeBody(response.body, contentType);
    const common = {
      bytesRead: response.bytesRead ?? Buffer.byteLength(bodyText),
      finalUrl: response.finalUrl ?? entry.url,
      httpStatus: response.statusCode,
      redirects: response.redirects ?? [],
      truncated: Boolean(response.truncated),
    };

    if (BOT_STATUS_CODES.has(response.statusCode) || looksLikeBotChallenge(response.headers, bodyText)) {
      return { ...common, reason: `http_${response.statusCode}`, status: 'bot-blocked' };
    }
    if (DEAD_STATUS_CODES.has(response.statusCode)) {
      return {
        ...common,
        deadCandidate: true,
        reason: `http_${response.statusCode}`,
        status: 'uncertain',
      };
    }
    if (response.statusCode < 200 || response.statusCode >= 300) {
      return {
        ...common,
        reason: response.reason ?? `http_${response.statusCode}`,
        status: 'uncertain',
      };
    }
    if (contentEncoding && !/^identity$/i.test(contentEncoding)) {
      return { ...common, reason: `unsupported_content_encoding_${contentEncoding}`, status: 'uncertain' };
    }

    const normalizedText = normalizeHtml(bodyText);
    if (!normalizedText) return { ...common, reason: 'empty_normalized_body', status: 'uncertain' };
    return {
      ...common,
      currentHash: hashNormalizedText(normalizedText),
      normalizedLength: normalizedText.length,
      reason: 'content_fetched',
      status: 'ok',
    };
  } catch (error) {
    return classifyRequestError(error);
  }
}

function emptyState() {
  return {
    schemaVersion: STATE_SCHEMA_VERSION,
    sources: {},
    updatedAt: null,
  };
}

export async function readState(path) {
  let text;
  try {
    text = await readFile(path, 'utf8');
  } catch (error) {
    if (error?.code === 'ENOENT') return emptyState();
    throw error;
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON in state file: ${path}`);
  }
  if (parsed?.schemaVersion !== STATE_SCHEMA_VERSION || typeof parsed?.sources !== 'object') {
    throw new Error(`Unsupported source-watch state schema in: ${path}`);
  }
  return parsed;
}

export async function writeJsonAtomically(path, value) {
  await mkdir(dirname(path), { mode: 0o700, recursive: true });
  const temporary = resolve(
    dirname(path),
    `.${basename(path)}.${process.pid}.${randomUUID()}.tmp`,
  );
  try {
    await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, {
      encoding: 'utf8',
      flag: 'wx',
      mode: 0o600,
    });
    await rename(temporary, path);
  } catch (error) {
    await unlink(temporary).catch(() => {});
    throw error;
  }
}

function applyObservation(entry, observation, previous, checkedAt) {
  const competitionIds = [...new Set(
    entry.references.map((reference) => reference.competitionId),
  )].sort();
  const shared = {
    competitionIds,
    finalUrl: observation.finalUrl ?? previous?.finalUrl ?? entry.url,
    lastCheckedAt: checkedAt,
    sourceTitles: [...new Set(entry.references.map((reference) => reference.sourceTitle))].sort(),
    url: entry.url,
  };

  if (observation.currentHash) {
    const previousHash = previous?.hash ?? null;
    const status = !previousHash
      ? 'new-baseline'
      : previousHash === observation.currentHash ? 'ok' : 'changed';
    const recoveredFrom = FAILURE_STATUSES.has(previous?.lastStatus)
      ? previous.lastStatus
      : null;
    const stateEntry = {
      ...shared,
      bodyTruncated: observation.truncated,
      consecutiveDeadObservations: 0,
      fetchedAt: checkedAt,
      firstDeadObservedAt: null,
      hash: observation.currentHash,
      lastReason: observation.reason,
      lastStatus: status,
      normalizedLength: observation.normalizedLength,
    };
    const result = {
      ...shared,
      bytesRead: observation.bytesRead,
      currentHash: observation.currentHash,
      fetchedAt: checkedAt,
      httpStatus: observation.httpStatus ?? null,
      normalizedLength: observation.normalizedLength,
      previousHash,
      reason: observation.reason,
      recoveredFrom,
      status,
      truncated: observation.truncated,
    };
    return { result, stateEntry };
  }

  let consecutiveDeadObservations = 0;
  let firstDeadObservedAt = null;
  let status = observation.status;
  let reason = observation.reason;
  if (observation.deadCandidate) {
    const previousWasDeadCandidate = previous?.lastDeadCandidate === true;
    consecutiveDeadObservations = previousWasDeadCandidate
      ? (previous.consecutiveDeadObservations ?? 0) + 1
      : 1;
    firstDeadObservedAt = previousWasDeadCandidate
      ? previous.firstDeadObservedAt
      : checkedAt;
    const elapsed = Date.parse(checkedAt) - Date.parse(firstDeadObservedAt);
    status = consecutiveDeadObservations >= 2 && elapsed >= MINIMUM_DEAD_CONFIRMATION_MS
      ? 'dead'
      : 'uncertain';
    if (status !== 'dead') reason = `${observation.reason}_confirmation_pending`;
  }

  const stateEntry = {
    ...previous,
    ...shared,
    consecutiveDeadObservations,
    firstDeadObservedAt,
    lastDeadCandidate: Boolean(observation.deadCandidate),
    lastReason: reason,
    lastStatus: status,
  };
  const result = {
    ...shared,
    bytesRead: observation.bytesRead ?? null,
    currentHash: null,
    fetchedAt: null,
    httpStatus: observation.httpStatus ?? null,
    normalizedLength: null,
    previousHash: previous?.hash ?? null,
    reason,
    recoveredFrom: null,
    status,
    truncated: Boolean(observation.truncated),
    ...(observation.runtimeError ? { runtimeError: true } : {}),
  };
  return { result, stateEntry };
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

  await Promise.all(Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker(),
  ));
  return results;
}

function summarize(results) {
  const counts = {
    'bot-blocked': 0,
    changed: 0,
    dead: 0,
    'new-baseline': 0,
    ok: 0,
    uncertain: 0,
  };
  let recovered = 0;
  for (const result of results) {
    counts[result.status] += 1;
    if (result.recoveredFrom) recovered += 1;
  }
  return { ...counts, recovered };
}

export async function runSourceWatch(options, dependencies = {}) {
  if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') {
    throw new Error('Refusing to run while NODE_TLS_REJECT_UNAUTHORIZED=0');
  }

  const records = dependencies.competitions ?? competitions;
  const requestPage = dependencies.requestPage ?? secureRequestPage;
  const now = dependencies.now ?? (() => new Date());
  const checkedAt = now().toISOString();
  const entries = collectOfficialSources(records, options);
  if (!entries.length) throw new Error('No official source URLs selected');

  const previousState = await readState(options.stateFile);
  const nextState = {
    ...previousState,
    schemaVersion: STATE_SCHEMA_VERSION,
    sources: { ...previousState.sources },
    updatedAt: checkedAt,
  };

  const results = await mapConcurrent(entries, options.concurrency, async (entry) => {
    const observation = await observeEntry(entry, options, requestPage);
    const applied = applyObservation(
      entry,
      observation,
      previousState.sources[entry.url],
      checkedAt,
    );
    nextState.sources[entry.url] = applied.stateEntry;
    return applied.result;
  });

  if (!options.dryRun) await writeJsonAtomically(options.stateFile, nextState);

  const events = results.filter((result) => result.status !== 'ok' || result.recoveredFrom);
  return {
    dryRun: options.dryRun,
    events,
    generatedAt: checkedAt,
    limits: {
      concurrency: options.concurrency,
      maxBytes: options.maxBytes,
      maxRedirects: options.maxRedirects,
      timeoutMs: options.timeoutMs,
    },
    runtimeErrors: results.filter((result) => result.runtimeError).length,
    schemaVersion: STATE_SCHEMA_VERSION,
    selected: results.length,
    stateFile: options.stateFile,
    stateWritten: !options.dryRun,
    summary: summarize(results),
  };
}

function compactEvent(event) {
  const change = event.status === 'changed'
    ? ` ${event.previousHash?.slice(0, 12)} -> ${event.currentHash?.slice(0, 12)}`
    : '';
  const recovery = event.recoveredFrom ? ` recovered-from=${event.recoveredFrom}` : '';
  const truncation = event.truncated ? ' truncated' : '';
  return `${event.status} ${event.url} [${event.competitionIds.join(', ')}]${change}${recovery}${truncation}`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    return;
  }

  const report = await runSourceWatch(options);
  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(
      `Official source watch: checked ${report.selected}; events ${report.events.length}; `
      + `summary ${JSON.stringify(report.summary)}.`,
    );
    for (const event of report.events) console.log(compactEvent(event));
    console.log(`State: ${report.stateWritten ? report.stateFile : 'dry-run (not written)'}`);
  }
  if (report.runtimeErrors) process.exitCode = 2;
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : '';
if (invokedPath === import.meta.url) {
  main().catch((error) => {
    console.error(`competition-source-watch: ${error.message}`);
    process.exitCode = 2;
  });
}
