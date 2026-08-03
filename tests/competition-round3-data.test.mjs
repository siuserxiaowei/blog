import assert from 'node:assert/strict';
import test from 'node:test';

import {
  COMPETITION_CATEGORIES,
  RADAR_UPDATED_AT,
  REQUIRED_COMPETITION_FIELDS,
  competitions,
  getPrimaryDeadline,
  validateCompetitionCollectionV2,
  validateCompetitions,
} from '../src/data/competitions.js';
import {
  ROUND3_ADDITIONS_CHECKED_AT,
  competitionRound3Additions,
} from '../src/data/competition-round3-additions.js';
import {
  ROUND3_CORRECTIONS_CHECKED_AT,
  competitionRound3Corrections,
} from '../src/data/competition-round3-corrections.js';

const researchDate = '2026-08-02';
const additionsById = new Map(
  competitionRound3Additions.map((competition) => [competition.id, competition]),
);
const competitionsById = new Map(
  competitions.map((competition) => [competition.id, competition]),
);

test('round-three catalogue date and delivery size are explicit', () => {
  assert.equal(RADAR_UPDATED_AT, researchDate);
  assert.equal(ROUND3_ADDITIONS_CHECKED_AT, researchDate);
  assert.equal(ROUND3_CORRECTIONS_CHECKED_AT, researchDate);
  assert.equal(competitionRound3Additions.length, 8);
  assert.equal(competitions.length, 271);
});

test('addition and final catalogue ids are unique', () => {
  const additionIds = competitionRound3Additions.map((competition) => competition.id);
  const finalIds = competitions.map((competition) => competition.id);
  assert.equal(new Set(additionIds).size, additionIds.length);
  assert.equal(new Set(finalIds).size, finalIds.length);
  for (const id of additionIds) {
    assert.equal(finalIds.filter((candidate) => candidate === id).length, 1, id);
  }
});

test('round-three additions satisfy legacy and V2 schemas', () => {
  assert.deepEqual(validateCompetitions(competitionRound3Additions).errors, []);
  assert.deepEqual(validateCompetitionCollectionV2(competitionRound3Additions).errors, []);
  assert.deepEqual(validateCompetitions(competitions).errors, []);

  for (const competition of competitionRound3Additions) {
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

test('every addition retains official HTTP(S) evidence with the access date', () => {
  for (const competition of competitionRound3Additions) {
    assert.equal(competition.verification.status, 'verified', competition.id);
    assert.equal(competition.verification.sourceKind, 'official', competition.id);
    assert.equal(competition.verification.checkedAt, researchDate, competition.id);
    assert.ok(competition.sources.length > 0, competition.id);

    for (const source of competition.sources) {
      assert.equal(source.kind, 'official', `${competition.id}: ${source.url}`);
      assert.equal(source.date, researchDate, `${competition.id}: ${source.url}`);
      assert.match(source.url, /^https?:\/\//, `${competition.id}: ${source.url}`);
    }
  }
});

test('every addition has a confirmed actionable sourced deadline after research day', () => {
  const actionableTypes = new Set(['application', 'entry', 'intent', 'registration', 'submission']);

  for (const competition of competitionRound3Additions) {
    const primary = getPrimaryDeadline(competition);
    assert.equal(primary.certainty, 'confirmed', competition.id);
    assert.ok(primary.date > researchDate, `${competition.id}: ${primary.date}`);
    assert.ok(actionableTypes.has(primary.type), `${competition.id}: ${primary.type}`);
    assert.ok(primary.timezone, competition.id);
    assert.match(primary.sourceUrl, /^https?:\/\//, competition.id);
    assert.ok(
      competition.sources.some((source) => source.url === primary.sourceUrl),
      `${competition.id}: primary source must be retained`,
    );
    assert.equal(competition.deadlineISO, primary.date, competition.id);
  }
});

test('eligibility, fee, team and prize boundaries are explicit without guessed cash', () => {
  const chinaEligibilityValues = new Set(['yes', 'no', 'not-stated', 'yes-with-travel']);

  for (const competition of competitionRound3Additions) {
    assert.ok(competition.eligibility?.scope, competition.id);
    assert.ok(competition.eligibility?.regions?.length > 0, competition.id);
    assert.ok(chinaEligibilityValues.has(competition.eligibility.chinaEligible), competition.id);
    assert.ok(competition.eligibility.fee, competition.id);
    assert.ok(competition.eligibility.team, competition.id);
    assert.ok(Array.isArray(competition.prizeBoundary?.cash), competition.id);
    assert.ok(Array.isArray(competition.prizeBoundary?.nonCash), competition.id);
    assert.ok(Array.isArray(competition.prizeBoundary?.investment), competition.id);
  }

  assert.equal(additionsById.get('xiaoyoukewei-ai-good-2026').eligibility.fee, 'not-stated');
  assert.equal(additionsById.get('new-domain-new-quality-2026').prizeBoundary.cash.length, 0);
  assert.equal(additionsById.get('hackacon-2026').prizeBoundary.cash.length, 0);
});

test('recommendation, institution and student gates are prominent', () => {
  const referral = additionsById.get('new-domain-new-quality-2026');
  assert.match(referral.name, /须推荐/);
  assert.equal(referral.cat, '地区限定');
  assert.match(referral.audience, /推荐/);
  assert.match(referral.cons.join(' '), /推荐制/);

  const graduate = additionsById.get('binzhi-graduate-robot-2026');
  assert.match(graduate.name, /学生限定/);
  assert.equal(graduate.cat, '学生限定');
  assert.match(graduate.audience, /队长须为在读研究生/);
  assert.match(graduate.cons.join(' '), /学籍/);

  const institution = additionsById.get('zhixin-2026-creative');
  assert.match(institution.name, /机构组队/);
  assert.equal(institution.cat, '地区限定');
  assert.match(institution.audience, /企事业单位/);
  assert.match(institution.cons.join(' '), /中国国籍/);
});

test('round-three correction sidecar targets existing records with dated provenance', () => {
  const correctionIds = Object.keys(competitionRound3Corrections);
  assert.deepEqual(new Set(correctionIds), new Set([
    'agenticcinema2026',
    'waxalasr2026',
    'unescohack2026',
    'roblox-inspire-2026',
    'nanningopc2026',
    'calle',
    'pazhou-super-claw-2026',
  ]));

  for (const [id, patch] of Object.entries(competitionRound3Corrections)) {
    assert.ok(competitionsById.has(id), id);
    assert.equal(patch.verification.checkedAt, researchDate, id);
    assert.ok(patch.sources.length > 0, id);
    for (const item of patch.sources) {
      assert.equal(item.date, researchDate, `${id}: ${item.url}`);
      assert.match(item.url, /^https?:\/\//, `${id}: ${item.url}`);
    }
  }
});

test('cash, eligibility and deadline corrections match the reviewed evidence', () => {
  const agentic = competitionsById.get('agenticcinema2026');
  assert.equal(agentic.prizeBoundary.cash.reduce((sum, item) => sum + item.amount, 0), 65000);
  assert.equal(agentic.prizeBoundary.cash.length, 5);
  assert.match(agentic.rewards.join(' '), /\$7,500/);
  assert.match(agentic.verification.notes, /USD 75,000/);
  assert.equal(agentic.eligibility.chinaEligible, 'no');

  const waxal = competitionsById.get('waxalasr2026');
  assert.equal(waxal.deadlineISO, '2026-08-09');
  assert.equal(getPrimaryDeadline(waxal).date, '2026-08-09');
  assert.match(waxal.cons.join(' '), /版权转让/);

  const unesco = competitionsById.get('unescohack2026');
  assert.equal(unesco.cat, '青年限定');
  assert.match(unesco.audience, /18–30/);
  assert.match(unesco.audience, /2–6/);
  assert.match(unesco.audience, /不要求学生身份/);

  const roblox = competitionsById.get('roblox-inspire-2026');
  assert.deepEqual(roblox.prizeBoundary.cash, []);
  assert.match(roblox.prizeBoundary.nonCash.join(' '), /600 \/ 400 \/ 200 GoGift/);
  assert.match(roblox.prizeBoundary.nonCash.join(' '), /1,000 GoGift/);
});

test('uncertain and conflicting records cannot masquerade as confirmed facts', () => {
  const nanning = competitionsById.get('nanningopc2026');
  assert.equal(nanning.verification.status, 'partially-verified');
  assert.equal(getPrimaryDeadline(nanning).certainty, 'confirmed');
  assert.equal(getPrimaryDeadline(nanning).date, '2026-08-20');
  assert.match(nanning.verification.notes, /不等同直接打开政府原文/);

  const callE = competitionsById.get('calle');
  assert.equal(callE.verification.status, 'partially-verified');
  assert.equal(getPrimaryDeadline(callE).timezone, 'Asia/Singapore');
  assert.match(getPrimaryDeadline(callE).label, /23:45 \/ 11:45/);
  assert.match(callE.verification.notes, /按较早时刻准备/);

  const superClaw = competitionsById.get('pazhou-super-claw-2026');
  assert.equal(getPrimaryDeadline(superClaw).date, '2026-08-05');
  assert.equal(superClaw.prizeBoundary.provisional, true);
  assert.equal(superClaw.prizeBoundary.tax, 'gross');
  assert.match(superClaw.verification.notes, /2026-07-15/);
  assert.match(superClaw.verification.notes, /2026-08-05/);
});
