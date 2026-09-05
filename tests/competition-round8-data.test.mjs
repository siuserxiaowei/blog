import assert from 'node:assert/strict';
import test from 'node:test';

import { evaluateCompetitionIntake } from '../src/lib/competition-curation.js';
import { competitionRound8Corrections } from '../src/data/competition-round8-corrections.js';
import {
  competitions,
  getPrimaryDeadline,
  validateCompetitions,
} from '../src/data/competitions.js';

const expectedId = 'xiaoyoukewei-ai-good-2026';
const finalById = new Map(competitions.map((competition) => [competition.id, competition]));

test('round eight enriches the existing Xiaoyoukewei record without duplicating it', () => {
  assert.deepEqual(Object.keys(competitionRound8Corrections), [expectedId]);
  assert.ok(finalById.has(expectedId));
  assert.equal(competitions.length, 439);
  assert.equal(new Set(competitions.map((competition) => competition.id)).size, competitions.length);
  assert.equal(competitions.filter((competition) => competition.url.includes('/xiaoyoukewei')).length, 1);
});

test('Xiaoyoukewei keeps the official deadline, timeline and CNY 210,000 prize breakdown', () => {
  const competition = finalById.get(expectedId);
  const primary = getPrimaryDeadline(competition);

  assert.equal(primary.date, '2026-08-13');
  assert.equal(primary.type, 'submission');
  assert.equal(primary.certainty, 'confirmed');
  assert.equal(primary.timezone, 'Asia/Shanghai');
  assert.deepEqual(
    competition.timeline.map((item) => item.date),
    ['2026-08-13', '2026-08-21', '2026-09-03', '2026-09-05'],
  );
  assert.equal(
    competition.prizeBoundary.cash.reduce((total, prize) => total + (prize.amount * (prize.quantity ?? 1)), 0),
    210000,
  );
  assert.match(competition.desc, /四大公益场景/);
  assert.match(competition.desc, /每赛题 Top 10/);
});

test('Xiaoyoukewei is an AI application competition, not a video or music-only contest', () => {
  const competition = finalById.get(expectedId);
  assert.deepEqual(competition.curation.primaryFormats, ['software-product', 'agent']);
  assert.equal(evaluateCompetitionIntake(competition).decision, 'include');
  assert.match(competition.strategy, /教师 AI 助教|化学品安全评测 Agent/);
});

test('round-eight correction keeps the complete catalogue valid', () => {
  assert.deepEqual(validateCompetitions(competitions).errors, []);
});
