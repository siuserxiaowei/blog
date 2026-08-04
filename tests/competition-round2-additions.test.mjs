import assert from 'node:assert/strict';
import test from 'node:test';

import {
  COMPETITION_CATEGORIES,
  REQUIRED_COMPETITION_FIELDS,
  competitions,
  getPrimaryDeadline,
  validateCompetitionCollectionV2,
  validateCompetitions,
} from '../src/data/competitions.js';
import {
  ROUND2_ADDITIONS_CHECKED_AT,
  competitionRound2Additions,
} from '../src/data/competition-round2-additions.js';
import { getCompetitionEntryStatus } from '../src/lib/competition-entry-status.js';

const additionsById = new Map(
  competitionRound2Additions.map((competition) => [competition.id, competition]),
);
const researchCutoff = '2026-07-30';

test('round-two additions stay within the requested 10–20 record delivery range', () => {
  assert.equal(ROUND2_ADDITIONS_CHECKED_AT, researchCutoff);
  assert.equal(competitions.length, 313, 'final merged catalogue changed unexpectedly');
  assert.equal(competitionRound2Additions.length, 18);
});

test('addition ids are internally unique and present exactly once in the merged catalogue', () => {
  const ids = competitionRound2Additions.map((competition) => competition.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) {
    assert.equal(
      competitions.filter((competition) => competition.id === id).length,
      1,
      id,
    );
  }
});

test('every addition satisfies the legacy and V2 data contracts', () => {
  assert.deepEqual(validateCompetitions(competitionRound2Additions).errors, []);
  assert.deepEqual(validateCompetitionCollectionV2(competitionRound2Additions).errors, []);

  for (const competition of competitionRound2Additions) {
    for (const field of REQUIRED_COMPETITION_FIELDS) {
      const value = competition[field];
      assert.notEqual(value, undefined, `${competition.id}.${field}`);
      assert.notEqual(value, null, `${competition.id}.${field}`);
      assert.notEqual(value, '', `${competition.id}.${field}`);
      if (Array.isArray(value)) assert.ok(value.length > 0, `${competition.id}.${field}`);
    }
    assert.ok(COMPETITION_CATEGORIES.includes(competition.cat), competition.id);
  }
});

test('verified additions use only official, access-dated sources', () => {
  for (const competition of competitionRound2Additions) {
    assert.equal(competition.verification.status, 'verified', competition.id);
    assert.equal(competition.verification.sourceKind, 'official', competition.id);
    assert.equal(competition.verification.checkedAt, researchCutoff, competition.id);
    assert.equal(competition.verification.linkHealth, 'reachable', competition.id);
    assert.ok(competition.sources.length > 0, competition.id);

    for (const source of competition.sources) {
      assert.equal(source.kind, 'official', `${competition.id}: ${source.url}`);
      assert.equal(source.date, researchCutoff, `${competition.id}: ${source.url}`);
      assert.match(source.url, /^https?:\/\//, `${competition.id}: ${source.url}`);
    }
  }
});

test('every primary deadline is confirmed, actionable, sourced, and still upcoming at cutoff', () => {
  const actionableTypes = new Set(['application', 'entry', 'registration', 'submission']);

  for (const competition of competitionRound2Additions) {
    const primary = getPrimaryDeadline(competition);
    assert.equal(primary.certainty, 'confirmed', competition.id);
    assert.match(primary.date, /^\d{4}-\d{2}-\d{2}$/, competition.id);
    assert.ok(primary.date > researchCutoff, `${competition.id}: ${primary.date}`);
    assert.ok(actionableTypes.has(primary.type), `${competition.id}: ${primary.type}`);
    assert.ok(primary.timezone, competition.id);
    assert.match(primary.sourceUrl, /^https?:\/\//, competition.id);
    assert.ok(
      competition.sources.some((source) => source.url === primary.sourceUrl),
      `${competition.id}: primary deadline source must be retained in sources`,
    );
    assert.equal(competition.deadlineISO, primary.date, competition.id);
  }
});

test('region eligibility, fee, and team boundaries are explicit for every addition', () => {
  const chinaEligibilityValues = new Set(['yes', 'no', 'not-stated', 'yes-with-travel']);

  for (const competition of competitionRound2Additions) {
    assert.ok(competition.eligibility?.scope, competition.id);
    assert.ok(Array.isArray(competition.eligibility?.regions), competition.id);
    assert.ok(competition.eligibility.regions.length > 0, competition.id);
    assert.ok(
      chinaEligibilityValues.has(competition.eligibility.chinaEligible),
      `${competition.id}: ${competition.eligibility.chinaEligible}`,
    );
    assert.ok(competition.eligibility.fee, competition.id);
    assert.ok(competition.eligibility.team, competition.id);

    if (competition.eligibility.chinaEligible === 'no') {
      assert.match(competition.suit, /低/, competition.id);
    }
  }
});

test('cash, non-cash, and investment benefits are structurally separated', () => {
  for (const competition of competitionRound2Additions) {
    assert.ok(Array.isArray(competition.prizeBoundary?.cash), competition.id);
    assert.ok(Array.isArray(competition.prizeBoundary?.nonCash), competition.id);
    assert.ok(Array.isArray(competition.prizeBoundary?.investment), competition.id);

    for (const cash of competition.prizeBoundary.cash) {
      assert.match(cash.currency, /^[A-Z]{3}$/, competition.id);
      assert.ok(Number.isFinite(cash.amount) && cash.amount > 0, competition.id);
      assert.ok(cash.scope, competition.id);
    }
  }

  assert.deepEqual(additionsById.get('indehub-hackathon-2026').prizeBoundary.cash, []);
  assert.match(
    additionsById.get('indehub-hackathon-2026').rewards.join(' '),
    /不应视为全现金/,
  );
  assert.equal(
    additionsById.get('supernova-0x-2026').prizeBoundary.cash[0].amount,
    200000,
  );
});

test('qualification-sensitive additions preserve their decisive constraints', () => {
  const squareEnix = additionsById.get('square-enix-game-contest-2026');
  assert.equal(squareEnix.eligibility.chinaEligible, 'no');
  assert.match(squareEnix.eligibility.regions.join(' '), /日本/);
  assert.equal(squareEnix.deadlines.find((deadline) => deadline.type === 'opening').date, '2026-12-15');

  const indeHub = additionsById.get('indehub-hackathon-2026');
  assert.equal(getPrimaryDeadline(indeHub).type, 'registration');
  assert.equal(getPrimaryDeadline(indeHub).date, '2026-07-31');
  const registration = indeHub.deadlines.find((deadline) => deadline.type === 'registration');
  assert.equal(registration.date, '2026-07-31');
  assert.equal(registration.primary, true);

  const aicomp = additionsById.get('aicomp-agent-development-2026');
  assert.match(aicomp.audience, /正式学籍/);
  assert.match(aicomp.audience, /不得跨校/);
  assert.match(aicomp.cons.join(' '), /500 元/);

  const hkAigc = additionsById.get('hong-kong-aigc-culture-2026');
  assert.match(hkAigc.audience, /社会人士/);
  assert.match(hkAigc.cons.join(' '), /280 元/);
  assert.match(hkAigc.verification.notes, /香港教育促进会/);

  const festiav = additionsById.get('festiav-valencia-2026');
  assert.equal(getPrimaryDeadline(festiav).date, '2026-10-04');
  assert.match(festiav.verification.notes, /10 月 15 日\/20 日冲突/);
});

test('IndeHub closes to new entrants after registration while preserving submission access', () => {
  const indeHub = additionsById.get('indehub-hackathon-2026');
  assert.equal(getCompetitionEntryStatus(indeHub, '2026-08-02'), 'registered-only');
  const submission = indeHub.deadlines.find((deadline) => deadline.type === 'submission');
  assert.equal(submission.date, '2026-08-07');
  assert.equal(submission.primary, false);
});
