import {
  competitions,
  getCompetitionStats,
  getPrimaryDeadline,
  statusOf,
  validateCompetitions,
} from '../src/data/competitions.js';

const TODAY = new Date('2026-07-30T00:00:00+08:00');
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

function countBy(items, getKey) {
  return items.reduce((counts, item) => {
    const key = getKey(item) ?? 'unknown';
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});
}

const validation = validateCompetitions(competitions);
const p0 = validation.errors.map((error) => ({
  type: 'schema',
  id: error.id ?? null,
  message: error.message,
}));

for (const competition of competitions) {
  const primary = getPrimaryDeadline(competition);
  const status = statusOf(primary, TODAY);
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

const stats = getCompetitionStats(competitions, TODAY);
const report = {
  generatedAt: new Date().toISOString(),
  radarUpdatedAt: '2026-07-30',
  total: competitions.length,
  byRecordType: countBy(competitions, (competition) => competition.recordType),
  byDeadlineCertainty: countBy(competitions, (competition) => getPrimaryDeadline(competition)?.certainty),
  byVerification: countBy(competitions, (competition) => competition.verification?.status),
  byStatus: stats.byStatus,
  urgentCount: stats.urgentCount,
  warningCount: validation.warnings?.length ?? 0,
  p0Count: p0.length,
  p0,
};

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`Competition radar audit: ${report.total} records`);
  console.log(`Deadline certainty: ${JSON.stringify(report.byDeadlineCertainty)}`);
  console.log(`Verification: ${JSON.stringify(report.byVerification)}`);
  console.log(`Status: ${JSON.stringify(report.byStatus)}`);
  console.log(`Warnings: ${report.warningCount}`);
  console.log(`P0: ${report.p0Count}`);
  for (const issue of report.p0) {
    console.error(`- [${issue.type}] ${issue.id ?? 'collection'}: ${issue.message}`);
  }
}

if (p0.length > 0) process.exitCode = 1;
