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
  ROUND9_ADDITIONS_CHECKED_AT,
  competitionRound9Additions,
} from '../src/data/competition-round9-additions.js';

const researchDate = '2026-08-06';
const expectedIds = new Set([
  'trae-ai-creativity-2026',
  'trae-solo-workplace-challenge-2026',
  'tencent-workbuddy-agent-singapore-2026',
  'tencent-workbuddy-autism-hk-2026',
  'qoder-hackathon-singapore-2026',
  'qoder-agentic-ai-vietnam-2026',
]);
const additionsById = new Map(competitionRound9Additions.map((item) => [item.id, item]));
const finalById = new Map(competitions.map((item) => [item.id, item]));

test('round nine adds the six missing TRAE, WorkBuddy and Qoder events once', () => {
  assert.equal(ROUND9_ADDITIONS_CHECKED_AT, researchDate);
  assert.equal(competitionRound9Additions.length, expectedIds.size);
  assert.deepEqual(new Set(additionsById.keys()), expectedIds);
  assert.equal(competitions.length, 439);
  assert.equal(new Set(competitions.map((item) => item.id)).size, competitions.length);
  for (const id of expectedIds) assert.ok(finalById.has(id), id);
});

test('only the two WorkBuddy regional events remain open on the research date', () => {
  const openIds = competitionRound9Additions
    .filter((item) => getCompetitionEntryStatus(item, researchDate) === 'open-to-new')
    .map((item) => item.id)
    .sort();

  assert.deepEqual(openIds, [
    'tencent-workbuddy-agent-singapore-2026',
    'tencent-workbuddy-autism-hk-2026',
  ]);
  assert.equal(getPrimaryDeadline(additionsById.get('tencent-workbuddy-agent-singapore-2026')).date, '2026-08-14');
  assert.equal(getPrimaryDeadline(additionsById.get('tencent-workbuddy-autism-hk-2026')).date, '2026-08-18');
});

test('regional gates are explicit before WorkBuddy events can be recommended', () => {
  const singapore = additionsById.get('tencent-workbuddy-agent-singapore-2026');
  const hongKong = additionsById.get('tencent-workbuddy-autism-hk-2026');

  assert.equal(singapore.eligibility.scope, 'country-limited');
  assert.equal(singapore.eligibility.chinaEligible, 'no');
  assert.match(singapore.audience, /Singapore-based/);
  assert.match(singapore.eligibility.team, /1.?3/);

  assert.equal(hongKong.eligibility.chinaEligible, 'yes-with-travel');
  assert.match(hongKong.audience, /香港|周边地区/);
  assert.match(hongKong.cons.join(' '), /香港线下/);
});

test('cash figures keep regional, global and historical prize boundaries separate', () => {
  const singapore = additionsById.get('tencent-workbuddy-agent-singapore-2026');
  assert.deepEqual(
    singapore.prizeBoundary.cash.filter((item) => item.currency === 'SGD').map((item) => item.amount),
    [3000, 2000, 1000],
  );
  assert.deepEqual(
    singapore.prizeBoundary.cash.filter((item) => item.currency === 'CNY').map((item) => item.amount),
    [50000, 30000, 20000],
  );
  assert.match(singapore.verification.notes, /450,000/);

  const trae = additionsById.get('trae-ai-creativity-2026');
  assert.equal(
    trae.prizeBoundary.cash.reduce((sum, item) => sum + item.amount * (item.quantity ?? 1), 0),
    1130000,
  );

  const solo = additionsById.get('trae-solo-workplace-challenge-2026');
  assert.equal(
    solo.prizeBoundary.cash.reduce((sum, item) => sum + item.amount * (item.quantity ?? 1), 0),
    70000,
  );
  assert.match(solo.curation.rewardEvidence, /1000|300/);
});

test('all six records are software or Agent opportunities and satisfy both schemas', () => {
  assert.deepEqual(validateCompetitions(competitionRound9Additions).errors, []);
  assert.deepEqual(validateCompetitionCollectionV2(competitionRound9Additions).errors, []);
  assert.deepEqual(validateCompetitions(competitions).errors, []);

  for (const competition of competitionRound9Additions) {
    assert.equal(evaluateCompetitionIntake(competition).decision, 'include', competition.id);
    assert.ok(
      competition.curation.primaryFormats.some((format) => ['software-product', 'agent'].includes(format)),
      competition.id,
    );
    assert.equal(competition.verification.checkedAt, researchDate, competition.id);
  }
});
