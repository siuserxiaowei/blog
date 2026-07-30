#!/usr/bin/env node

import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

import { competitions, RADAR_UPDATED_AT } from '../src/data/competitions.js';
import {
  buildCompetitionReviewQueue,
  formatLocalDate,
  summarizeReviewQueue,
} from './competition-review-queue.mjs';
import {
  run as runLinkAudit,
  summarize as summarizeLinkAudit,
} from './competition-link-audit.mjs';

const DEFAULT_REPORT = resolve(homedir(), '.competition-monitor', 'radar-report.json');

function parsePositiveInteger(raw, name) {
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < 1) throw new Error(`${name} must be a positive integer`);
  return value;
}

export function parseArgs(argv) {
  const options = {
    dryRun: false,
    json: false,
    notify: true,
    reportFile: DEFAULT_REPORT,
    linkLimit: Number.POSITIVE_INFINITY,
    timeoutMs: 8_000,
    concurrency: 8,
    maxBytes: 8_192,
    reviewLimit: 50,
    today: new Date(),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];
    if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--json') options.json = true;
    else if (arg === '--no-notify') options.notify = false;
    else if (arg === '--report-file') {
      if (!next) throw new Error('--report-file requires a path');
      options.reportFile = resolve(next);
      index += 1;
    } else if (arg === '--link-limit') {
      options.linkLimit = parsePositiveInteger(next, '--link-limit');
      index += 1;
    } else if (arg === '--timeout-ms') {
      options.timeoutMs = parsePositiveInteger(next, '--timeout-ms');
      index += 1;
    } else if (arg === '--concurrency') {
      options.concurrency = parsePositiveInteger(next, '--concurrency');
      index += 1;
    } else if (arg === '--review-limit') {
      options.reviewLimit = parsePositiveInteger(next, '--review-limit');
      index += 1;
    } else if (arg === '--today') {
      const parsed = new Date(`${next}T00:00:00`);
      if (!next?.match(/^\d{4}-\d{2}-\d{2}$/) || formatLocalDate(parsed) !== next) {
        throw new Error(`Invalid date: ${next}`);
      }
      options.today = parsed;
      index += 1;
    } else if (arg === '--help') {
      options.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (options.dryRun && options.linkLimit === Number.POSITIVE_INFINITY) options.linkLimit = 10;
  return options;
}

function healthByUrl(report) {
  return new Map((report?.links?.problems ?? []).map((item) => [item.url, item.status]));
}

export function diffLinkHealth(previousReport, currentResults) {
  const previous = healthByUrl(previousReport);
  const current = new Map(currentResults.map((item) => [item.url, item.status]));
  const newDead = currentResults
    .filter((item) => item.status === 'dead' && previous.get(item.url) !== 'dead')
    .map((item) => item.url);
  const recovered = [...previous]
    .filter(([url, status]) => status === 'dead' && ['ok', 'bot_blocked'].includes(current.get(url)))
    .map(([url]) => url);
  return { newDead, recovered };
}

async function readPreviousReport(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch {
    return null;
  }
}

async function writeJsonAtomically(path, value) {
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.${process.pid}.tmp`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  await rename(temporary, path);
}

function notifyMacOS(message) {
  const sanitized = message.replace(/[\\"]/g, ' ').replace(/\s+/g, ' ').slice(0, 220);
  const script = `display notification "${sanitized}" with title "赛事雷达周检"`;
  return spawnSync('/usr/bin/osascript', ['-e', script], {
    encoding: 'utf8',
    timeout: 5_000,
  });
}

export async function runMonitor(options) {
  const previous = await readPreviousReport(options.reportFile);
  const reviewQueue = buildCompetitionReviewQueue(competitions, { today: options.today });
  const reviewSummary = summarizeReviewQueue(reviewQueue);
  const linkResults = await runLinkAudit({
    timeoutMs: options.timeoutMs,
    maxBytes: options.maxBytes,
    maxRedirects: 4,
    concurrency: options.concurrency,
    limit: options.linkLimit,
    dryRun: options.dryRun,
    failOnDead: false,
    ids: [],
  });
  const linkSummary = summarizeLinkAudit(linkResults);
  const changes = diffLinkHealth(previous, linkResults);
  const problems = linkResults.filter((item) => item.status !== 'ok');
  const report = {
    schemaVersion: '1.0',
    generatedAt: new Date().toISOString(),
    reviewDate: formatLocalDate(options.today),
    dryRun: options.dryRun,
    dataset: {
      count: competitions.length,
      updatedAt: RADAR_UPDATED_AT,
    },
    review: {
      summary: reviewSummary,
      top: reviewQueue.slice(0, options.reviewLimit),
    },
    links: {
      selected: linkResults.length,
      summary: linkSummary,
      problems,
      changes,
    },
  };

  if (!options.dryRun) {
    await writeJsonAtomically(options.reportFile, report);
    if (options.notify && (changes.newDead.length || changes.recovered.length)) {
      notifyMacOS(
        `新增死链 ${changes.newDead.length}；恢复 ${changes.recovered.length}；`
        + `待人工复核 ${reviewSummary.total} 条。`,
      );
    }
  }

  return report;
}

function usage() {
  return `Usage: npm run radar:monitor -- [options]

Options:
  --dry-run            Audit 10 URLs by default; do not write or notify
  --json               Emit the complete report instead of a compact summary
  --no-notify          Disable macOS change notifications
  --report-file PATH   Report destination (default: ~/.competition-monitor/radar-report.json)
  --link-limit N       Limit unique URLs audited
  --timeout-ms N       Per-request timeout (default: 8000)
  --concurrency N      Concurrent link checks (default: 8)
  --review-limit N     Review rows persisted (default: 50)
  --today YYYY-MM-DD   Deterministic local review date
  --help               Show this message

The monitor is read-only with respect to competition data. It never publishes,
submits forms, logs in, or turns network observations into automatic corrections.`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    return;
  }
  const report = await runMonitor(options);
  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(
      `Competition radar monitor ${report.reviewDate}: `
      + `${report.dataset.count} records, ${report.review.summary.total} review rows, `
      + `${report.links.selected} links (${JSON.stringify(report.links.summary)}), `
      + `${report.links.changes.newDead.length} new dead, `
      + `${report.links.changes.recovered.length} recovered.`,
    );
    console.log(`Report: ${options.dryRun ? 'dry-run (not written)' : options.reportFile}`);
  }
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : '';
if (invokedPath === import.meta.url) {
  main().catch((error) => {
    console.error(`competition-radar-monitor: ${error.message}`);
    process.exitCode = 2;
  });
}
