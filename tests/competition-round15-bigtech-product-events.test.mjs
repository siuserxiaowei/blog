import assert from 'node:assert/strict';
import test from 'node:test';

import {
  competitions,
  getPrimaryDeadline,
  validateCompetitionCollectionV2,
  validateCompetitions,
} from '../src/data/competitions.js';
import {
  ROUND15_ADDITIONS_CHECKED_AT,
  competitionRound15Additions,
} from '../src/data/competition-round15-additions.js';

const researchDate = '2026-08-07';
const expectedAdditionIds = new Set([
  'ican-miaoda-dumate-agent-2026',
  'ican-ai-application-innovation-2026',
  'douyin-ai-innovators-2026',
  'miaoda-application-aesthetics-2026',
  'miaoda-ai-producer-hackathon-2026',
  'miaoda-cup-ai-general-application-2026',
  'miaoda-watcha-app-challenge-2026',
  'baidu-cti-2026',
  'meituan-campus-ai-hackathon-2026',
  'meituan-tabbit-skill-competition-2026',
]);
const additionsById = new Map(competitionRound15Additions.map((item) => [item.id, item]));
const finalById = new Map(competitions.map((item) => [item.id, item]));

function disclosedCashTotal(competition) {
  return competition.prizeBoundary.cash.reduce(
    (sum, item) => sum + item.amount * (item.quantity ?? 1),
    0,
  );
}

test('round fifteen adds ten big-tech product events exactly once', () => {
  assert.equal(ROUND15_ADDITIONS_CHECKED_AT, researchDate);
  assert.deepEqual(new Set(additionsById.keys()), expectedAdditionIds);
  assert.equal(competitionRound15Additions.length, expectedAdditionIds.size);
  assert.equal(competitions.length, 439);
  assert.equal(new Set(competitions.map((item) => item.id)).size, competitions.length);
  for (const id of expectedAdditionIds) assert.ok(finalById.has(id), id);
});

test('round fifteen records satisfy both schemas and retain dated evidence', () => {
  assert.deepEqual(validateCompetitions(competitionRound15Additions).errors, []);
  assert.deepEqual(validateCompetitionCollectionV2(competitionRound15Additions).errors, []);
  assert.deepEqual(validateCompetitions(competitions).errors, []);

  for (const competition of competitionRound15Additions) {
    assert.equal(competition.verification.checkedAt, researchDate, competition.id);
    assert.ok(['verified', 'partially-verified'].includes(competition.verification.status), competition.id);
    assert.ok(competition.sources.some((source) => source.kind === 'official'), competition.id);
    for (const source of competition.sources) {
      assert.equal(source.date, researchDate, `${competition.id}: ${source.url}`);
      assert.match(source.url, /^https?:\/\//, `${competition.id}: ${source.url}`);
    }
    assert.equal(competition.deadlines.filter((deadline) => deadline.primary).length, 1, competition.id);
    assert.ok(competition.eligibility.scope, competition.id);
    assert.ok(competition.eligibility.regions.length > 0, competition.id);
    assert.ok(competition.eligibility.fee, competition.id);
    assert.ok(competition.eligibility.team, competition.id);
    assert.ok(competition.prizeBoundary.cashStatus, competition.id);
    assert.ok(competition.prizeBoundary.ip, competition.id);
  }
});

test('only the two iCAN product competitions remain open to new entrants', () => {
  const open = new Map([
    ['ican-miaoda-dumate-agent-2026', ['2026-10-15', 'submission']],
    ['ican-ai-application-innovation-2026', ['2026-09-30', 'submission']],
  ]);

  for (const [id, [date, type]] of open) {
    const competition = additionsById.get(id);
    const primary = getPrimaryDeadline(competition);
    assert.equal(competition.entryStatus, 'open-to-new', id);
    assert.equal(primary.date, date, id);
    assert.equal(primary.type, type, id);
    assert.equal(primary.certainty, 'confirmed', id);
  }

  const miaoda = additionsById.get('ican-miaoda-dumate-agent-2026');
  assert.match(miaoda.desc, /秒哒.*Web|Web.*秒哒/);
  assert.match(miaoda.desc, /DuMate.*智能体|智能体.*DuMate/);
  assert.match(miaoda.eligibility.team, /个人|2.?5 人/);
  assert.match(miaoda.rewards.join(' '), /百度.*实习.*30|30.*实习/);
  assert.equal(miaoda.prizeBoundary.cash.length, 0);
});

test('Douyin keeps the closed registration date separate from the overall event period', () => {
  const douyin = additionsById.get('douyin-ai-innovators-2026');
  const primary = getPrimaryDeadline(douyin);
  assert.equal(douyin.entryStatus, 'registered-only');
  assert.equal(primary.type, 'registration');
  assert.equal(primary.date, '2026-06-20');
  assert.ok(douyin.deadlines.some((deadline) => deadline.type === 'event-end' && deadline.date === '2026-08-31'));
  assert.match(douyin.desc, /互动空间/);
  assert.match(douyin.desc, /视觉搜索/);
  assert.equal(disclosedCashTotal(douyin), 1240000);
});

test('five Miaoda-related events are present without disguising closed events as open', () => {
  const miaodaIds = [
    'ican-miaoda-dumate-agent-2026',
    'miaoda-application-aesthetics-2026',
    'miaoda-ai-producer-hackathon-2026',
    'miaoda-cup-ai-general-application-2026',
    'miaoda-watcha-app-challenge-2026',
  ];
  assert.deepEqual(
    miaodaIds.map((id) => additionsById.get(id).entryStatus),
    ['open-to-new', 'closed', 'closed', 'closed', 'closed'],
  );

  const aesthetics = additionsById.get('miaoda-application-aesthetics-2026');
  assert.equal(disclosedCashTotal(aesthetics), 145000);
  assert.match(aesthetics.eligibility.team, /单人|个人/);

  const producer = additionsById.get('miaoda-ai-producer-hackathon-2026');
  assert.equal(disclosedCashTotal(producer), 300000);
  assert.match(producer.prizeBoundary.cashStatus, /partial|total/i);

  const cup = additionsById.get('miaoda-cup-ai-general-application-2026');
  assert.match(cup.eligibility.team, /最多 3 人|不超过 3 人/);

  const watcha = additionsById.get('miaoda-watcha-app-challenge-2026');
  assert.equal(watcha.prizeBoundary.cash.length, 0);
  assert.match(watcha.rewards.join(' '), /Token/);
});

test('Meituan reward and IP boundaries remain explicit', () => {
  const hackathon = additionsById.get('meituan-campus-ai-hackathon-2026');
  assert.equal(hackathon.entryStatus, 'closed');
  assert.match(hackathon.prizeBoundary.ip, /获奖.*知识产权.*美团|知识产权.*归美团/);
  assert.match(hackathon.cons.join(' '), /获奖.*知识产权.*美团|知识产权.*归美团/);
  assert.match(hackathon.eligibility.team, /1.?3 人/);

  const tabbit = additionsById.get('meituan-tabbit-skill-competition-2026');
  assert.equal(tabbit.entryStatus, 'closed');
  assert.equal(disclosedCashTotal(tabbit), 75000);
  assert.match(tabbit.desc, /提示词.*脚本.*任务/);
  assert.ok(tabbit.deadlines.some((deadline) => deadline.type === 'results' && deadline.date === '2026-07-10'));
});

test('Baidu CTI is archived and existing Tencent official events are not duplicated', () => {
  const cti = additionsById.get('baidu-cti-2026');
  assert.equal(cti.entryStatus, 'closed');
  assert.equal(getPrimaryDeadline(cti).date, '2026-06-26');
  assert.equal(cti.prizeBoundary.cash.length, 0);
  assert.match(cti.rewards.join(' '), /校招|实习/);

  for (const id of [
    'tencent-cloud-game-dev-hackathon-2026',
    'tencent-cloud-agent-championship-2026',
    'tencent-workbuddy-agent-singapore-2026',
    'tencentgamecreator2026',
    'gwb2026',
  ]) {
    assert.equal(competitions.filter((item) => item.id === id).length, 1, id);
    assert.equal(additionsById.has(id), false, id);
  }
});
