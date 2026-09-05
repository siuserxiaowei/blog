import assert from 'node:assert/strict';
import test from 'node:test';

import {
  competitions,
  getPrimaryDeadline,
  validateCompetitionCollectionV2,
  validateCompetitions,
} from '../src/data/competitions.js';
import {
  ROUND13_ADDITIONS_CHECKED_AT,
  competitionRound13Additions,
} from '../src/data/competition-round13-additions.js';

const researchDate = '2026-08-06';
const expectedAdditionIds = new Set([
  'buidl-quests-2026',
  'bnb-build-the-era-2026',
  'haizhizi-ai-agent-2026',
  'neurips-realpde-2026',
  'neurips-aimo-interpretability-2026',
  'neurips-steerability-2026',
  'neurips-virtual-embryo-2026',
  'neurips-quantiphy-2026',
  'neurips-fusion-equilibrium-2026',
  'neurips-robosyn-2026',
  'neurips-roco-spring-2026',
  'neurips-amp-challenge-2026',
  'ieee-agetech-dataset-2026',
]);
const additionsById = new Map(competitionRound13Additions.map((item) => [item.id, item]));
const finalById = new Map(competitions.map((item) => [item.id, item]));

function cashTotal(competition) {
  return competition.prizeBoundary.cash.reduce(
    (sum, item) => sum + item.amount * (item.quantity ?? 1),
    0,
  );
}

test('round thirteen adds all thirteen verified research events exactly once', () => {
  assert.equal(ROUND13_ADDITIONS_CHECKED_AT, researchDate);
  assert.equal(competitionRound13Additions.length, 13);
  assert.deepEqual(new Set(additionsById.keys()), expectedAdditionIds);
  assert.equal(competitions.length, 439);
  assert.equal(new Set(competitions.map((item) => item.id)).size, competitions.length);
  for (const id of expectedAdditionIds) assert.ok(finalById.has(id), id);
});

test('round thirteen satisfies the legacy and V2 data contracts with dated official evidence', () => {
  assert.deepEqual(validateCompetitions(competitionRound13Additions).errors, []);
  assert.deepEqual(validateCompetitionCollectionV2(competitionRound13Additions).errors, []);
  assert.deepEqual(validateCompetitions(competitions).errors, []);

  for (const competition of competitionRound13Additions) {
    assert.equal(competition.verification.status, 'verified', competition.id);
    assert.equal(competition.verification.checkedAt, researchDate, competition.id);
    assert.equal(competition.verification.sourceKind, 'official', competition.id);
    assert.ok(competition.sources.length > 0, competition.id);
    assert.ok(competition.sources.every((source) => source.kind === 'official'), competition.id);
    for (const source of competition.sources) {
      assert.equal(source.date, researchDate, `${competition.id}: ${source.url}`);
      assert.match(source.url, /^https?:\/\//, `${competition.id}: ${source.url}`);
    }

    const primary = getPrimaryDeadline(competition);
    assert.ok(['application', 'entry', 'registration', 'submission'].includes(primary.type), competition.id);
    assert.equal(primary.certainty, 'confirmed', competition.id);
    assert.match(primary.date, /^2026-\d{2}-\d{2}$/, competition.id);
    assert.ok(primary.timezone, competition.id);
    assert.ok(competition.sources.some((source) => source.url === primary.sourceUrl), competition.id);
    assert.equal(competition.deadlines.filter((deadline) => deadline.primary).length, 1, competition.id);

    assert.ok(competition.eligibility.scope, competition.id);
    assert.ok(competition.eligibility.regions.length > 0, competition.id);
    assert.ok(competition.eligibility.fee, competition.id);
    assert.ok(competition.eligibility.team, competition.id);
    assert.ok(Array.isArray(competition.prizeBoundary.cash), competition.id);
    assert.ok(Array.isArray(competition.prizeBoundary.nonCash), competition.id);
    assert.ok(Array.isArray(competition.prizeBoundary.investment), competition.id);
    assert.ok(competition.prizeBoundary.cashStatus, competition.id);
    assert.ok(competition.prizeBoundary.ip, competition.id);
  }
});

test('entry gates and primary deadlines retain the actionable official dates', () => {
  const expected = new Map([
    ['buidl-quests-2026', ['open-to-new', 'submission', '2026-08-12', 'Asia/Singapore']],
    ['bnb-build-the-era-2026', ['open-to-new', 'submission', '2026-09-09', 'UTC']],
    ['haizhizi-ai-agent-2026', ['open-to-new', 'submission', '2026-08-31', 'Asia/Shanghai']],
    ['neurips-realpde-2026', ['open-to-new', 'registration', '2026-08-20', 'UTC']],
    ['neurips-aimo-interpretability-2026', ['open-to-new', 'submission', '2026-10-25', 'AoE']],
    ['neurips-steerability-2026', ['not-open-yet', 'submission', '2026-11-15', 'AoE']],
    ['neurips-virtual-embryo-2026', ['not-open-yet', 'submission', '2026-11-02', 'AoE']],
    ['neurips-quantiphy-2026', ['open-to-new', 'submission', '2026-11-05', 'AoE']],
    ['neurips-fusion-equilibrium-2026', ['open-to-new', 'submission', '2026-10-18', 'AoE']],
    ['neurips-robosyn-2026', ['open-to-new', 'submission', '2026-10-11', 'AoE']],
    ['neurips-roco-spring-2026', ['open-to-new', 'submission', '2026-09-30', 'AoE']],
    ['neurips-amp-challenge-2026', ['open-to-new', 'submission', '2026-10-01', 'AoE']],
    ['ieee-agetech-dataset-2026', ['open-to-new', 'submission', '2026-09-30', 'UTC']],
  ]);

  for (const [id, [entryStatus, type, date, timezone]] of expected) {
    const competition = additionsById.get(id);
    const primary = getPrimaryDeadline(competition);
    assert.equal(competition.entryStatus, entryStatus, id);
    assert.equal(primary.type, type, id);
    assert.equal(primary.date, date, id);
    assert.equal(primary.timezone, timezone, id);
  }

  assert.equal(additionsById.get('neurips-steerability-2026').opensAt, '2026-08-15');
  assert.equal(additionsById.get('neurips-virtual-embryo-2026').opensAt, '2026-08-15');
  assert.ok(additionsById.get('neurips-realpde-2026').deadlines.some((item) => item.date === '2026-09-27'));
  assert.ok(additionsById.get('neurips-realpde-2026').deadlines.some((item) => item.date === '2026-10-25'));
  assert.ok(additionsById.get('neurips-robosyn-2026').deadlines.some((item) => item.date === '2026-11-15'));
  assert.ok(additionsById.get('neurips-roco-spring-2026').deadlines.some((item) => item.date === '2026-09-15'));
  assert.ok(additionsById.get('neurips-roco-spring-2026').deadlines.some((item) => item.date === '2026-10-07'));
});

test('eligibility and hard participation gates are explicit', () => {
  const haizhizi = additionsById.get('haizhizi-ai-agent-2026');
  assert.equal(haizhizi.eligibility.scope, 'students-only');
  assert.match(haizhizi.eligibility.team, /个人|最多 4 人/);
  assert.match(haizhizi.audience, /全日制.*学生/);

  assert.match(additionsById.get('neurips-realpde-2026').eligibility.team, /最多 3 人/);
  assert.match(additionsById.get('neurips-steerability-2026').eligibility.team, /1.?5 人/);
  assert.match(additionsById.get('neurips-quantiphy-2026').eligibility.team, /最多 5 人/);
  assert.match(additionsById.get('ieee-agetech-dataset-2026').eligibility.team, /个人|最多 4 人/);

  const virtualEmbryo = additionsById.get('neurips-virtual-embryo-2026');
  assert.match(virtualEmbryo.desc, /Human Team.*Agent Team|Human Team.*Agent Team/s);
  assert.match(virtualEmbryo.cons.join(' '), /完整演化轨迹/);

  const ageTech = additionsById.get('ieee-agetech-dataset-2026');
  assert.match(ageTech.desc, /Dataset Report/);
  assert.match(ageTech.cons.join(' '), /伦理|隐私|同意|治理/);
});

test('cash, credits, travel support and undisclosed amounts are never conflated', () => {
  const buidl = additionsById.get('buidl-quests-2026');
  assert.equal(cashTotal(buidl), 50000);
  assert.equal(buidl.prizeBoundary.cashStatus, 'at-least-total');
  assert.match(buidl.prizeBoundary.nonCash.join(' '), /350,?000/);
  assert.match(buidl.prizeBoundary.nonCash.join(' '), /每队.*2,?000|2,?000.*每队/);

  const bnb = additionsById.get('bnb-build-the-era-2026');
  assert.equal(bnb.prizeBoundary.cash.length, 0);
  assert.match(bnb.prizeBoundary.nonCash.join(' '), /40,?000/);
  assert.match(bnb.prizeBoundary.nonCash.join(' '), /30,?000.*等值/);

  const realPde = additionsById.get('neurips-realpde-2026');
  assert.equal(cashTotal(realPde), 21000);
  assert.equal(cashTotal(additionsById.get('neurips-aimo-interpretability-2026')), 10000);

  const embryo = additionsById.get('neurips-virtual-embryo-2026');
  assert.equal(cashTotal(embryo), 54000);
  assert.match(embryo.prizeBoundary.nonCash.join(' '), /30,?000.*差旅/);
  assert.match(embryo.prizeBoundary.nonCash.join(' '), /20,?000.*Outreach|20,?000.*赛事建设/);
  assert.doesNotMatch(embryo.rewards.join(' '), /104,?000.*现金/);

  assert.equal(cashTotal(additionsById.get('neurips-fusion-equilibrium-2026')), 1000);
  assert.equal(cashTotal(additionsById.get('ieee-agetech-dataset-2026')), 6000);

  for (const id of [
    'haizhizi-ai-agent-2026',
    'neurips-steerability-2026',
    'neurips-quantiphy-2026',
    'neurips-robosyn-2026',
    'neurips-roco-spring-2026',
    'neurips-amp-challenge-2026',
  ]) {
    const competition = additionsById.get(id);
    assert.equal(competition.prizeBoundary.cash.length, 0, id);
    assert.equal(competition.prizeBoundary.cashStatus, 'amount-not-stated', id);
  }
});

test('low-prize research events remain recorded but clearly carry low recommendation priority', () => {
  for (const id of ['neurips-fusion-equilibrium-2026', 'neurips-robosyn-2026', 'neurips-roco-spring-2026', 'neurips-amp-challenge-2026']) {
    const competition = additionsById.get(id);
    assert.equal(competition.curation.recommendationPriority, 'low', id);
    assert.match(`${competition.suit} ${competition.strategy}`, /低优先|科研|门槛/, id);
  }
});

test('known false positive and existing duplicate are not re-added', () => {
  assert.equal(competitions.filter((item) => /MiniMax.*150.?K|150.?K.*MiniMax/i.test(`${item.name} ${item.fullName}`)).length, 0);
  assert.equal(competitions.filter((item) => item.id === 'armaiopt2026').length, 1);
  assert.equal(competitionRound13Additions.some((item) => item.id === 'armaiopt2026'), false);
});
