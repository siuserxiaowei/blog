import assert from 'node:assert/strict';
import test from 'node:test';

import { evaluateCompetitionIntake } from '../src/lib/competition-curation.js';
import { getCompetitionEntryStatus } from '../src/lib/competition-entry-status.js';
import {
  competitions,
  getPrimaryDeadline,
  validateCompetitionCollectionV2,
  validateCompetitions,
} from '../src/data/competitions.js';
import {
  ROUND10_ADDITIONS_CHECKED_AT,
  competitionRound10Additions,
} from '../src/data/competition-round10-additions.js';
import { competitionRound10Corrections } from '../src/data/competition-round10-corrections.js';

const researchDate = '2026-08-06';
const expectedAdditionIds = new Set([
  'huawei-cloud-embodied-intelligence-2026',
  'tencent-cloud-game-dev-hackathon-2026',
  'alibaba-cloud-ai-hackathon-pakistan-2026',
]);
const additionsById = new Map(competitionRound10Additions.map((item) => [item.id, item]));
const finalById = new Map(competitions.map((item) => [item.id, item]));

test('round ten adds three separately verified big-tech events without duplicates', () => {
  assert.equal(ROUND10_ADDITIONS_CHECKED_AT, researchDate);
  assert.deepEqual(new Set(additionsById.keys()), expectedAdditionIds);
  assert.equal(competitionRound10Additions.length, expectedAdditionIds.size);
  assert.equal(competitions.length, 439);
  assert.equal(new Set(competitions.map((item) => item.id)).size, competitions.length);
  for (const id of expectedAdditionIds) assert.ok(finalById.has(id), id);
});

test('Huawei Cloud embodied-intelligence contest is open only to eligible domestic full-time students', () => {
  const competition = additionsById.get('huawei-cloud-embodied-intelligence-2026');

  assert.equal(getCompetitionEntryStatus(competition, researchDate), 'open-to-new');
  assert.equal(getPrimaryDeadline(competition).type, 'registration');
  assert.equal(getPrimaryDeadline(competition).date, '2026-08-30');
  assert.equal(competition.eligibility.scope, 'students-only');
  assert.equal(competition.eligibility.chinaEligible, 'yes');
  assert.match(competition.audience, /专科生|本科生/);
  assert.match(competition.audience, /不含在职研究生/);
  assert.match(competition.eligibility.team, /单人|2.?3/);
  assert.match(competition.cons.join(' '), /4.?7/);
  assert.equal(competition.prizeBoundary.cash[0].amount, 88000);
});

test('Tencent Cloud university game hackathon is not confused with the open Tencent creator competition', () => {
  const competition = additionsById.get('tencent-cloud-game-dev-hackathon-2026');
  const creatorCompetition = finalById.get('tencentgamecreator2026');

  assert.equal(competition.entryStatus, 'registered-only');
  assert.equal(getPrimaryDeadline(competition).type, 'registration');
  assert.equal(getPrimaryDeadline(competition).date, '2026-07-15');
  assert.equal(competition.eligibility.scope, 'students-only');
  assert.match(competition.audience, /全球高校/);
  assert.match(competition.timeline.at(-1).event, /决赛/);
  assert.equal(competition.timeline.at(-1).date, '2026-09-13');
  assert.equal(competition.prizeBoundary.cash[0].amount, 1000000);
  assert.notEqual(competition.url, creatorCompetition.url);
  assert.equal(creatorCompetition.deadlineISO, '2026-09-15');
});

test('Alibaba Cloud Pakistan hackathon keeps its national eligibility and undisclosed cash amount explicit', () => {
  const competition = additionsById.get('alibaba-cloud-ai-hackathon-pakistan-2026');

  assert.equal(getCompetitionEntryStatus(competition, researchDate), 'open-to-new');
  assert.equal(getPrimaryDeadline(competition).date, '2026-09-10');
  assert.equal(competition.eligibility.scope, 'country-limited');
  assert.equal(competition.eligibility.chinaEligible, 'no');
  assert.equal(competition.prizeBoundary.cash.length, 0);
  assert.equal(competition.prizeBoundary.cashStatus, 'amount-not-stated');
  assert.match(competition.rewards.join(' '), /开幕式|opening ceremony/i);
  assert.match(competition.rewards.join(' '), /证书/);
});

test('GOAI is corrected as an open global competition promoted by Atom Commune with exact track deadlines', () => {
  const competition = finalById.get('goai');

  assert.ok(competitionRound10Corrections.goai);
  assert.equal(competition.entryStatus, 'open-to-new');
  assert.equal(competition.url, 'https://goaihz.com/');
  assert.equal(getPrimaryDeadline(competition).date, '2026-08-16');
  assert.deepEqual(
    competition.timeline.map((item) => item.date),
    ['2026-07-16', '2026-08-16', '2026-08-20', '2026-09-03', '2026-09-22', '2026-09-23'],
  );
  assert.match(competition.desc, /原子公社/);
  assert.match(competition.desc, /生态支持|联合宣发/);
  assert.match(competition.rewards.join(' '), /500\s*万/);
  assert.match(competition.rewards.join(' '), /100\s*万/);
});

test('Meituan correction points to the event site and states the student-only real-robot gate', () => {
  const competition = finalById.get('meituan-lowaltitude-embodied-2026');

  assert.ok(competitionRound10Corrections['meituan-lowaltitude-embodied-2026']);
  assert.equal(competition.url, 'https://uav-challenge.meituan.com/');
  assert.equal(getPrimaryDeadline(competition).date, '2026-09-01');
  assert.deepEqual(
    competition.timeline.map((item) => item.date),
    ['2026-07-22', '2026-09-01', '2026-09-02', '2026-10-25', '2026-10-26', '2026-11-20'],
  );
  assert.match(competition.audience, /企业不得参赛/);
  assert.match(competition.cons.join(' '), /真实机器人/);
  assert.equal(competition.verification.status, 'verified');
});

test('old Botzone tank contests and the already-finished 2026 Mahjong contest are not presented as new entries', () => {
  const text = competitionRound10Additions
    .map((item) => `${item.name} ${item.fullName}`)
    .join(' ');

  assert.doesNotMatch(text, /坦克大战|Botzone|麻将/);
  assert.equal(competitions.filter((item) => /坦克大战/.test(item.name)).length, 0);
  assert.equal(competitions.filter((item) => /第六届国际麻将人工智能比赛/.test(item.name)).length, 0);
});

test('round-ten intake contains software, algorithms or playable builds rather than video/music-only contests', () => {
  assert.deepEqual(validateCompetitions(competitionRound10Additions).errors, []);
  assert.deepEqual(validateCompetitionCollectionV2(competitionRound10Additions).errors, []);
  assert.deepEqual(validateCompetitions(competitions).errors, []);

  for (const competition of competitionRound10Additions) {
    assert.equal(evaluateCompetitionIntake(competition).decision, 'include', competition.id);
    assert.equal(competition.verification.checkedAt, researchDate, competition.id);
    assert.ok(
      competition.curation.primaryFormats.some((format) => (
        ['software-product', 'agent', 'algorithm', 'game-build', 'robotics'].includes(format)
      )),
      competition.id,
    );
  }
});
