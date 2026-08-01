#!/usr/bin/env node

import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  RADAR_UPDATED_AT,
  competitions,
  getCompetitionStats,
  getPrimaryDeadline,
  statusOf,
  validateCompetitions,
} from '../src/data/competitions.js';

const UNCERTAIN_LEGACY_IDS = new Set([
  'oh',
  'hax',
  'hwdevcomp',
  'mihome',
  'geekpark',
  'builderx',
  'wise36kr',
  'creatorhackathonvol1',
]);

export function parseLocalDate(value) {
  if (typeof value !== 'string') throw new Error('--today requires YYYY-MM-DD');
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new Error(`Invalid --today date: ${value}; expected YYYY-MM-DD`);

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year
    || date.getMonth() !== month - 1
    || date.getDate() !== day
  ) {
    throw new Error(`Invalid --today date: ${value}; expected a real calendar date`);
  }
  return date;
}

export function startOfLocalDay(value = new Date()) {
  if (typeof value === 'string') return parseLocalDate(value);
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`Invalid date: ${value}`);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function formatLocalDate(value) {
  const date = startOfLocalDay(value);
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseArgs(argv, options = {}) {
  const parsed = {
    json: false,
    help: false,
    today: startOfLocalDay(options.now ?? new Date()),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--json') {
      parsed.json = true;
    } else if (arg === '--today') {
      parsed.today = parseLocalDate(argv[index + 1]);
      index += 1;
    } else if (arg === '--help') {
      parsed.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return parsed;
}

function countBy(items, getKey) {
  return items.reduce((counts, item) => {
    const key = getKey(item) ?? 'unknown';
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});
}

export function auditCompetitionCollection(items, today = new Date()) {
  const auditDate = startOfLocalDay(today);
  const validation = validateCompetitions(items);
  const p0 = validation.errors.map((error) => ({
    type: 'schema',
    id: error.id ?? null,
    message: error.message,
  }));

  for (const competition of items) {
    const primary = getPrimaryDeadline(competition);
    const status = statusOf(primary, auditDate);
    if (primary?.certainty !== 'confirmed' && status.kind === 'urgent') {
      p0.push({
        type: 'false-urgency',
        id: competition.id,
        message: `${competition.id} has ${primary.certainty} date but entered urgent countdown`,
      });
    }
    if (UNCERTAIN_LEGACY_IDS.has(competition.id) && primary?.certainty === 'confirmed') {
      p0.push({
        type: 'placeholder-date',
        id: competition.id,
        message: `${competition.id} still treats a placeholder date as confirmed`,
      });
    }
    if (!competition.sources?.length) {
      p0.push({
        type: 'missing-source',
        id: competition.id,
        message: `${competition.id} has no reader-visible source`,
      });
    }
  }

  const stats = getCompetitionStats(items, auditDate);
  return {
    total: items.length,
    byRecordType: countBy(items, (competition) => competition.recordType),
    byDeadlineCertainty: countBy(items, (competition) => getPrimaryDeadline(competition)?.certainty),
    byVerification: countBy(items, (competition) => competition.verification?.status),
    byStatus: stats.byStatus,
    urgentCount: stats.urgentCount,
    warningCount: validation.warnings?.length ?? 0,
    p0Count: p0.length,
    p0,
  };
}

export function buildCompetitionAuditReport(items = competitions, options = {}) {
  const today = startOfLocalDay(options.today ?? new Date());
  const generatedAt = options.generatedAt instanceof Date
    ? options.generatedAt
    : new Date(options.generatedAt ?? Date.now());
  if (Number.isNaN(generatedAt.getTime())) throw new Error('Invalid generatedAt timestamp');

  return {
    generatedAt: generatedAt.toISOString(),
    auditDate: formatLocalDate(today),
    radarUpdatedAt: RADAR_UPDATED_AT,
    ...auditCompetitionCollection(items, today),
  };
}

export function usage() {
  return `Usage: npm run radar:check -- [options]

Options:
  --today YYYY-MM-DD   Deterministic local audit date (default: today)
  --json               Emit machine-readable JSON
  --help               Show this message`;
}

export function printAuditText(report) {
  console.log(`Competition radar audit: ${report.total} records`);
  console.log(`Audit date: ${report.auditDate}`);
  console.log(`Radar updated at: ${report.radarUpdatedAt}`);
  console.log(`Deadline certainty: ${JSON.stringify(report.byDeadlineCertainty)}`);
  console.log(`Verification: ${JSON.stringify(report.byVerification)}`);
  console.log(`Status: ${JSON.stringify(report.byStatus)}`);
  console.log(`Warnings: ${report.warningCount}`);
  console.log(`P0: ${report.p0Count}`);
  for (const issue of report.p0) {
    console.error(`- [${issue.type}] ${issue.id ?? 'collection'}: ${issue.message}`);
  }
}

export function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  if (options.help) {
    console.log(usage());
    return 0;
  }

  const report = buildCompetitionAuditReport(competitions, { today: options.today });
  if (options.json) console.log(JSON.stringify(report, null, 2));
  else printAuditText(report);
  return report.p0Count > 0 ? 1 : 0;
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : '';
if (invokedPath === import.meta.url) {
  try {
    process.exitCode = main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 2;
  }
}
