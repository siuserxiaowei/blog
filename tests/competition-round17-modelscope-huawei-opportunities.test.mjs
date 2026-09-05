import assert from 'node:assert/strict';
import test from 'node:test';

import {
  competitions,
  getPrimaryDeadline,
  validateCompetitionCollectionV2,
  validateCompetitions,
} from '../src/data/competitions.js';
import {
  ROUND17_ADDITIONS_CHECKED_AT,
  competitionRound17Additions,
} from '../src/data/competition-round17-additions.js';
import { competitionRound17Corrections } from '../src/data/competition-round17-corrections.js';

const expectedAdditionIds = new Set([
  'ai-infinity-developer-creation-2026',
  'minicpm-ascend-challenge-2026',
  'production-ai-skills-2026',
  'ventured-vibe-coding-hackathon-2026',
  'silicon-carbon-ai-diagnosis-2026',
  'harmonyos-app-developer-incentive-2026',
  'harmony-agent-tiangong-incentive-2026',
]);
const additionsById = new Map(competitionRound17Additions.map((item) => [item.id, item]));
const finalById = new Map(competitions.map((item) => [item.id, item]));

function cashTotal(competition) {
  return competition.prizeBoundary.cash.reduce(
    (total, prize) => total + prize.amount * (prize.quantity ?? 1),
    0,
  );
}

test('round seventeen adds seven deduplicated ModelScope and Huawei opportunities', () => {
  assert.equal(ROUND17_ADDITIONS_CHECKED_AT, '2026-08-09');
  assert.deepEqual(new Set(additionsById.keys()), expectedAdditionIds);
  assert.equal(competitionRound17Additions.length, expectedAdditionIds.size);
  assert.equal(competitions.length, 439);
  assert.equal(new Set(competitions.map((item) => item.id)).size, competitions.length);
  for (const id of expectedAdditionIds) assert.equal(competitions.filter((item) => item.id === id).length, 1, id);
});

test('the five ModelScope competitions retain exact application and submission boundaries', () => {
  const expected = new Map([
    ['ai-infinity-developer-creation-2026', ['2026-08-10', 'submission']],
    ['minicpm-ascend-challenge-2026', ['2026-08-31', 'submission']],
    ['production-ai-skills-2026', ['2026-08-31', 'submission']],
    ['ventured-vibe-coding-hackathon-2026', ['2026-08-23', 'registration']],
    ['silicon-carbon-ai-diagnosis-2026', ['2026-09-06', 'registration']],
  ]);

  for (const [id, [date, type]] of expected) {
    const competition = additionsById.get(id);
    assert.equal(competition.entryStatus, 'open-to-new', id);
    assert.equal(getPrimaryDeadline(competition).date, date, id);
    assert.equal(getPrimaryDeadline(competition).type, type, id);
    assert.equal(getPrimaryDeadline(competition).certainty, 'confirmed', id);
    assert.ok(competition.sources.some((source) => source.kind === 'official'), id);
    assert.ok(competition.sources.some((source) => source.url === `https://modelscope.cn/events/${competition.modelScopeId}/summary`), id);
  }

  const miniCpm = additionsById.get('minicpm-ascend-challenge-2026');
  assert.match(miniCpm.verification.notes, /8 月 14 日.*8 月 17 日.*8 月 31 日|8 月 31 日.*8 月 14 日.*8 月 17 日/);
  assert.equal(cashTotal(miniCpm), 406000);
  assert.match(miniCpm.desc, /高性能推理优化.*创新应用|创新应用.*高性能推理优化/);

  const aiInfinity = additionsById.get('ai-infinity-developer-creation-2026');
  assert.equal(cashTotal(aiInfinity), 20000);
  assert.match(aiInfinity.desc, /AI\+运营/);
  assert.match(aiInfinity.rewards.join(' '), /Credits/);
  assert.match(aiInfinity.rewards.join(' '), /GPU/);

  const skills = additionsById.get('production-ai-skills-2026');
  assert.equal(cashTotal(skills), 10000);
  assert.match(skills.desc, /Qoder/);
  assert.match(skills.desc, /WorkBuddy/);
  assert.match(skills.desc, /TRAE Work/);
  assert.match(skills.cons.join(' '), /本地运行|Localhost/);
});

test('VentureD and the medical challenge expose material participation limits', () => {
  const ventureD = additionsById.get('ventured-vibe-coding-hackathon-2026');
  assert.match(ventureD.loc, /杭州/);
  assert.ok(ventureD.deadlines.some((deadline) => deadline.type === 'event-start' && deadline.date === '2026-08-27'));
  assert.ok(ventureD.deadlines.some((deadline) => deadline.type === 'event-end' && deadline.date === '2026-08-29'));
  assert.match(ventureD.desc, /Hardware/);
  assert.match(ventureD.desc, /Physical AI/);
  assert.match(ventureD.desc, /Deep Space/);
  assert.match(ventureD.desc, /Global Commerce/);
  assert.match(ventureD.desc, /Healthcare/);
  assert.equal(ventureD.prizeBoundary.cash.length, 0);

  const medical = additionsById.get('silicon-carbon-ai-diagnosis-2026');
  assert.equal(medical.eligibility.scope, 'students-only');
  assert.match(medical.audience, /全国高校在校生/);
  assert.match(medical.eligibility.team, /1.?3 人/);
  assert.equal(cashTotal(medical), 99200);
  assert.match(medical.cons.join(' '), /仅限.*在校生|在校生限定/);
});

test('Huawei incentives are programs, not traditional competitions', () => {
  const harmonyApp = additionsById.get('harmonyos-app-developer-incentive-2026');
  assert.equal(harmonyApp.recordType, 'program');
  assert.equal(harmonyApp.entryStatus, 'open-to-new');
  assert.equal(getPrimaryDeadline(harmonyApp).type, 'application');
  assert.equal(getPrimaryDeadline(harmonyApp).date, '2026-09-25');
  assert.match(harmonyApp.eligibility.scope, /个人开发者/);
  assert.match(harmonyApp.desc, /2026-09-30|9 月 30 日/);
  assert.match(harmonyApp.prizeBoundary.cashStatus, /limited|conditional/);
  assert.match(harmonyApp.rewards.join(' '), /单个开发者.*100 万元|100 万元.*单个开发者/);

  const tiangong = additionsById.get('harmony-agent-tiangong-incentive-2026');
  assert.equal(tiangong.recordType, 'program');
  assert.equal(tiangong.entryStatus, 'open-to-new');
  assert.equal(getPrimaryDeadline(tiangong).date, '2026-10-25');
  assert.equal(tiangong.eligibility.scope, 'enterprise-or-service-provider');
  assert.match(tiangong.eligibility.team, /个人开发者.*企业开发者|个人.*实名认证.*企业/);
  assert.match(tiangong.desc, /LLM/);
  assert.match(tiangong.desc, /Workflow/);
  assert.match(tiangong.desc, /A2A/);
  assert.match(tiangong.rewards.join(' '), /单智能体.*75 万元|75 万元.*单智能体/);
  assert.match(tiangong.rewards.join(' '), /单开发者.*200 万元|200 万元.*单开发者/);
});

test('the existing Bund hackathon is corrected with the Qoder official channel instead of duplicated', () => {
  assert.ok(competitionRound17Corrections.bund);
  assert.equal(competitions.filter((item) => item.id === 'bund').length, 1);
  assert.ok(finalById.get('bund').sources.some((source) => source.url === 'https://modelscope.cn/events/330/summary'));
  assert.equal(expectedAdditionIds.has('bund'), false);
});

test('round seventeen and the final collection pass both schemas with dated official evidence', () => {
  assert.deepEqual(validateCompetitions(competitionRound17Additions).errors, []);
  assert.deepEqual(validateCompetitionCollectionV2(competitionRound17Additions).errors, []);
  assert.deepEqual(validateCompetitions(competitions).errors, []);

  for (const competition of competitionRound17Additions) {
    assert.equal(competition.verification.checkedAt, ROUND17_ADDITIONS_CHECKED_AT, competition.id);
    assert.equal(competition.verification.sourceKind, 'official', competition.id);
    assert.ok(['verified', 'partially-verified'].includes(competition.verification.status), competition.id);
    assert.equal(competition.deadlines.filter((deadline) => deadline.primary).length, 1, competition.id);
    assert.ok(competition.prizeBoundary.cashStatus, competition.id);
    assert.ok(competition.prizeBoundary.ip, competition.id);
  }
});
