import assert from 'node:assert/strict';
import test from 'node:test';

import { competitions } from '../src/data/competitions.js';
import {
  buildCompetitionReviewQueue,
  parseArgs,
  reviewCompetition,
  summarizeReviewQueue,
} from '../scripts/competition-review-queue.mjs';

const today = new Date('2026-07-30T00:00:00+08:00');

function fixture(overrides = {}) {
  return {
    id: 'fixture',
    name: 'Fixture',
    deadlineISO: '2026-08-02',
    primaryDeadline: {
      type: 'submission',
      date: '2026-08-02',
      certainty: 'confirmed',
      label: '提交截止',
    },
    verification: {
      status: 'unverified',
      checkedAt: '2026-07-30',
      linkHealth: 'unchecked',
    },
    sources: [{ title: 'Source', url: 'https://example.com', kind: 'reported' }],
    ...overrides,
  };
}

test('urgent unverified records rise to critical priority', () => {
  const entry = reviewCompetition(fixture(), { today });
  assert.equal(entry.priority, 'critical');
  assert.ok(entry.reasons.some((reason) => reason.code === 'urgent-unverified'));
  assert.equal(entry.primaryDeadline.days, 3);
});

test('estimated dates are reviewable but never treated as urgent confirmed dates', () => {
  const entry = reviewCompetition(fixture({
    primaryDeadline: {
      type: 'submission',
      date: '2026-08-02',
      certainty: 'estimated',
      label: '预计截止',
    },
  }), { today });
  assert.ok(entry.reasons.some((reason) => reason.code === 'uncertain-deadline'));
  assert.ok(!entry.reasons.some((reason) => reason.code === 'urgent-unverified'));
});

test('dead links outrank ordinary unverified records', () => {
  const dead = reviewCompetition(fixture({
    id: 'dead',
    verification: {
      status: 'partially-verified',
      checkedAt: '2026-07-30',
      linkHealth: 'dead',
    },
  }), { today });
  const ordinary = reviewCompetition(fixture({ id: 'ordinary' }), { today });
  assert.ok(dead.score > ordinary.score);
  assert.equal(dead.priority, 'critical');
});

test('queue ordering and summary are deterministic', () => {
  const queue = buildCompetitionReviewQueue([
    fixture({ id: 'ordinary' }),
    fixture({
      id: 'dead',
      verification: {
        status: 'partially-verified',
        checkedAt: '2026-07-30',
        linkHealth: 'dead',
      },
    }),
  ], { today });
  assert.deepEqual(queue.map((entry) => entry.id), ['dead', 'ordinary']);
  assert.equal(summarizeReviewQueue(queue).total, 2);
});

test('CLI options are bounded and explicit', () => {
  const options = parseArgs([
    '--today', '2026-07-30',
    '--limit', '12',
    '--urgent-days', '10',
    '--stale-days', '21',
    '--json',
  ]);
  assert.equal(options.limit, 12);
  assert.equal(options.urgentDays, 10);
  assert.equal(options.staleDays, 21);
  assert.equal(options.json, true);
  assert.throws(() => parseArgs(['--limit', '0']), /positive integer/);
  assert.throws(() => parseArgs(['--unknown']), /Unknown argument/);
});

test('real collection produces actionable rows without duplicate IDs', () => {
  const queue = buildCompetitionReviewQueue(competitions, { today });
  assert.ok(queue.length > 0);
  assert.equal(new Set(queue.map((entry) => entry.id)).size, queue.length);
  assert.ok(queue.some((entry) => entry.id === 'stepsoftware2026'));
  assert.ok(queue.some((entry) => entry.reasons.some((reason) => reason.code === 'urgent-unverified')));
});

