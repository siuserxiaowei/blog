import assert from 'node:assert/strict';
import test from 'node:test';

import {
  COMPETITION_ENTRY_STATUSES,
  getCompetitionEntryStatus,
} from '../src/lib/competition-entry-status.js';

function deadline(type, date, timezone = 'UTC') {
  return { type, date, certainty: 'confirmed', timezone };
}

test('explicit supported status wins and the function only returns contract values', () => {
  for (const status of COMPETITION_ENTRY_STATUSES) {
    assert.equal(getCompetitionEntryStatus({ entryStatus: status }, '2026-08-02'), status);
  }

  const result = getCompetitionEntryStatus({ entryStatus: 'maybe' }, '2026-08-02');
  assert.ok(COMPETITION_ENTRY_STATUSES.includes(result));
  assert.equal(result, 'unknown');
});

test('registration-like gate deadlines are inclusive on their local calendar day', () => {
  for (const type of ['registration', 'application', 'entry', 'intent']) {
    const record = { deadlines: [deadline(type, '2026-08-24', 'Asia/Shanghai')] };
    assert.equal(getCompetitionEntryStatus(record, '2026-08-24'), 'open-to-new', type);
    assert.equal(getCompetitionEntryStatus(record, '2026-08-25'), 'closed', type);
  }
});

test('an opening date blocks entry before it starts and permits entry on the opening day', () => {
  const record = {
    deadlineTimezone: 'JST / Asia/Tokyo',
    opensAt: '2026-12-15',
    submission: '2027-03-15',
  };

  assert.equal(
    getCompetitionEntryStatus(record, new Date('2026-12-14T14:59:59Z')),
    'not-open-yet',
  );
  assert.equal(
    getCompetitionEntryStatus(record, new Date('2026-12-14T15:00:00Z')),
    'open-to-new',
  );
});

test('gate and submission status switches at midnight in the deadline timezone', () => {
  const record = {
    deadlines: [
      deadline('registration', '2026-08-24', 'Asia/Shanghai'),
      deadline('submission', '2026-08-25', 'Asia/Shanghai'),
    ],
  };

  assert.equal(
    getCompetitionEntryStatus(record, new Date('2026-08-24T15:59:59Z')),
    'open-to-new',
  );
  assert.equal(
    getCompetitionEntryStatus(record, new Date('2026-08-24T16:00:00Z')),
    'registered-only',
  );
  assert.equal(
    getCompetitionEntryStatus(record, new Date('2026-08-25T15:59:59Z')),
    'registered-only',
  );
  assert.equal(
    getCompetitionEntryStatus(record, new Date('2026-08-25T16:00:00Z')),
    'closed',
  );
});

test('submission-only data never claims that a new entrant can still register', () => {
  const record = { deadlines: [deadline('submission', '2026-08-25')] };
  assert.equal(getCompetitionEntryStatus(record, '2026-08-24'), 'unknown');
  assert.equal(getCompetitionEntryStatus(record, '2026-08-25'), 'unknown');
  assert.equal(getCompetitionEntryStatus(record, '2026-08-26'), 'closed');
});

test('top-level lifecycle fields and estimated dates are handled conservatively', () => {
  const topLevel = {
    registration: '2026-08-24',
    submission: '2026-08-25',
    deadlineTimezone: 'Asia/Shanghai',
  };
  assert.equal(getCompetitionEntryStatus(topLevel, '2026-08-24'), 'open-to-new');
  assert.equal(getCompetitionEntryStatus(topLevel, '2026-08-25'), 'registered-only');

  const estimated = {
    deadlines: [{
      type: 'submission',
      date: '2026-08-25',
      certainty: 'estimated',
      timezone: 'UTC',
    }],
  };
  assert.equal(getCompetitionEntryStatus(estimated, '2026-08-24'), 'unknown');
  assert.equal(getCompetitionEntryStatus(topLevel), 'unknown');
});
