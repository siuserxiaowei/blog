import assert from 'node:assert/strict';
import test from 'node:test';

import {
  competitions,
  getPrimaryDeadline,
  validateCompetitionCollectionV2,
  validateCompetitions,
} from '../src/data/competitions.js';
import {
  ROUND14_ADDITIONS_CHECKED_AT,
  competitionRound14Additions,
} from '../src/data/competition-round14-additions.js';

const researchDate = '2026-08-06';
const expectedAdditionIds = new Set([
  'neurips-learn2design-2026',
  'neurips-smart-buildings-2026',
  'neurips-fair-universe-weak-lensing-2026',
  'neurips-simulacrabench-2026',
  'neurips-sapc2-2026',
  'neurips-predictive-ai-evaluation-2026',
  'neurips-agenthon-2026',
  'eccv-unobench-2026',
  'nasa-space-roboticist-2026',
  'ieee-bigdata-suicide-risk-2026',
  'ieee-bigdata-finreason-2026',
  'ieee-bigdata-urbantwin-2026',
  'ieee-bigdata-carbonglobe-2026',
  'ieee-bigdata-trafficflowbench-2026',
  'ieee-bigdata-xbench-2026',
]);
const additionsById = new Map(competitionRound14Additions.map((item) => [item.id, item]));
const finalById = new Map(competitions.map((item) => [item.id, item]));

function cashTotal(competition) {
  return competition.prizeBoundary.cash.reduce(
    (sum, item) => sum + item.amount * (item.quantity ?? 1),
    0,
  );
}

test('round fourteen adds fifteen newly verified official events exactly once', () => {
  assert.equal(ROUND14_ADDITIONS_CHECKED_AT, researchDate);
  assert.deepEqual(new Set(additionsById.keys()), expectedAdditionIds);
  assert.equal(competitionRound14Additions.length, expectedAdditionIds.size);
  assert.equal(competitions.length, 439);
  assert.equal(new Set(competitions.map((item) => item.id)).size, competitions.length);
  for (const id of expectedAdditionIds) assert.ok(finalById.has(id), id);
});

test('round fourteen satisfies both data contracts and retains dated official evidence', () => {
  assert.deepEqual(validateCompetitions(competitionRound14Additions).errors, []);
  assert.deepEqual(validateCompetitionCollectionV2(competitionRound14Additions).errors, []);
  assert.deepEqual(validateCompetitions(competitions).errors, []);

  for (const competition of competitionRound14Additions) {
    assert.equal(competition.verification.checkedAt, researchDate, competition.id);
    assert.ok(['verified', 'partially-verified'].includes(competition.verification.status), competition.id);
    assert.ok(competition.sources.length > 0, competition.id);
    for (const source of competition.sources) {
      assert.equal(source.kind, 'official', `${competition.id}: ${source.url}`);
      assert.equal(source.date, researchDate, `${competition.id}: ${source.url}`);
      assert.match(source.url, /^https?:\/\//, `${competition.id}: ${source.url}`);
    }
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

test('confirmed, estimated and unknown deadlines preserve their evidence boundary', () => {
  const confirmed = new Map([
    ['neurips-learn2design-2026', ['open-to-new', 'submission', '2026-10-15', 'not-stated']],
    ['neurips-fair-universe-weak-lensing-2026', ['open-to-new', 'submission', '2026-10-11', 'UTC']],
    ['neurips-simulacrabench-2026', ['not-open-yet', 'submission', '2026-11-14', 'not-stated']],
    ['neurips-sapc2-2026', ['open-to-new', 'submission', '2026-08-31', 'not-stated']],
    ['neurips-agenthon-2026', ['not-open-yet', 'submission', '2026-10-12', 'not-stated']],
    ['eccv-unobench-2026', ['open-to-new', 'submission', '2026-08-30', 'UTC']],
    ['nasa-space-roboticist-2026', ['open-to-new', 'registration', '2026-09-23', 'America/Chicago']],
    ['ieee-bigdata-suicide-risk-2026', ['registered-only', 'registration', '2026-06-30', 'not-stated']],
    ['ieee-bigdata-urbantwin-2026', ['open-to-new', 'intent', '2026-08-15', 'not-stated']],
    ['ieee-bigdata-carbonglobe-2026', ['open-to-new', 'submission', '2026-11-15', 'UTC']],
    ['ieee-bigdata-trafficflowbench-2026', ['open-to-new', 'submission', '2026-11-06', 'not-stated']],
  ]);

  for (const [id, [entryStatus, type, date, timezone]] of confirmed) {
    const competition = additionsById.get(id);
    const primary = getPrimaryDeadline(competition);
    assert.equal(competition.entryStatus, entryStatus, id);
    assert.equal(primary.certainty, 'confirmed', id);
    assert.equal(primary.type, type, id);
    assert.equal(primary.date, date, id);
    assert.equal(primary.timezone, timezone, id);
    assert.ok(competition.sources.some((source) => source.url === primary.sourceUrl), id);
  }

  for (const id of ['neurips-smart-buildings-2026', 'ieee-bigdata-finreason-2026', 'ieee-bigdata-xbench-2026']) {
    const primary = getPrimaryDeadline(additionsById.get(id));
    assert.equal(primary.certainty, 'unknown', id);
    assert.equal(primary.date, null, id);
  }

  const predictive = getPrimaryDeadline(additionsById.get('neurips-predictive-ai-evaluation-2026'));
  assert.equal(predictive.certainty, 'estimated');
  assert.equal(predictive.date, '2026-08-31');
  assert.match(predictive.label, /月末占位|具体日期待确认/);

  assert.equal(additionsById.get('neurips-simulacrabench-2026').opensAt, '2026-08-10');
  assert.equal(additionsById.get('neurips-agenthon-2026').opensAt, '2026-08-17');
});

test('rewards and participation gates are not inflated or hidden', () => {
  assert.equal(cashTotal(additionsById.get('neurips-learn2design-2026')), 25000);
  assert.equal(cashTotal(additionsById.get('neurips-fair-universe-weak-lensing-2026')), 4000);
  assert.equal(cashTotal(additionsById.get('neurips-sapc2-2026')), 10000);
  assert.equal(cashTotal(additionsById.get('ieee-bigdata-trafficflowbench-2026')), 3500);
  assert.equal(cashTotal(additionsById.get('ieee-bigdata-xbench-2026')), 3000);

  const fairUniverse = additionsById.get('neurips-fair-universe-weak-lensing-2026');
  assert.match(fairUniverse.eligibility.team, /2.?10 人/);
  assert.match(fairUniverse.cons.join(' '), /机构|公司邮箱|affiliation/i);

  const sapc2 = additionsById.get('neurips-sapc2-2026');
  assert.match(sapc2.cons.join(' '), /DUA.*2.?4 周|2.?4 周.*DUA/);
  assert.match(sapc2.desc, /非流式|流式/);

  const nasa = additionsById.get('nasa-space-roboticist-2026');
  assert.equal(nasa.eligibility.chinaEligible, 'no');
  assert.equal(nasa.prizeBoundary.cash.length, 0);
  assert.match(nasa.rewards.join(' '), /在轨.*实验时间|FFR/);
  assert.match(nasa.cons.join(' '), /Goddard|美国/);

  const simulacra = additionsById.get('neurips-simulacrabench-2026');
  assert.equal(simulacra.prizeBoundary.cash.length, 0);
  assert.match(simulacra.prizeBoundary.nonCash.join(' '), /作者|差旅|演讲/);
  assert.match(simulacra.cons.join(' '), /封闭.*沙箱|微数据.*不公开/);

  const suicide = additionsById.get('ieee-bigdata-suicide-risk-2026');
  assert.match(suicide.cons.join(' '), /非商业|不得转交|DUA/);
  assert.equal(suicide.prizeBoundary.cashStatus, 'amount-not-stated');
});

test('IEEE Big Data Cup challenges remain separate and do not inherit sibling dates or prizes', () => {
  assert.equal(additionsById.get('ieee-bigdata-urbantwin-2026').deadlineISO, '2026-08-15');
  assert.equal(cashTotal(additionsById.get('ieee-bigdata-urbantwin-2026')), 1000);
  assert.equal(additionsById.get('ieee-bigdata-carbonglobe-2026').deadlineISO, '2026-11-15');
  assert.equal(additionsById.get('ieee-bigdata-trafficflowbench-2026').deadlineISO, '2026-11-06');
  assert.equal(getPrimaryDeadline(additionsById.get('ieee-bigdata-xbench-2026')).date, null);
  assert.equal(getPrimaryDeadline(additionsById.get('ieee-bigdata-finreason-2026')).date, null);

  assert.equal(competitionRound14Additions.some((item) => item.id === 'solarfilament2026'), false);
  assert.equal(competitions.filter((item) => item.id === 'solarfilament2026').length, 1);
});

test('known 2025 MiniMax false positive remains excluded', () => {
  const text = competitions.map((item) => `${item.name} ${item.fullName}`).join(' ');
  assert.doesNotMatch(text, /MiniMax.*150.?K|150.?K.*MiniMax/i);
});
