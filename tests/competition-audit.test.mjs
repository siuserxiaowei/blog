import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

import { competitions } from '../src/data/competitions.js';
import {
  auditCompetitionCollection,
  buildCompetitionAuditReport,
  formatLocalDate,
  parseArgs,
  parseLocalDate,
} from '../scripts/competition-audit.mjs';

const baselineDate = new Date('2026-08-04T00:00:00+08:00');
const cliUrl = new URL('../scripts/competition-audit.mjs', import.meta.url);

test('strict date parsing accepts only real YYYY-MM-DD local dates', () => {
  assert.equal(formatLocalDate(parseLocalDate('2026-08-04')), '2026-08-04');
  assert.throws(() => parseLocalDate('2026-8-2'), /YYYY-MM-DD/);
  assert.throws(() => parseLocalDate('2026-02-30'), /real calendar date/);
  assert.throws(() => parseArgs(['--today']), /requires YYYY-MM-DD/);
  assert.throws(() => parseArgs(['--unknown']), /Unknown argument/);
});

test('CLI options default to the visiting local day and allow deterministic override', () => {
  const now = new Date(2026, 7, 9, 23, 45, 12);
  const defaults = parseArgs([], { now });
  assert.equal(formatLocalDate(defaults.today), '2026-08-09');
  assert.equal(defaults.json, false);

  const explicit = parseArgs(['--today', '2026-08-02', '--json'], { now });
  assert.equal(formatLocalDate(explicit.today), '2026-08-02');
  assert.equal(explicit.json, true);
});

test('2026-08-04 audit is reproducible for the final round-six collection', () => {
  const result = auditCompetitionCollection(competitions, baselineDate);
  assert.equal(result.total, 315);
  assert.deepEqual(result.byStatus, {
    urgent: 67,
    ongoing: 143,
    upcoming: 38,
    expired: 34,
    unknown: 33,
  });
  assert.equal(result.urgentCount, 67);
  assert.deepEqual(result.byDeadlineCertainty, {
    confirmed: 282,
    estimated: 19,
    unknown: 5,
    rolling: 9,
  });
  assert.equal(result.p0Count, 0);
});

test('report exposes deterministic audit date separately from generation time', () => {
  const report = buildCompetitionAuditReport(competitions, {
    today: baselineDate,
    generatedAt: new Date('2026-08-04T12:34:56.000Z'),
  });
  assert.equal(report.auditDate, '2026-08-04');
  assert.equal(report.generatedAt, '2026-08-04T12:34:56.000Z');
  assert.equal(report.radarUpdatedAt, '2026-08-04');
});

test('CLI JSON is parseable and invalid parameters retain a distinct exit code', () => {
  const valid = spawnSync(process.execPath, [cliUrl.pathname, '--today', '2026-08-04', '--json'], {
    encoding: 'utf8',
  });
  assert.equal(valid.status, 0, valid.stderr);
  const report = JSON.parse(valid.stdout);
  assert.equal(report.auditDate, '2026-08-04');
  assert.equal(report.total, 315);
  assert.equal(report.p0Count, 0);

  const invalid = spawnSync(process.execPath, [cliUrl.pathname, '--today', '2026-02-30'], {
    encoding: 'utf8',
  });
  assert.equal(invalid.status, 2);
  assert.match(invalid.stderr, /Invalid --today date/);
});
