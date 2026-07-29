import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildCompetitionDeadlineIcs,
  getCompetitionDeadlineInfo,
} from '../src/lib/competition-radar.js';

test('primary deadline certainty overrides broad record verification', () => {
  const competition = {
    deadlineISO: '2026-09-30',
    primaryDeadline: {
      type: 'submission',
      date: '2026-09-30',
      certainty: 'estimated',
      label: '预计提交截止',
    },
    verification: { status: 'verified' },
  };

  assert.deepEqual(getCompetitionDeadlineInfo(competition), {
    date: '2026-09-30',
    confidence: 'estimated',
    type: 'submission',
    label: '预计提交截止',
    calendarEligible: false,
  });
  assert.throws(
    () => buildCompetitionDeadlineIcs(competition),
    /not confirmed/,
  );
});

test('calendar export uses the actual primary deadline label', () => {
  const ics = buildCompetitionDeadlineIcs({
    id: 'intent-first',
    name: '互动作品赛',
    primaryDeadline: {
      type: 'intent',
      date: '2026-08-01',
      certainty: 'confirmed',
      label: '参赛意向截止',
    },
    verification: { status: 'verified' },
    url: 'https://example.com/rules',
  }, {
    now: new Date('2026-07-30T00:00:00Z'),
  });

  assert.match(ics, /SUMMARY:参赛意向截止｜互动作品赛/);
  assert.match(ics, /DTSTART;VALUE=DATE:20260801/);
  assert.match(ics, /DTEND;VALUE=DATE:20260802/);
});
