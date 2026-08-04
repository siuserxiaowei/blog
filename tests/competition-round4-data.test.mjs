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
  ROUND4_ADDITIONS_CHECKED_AT,
  competitionRound4Additions,
} from '../src/data/competition-round4-additions.js';
import {
  ROUND4_CORRECTIONS_CHECKED_AT,
  competitionRound4Corrections,
} from '../src/data/competition-round4-corrections.js';

const researchDate = '2026-08-02';
const additionsById = new Map(competitionRound4Additions.map((item) => [item.id, item]));
const finalById = new Map(competitions.map((item) => [item.id, item]));

function canonicalUrl(raw) {
  const url = new URL(raw);
  const path = url.pathname.replace(/\/+$/, '') || '/';
  return `${url.hostname.toLowerCase()}${path}${url.search}`;
}

test('round-four delivers the eleven synthesis records exactly once', () => {
  assert.equal(ROUND4_ADDITIONS_CHECKED_AT, researchDate);
  assert.equal(ROUND4_CORRECTIONS_CHECKED_AT, researchDate);
  assert.equal(competitionRound4Additions.length, 11);
  assert.equal(competitions.length, 313);

  const expected = new Set([
    'chongqing-returnee-innovation-2026',
    'hubei-returnee-innovation-2026',
    'shenzhen-generative-ai-skills-2026',
    'liaoning-qiangsheng-cup-2026',
    'guangzhou-global-startup-special-eligibility-2026',
    'western-land-sea-audiovisual-2026',
    'clean-bayu-microdrama-2026',
    'shandong-air-ground-ai-student-2026',
    'ruc-global-ai-governance-safety-2026',
    'the-great-agent-hackathon-2026',
    'gx-ai-nonferrous-metals-2026',
  ]);
  assert.deepEqual(new Set(additionsById.keys()), expected);
});

test('ids, names and canonical source URLs do not duplicate the prior catalogue', () => {
  const additionIds = new Set(additionsById.keys());
  const prior = competitions.filter((item) => !additionIds.has(item.id));
  const priorNames = new Set(prior.map((item) => item.fullName));
  const priorUrls = new Set(prior.map((item) => canonicalUrl(item.url)));

  assert.equal(new Set(competitions.map((item) => item.id)).size, competitions.length);
  assert.equal(new Set(competitionRound4Additions.map((item) => item.fullName)).size, 11);
  assert.equal(new Set(competitionRound4Additions.map((item) => canonicalUrl(item.url))).size, 11);
  for (const addition of competitionRound4Additions) {
    assert.ok(!priorNames.has(addition.fullName), addition.id);
    assert.ok(!priorUrls.has(canonicalUrl(addition.url)), addition.id);
  }
});

test('round-four additions satisfy legacy and V2 contracts', () => {
  assert.deepEqual(validateCompetitions(competitionRound4Additions).errors, []);
  assert.deepEqual(validateCompetitionCollectionV2(competitionRound4Additions).errors, []);
  assert.deepEqual(validateCompetitions(competitions).errors, []);

  for (const competition of competitionRound4Additions) {
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

test('every addition has retained official or authoritative access-dated evidence', () => {
  for (const competition of competitionRound4Additions) {
    assert.ok(['verified', 'partially-verified'].includes(competition.verification.status), competition.id);
    assert.equal(competition.verification.checkedAt, researchDate, competition.id);
    assert.ok(['official', 'authoritative'].includes(competition.verification.sourceKind), competition.id);
    assert.ok(competition.sources.length > 0, competition.id);
    for (const source of competition.sources) {
      assert.ok(['official', 'authoritative'].includes(source.kind), `${competition.id}: ${source.kind}`);
      assert.equal(source.date, researchDate, `${competition.id}: ${source.url}`);
      assert.match(source.url, /^https?:\/\//, `${competition.id}: ${source.url}`);
    }
  }
});

test('all additions are open to new entry with one sourced actionable primary deadline', () => {
  const actionableTypes = new Set(['application', 'entry', 'registration', 'submission']);
  for (const competition of competitionRound4Additions) {
    const primary = getPrimaryDeadline(competition);
    assert.equal(competition.entryStatus, 'open-to-new', competition.id);
    assert.equal(primary.certainty, 'confirmed', competition.id);
    assert.ok(primary.date > researchDate, `${competition.id}: ${primary.date}`);
    assert.ok(actionableTypes.has(primary.type), `${competition.id}: ${primary.type}`);
    assert.ok(primary.timezone, competition.id);
    assert.match(primary.sourceUrl, /^https?:\/\//, competition.id);
    assert.ok(competition.sources.some((source) => source.url === primary.sourceUrl), competition.id);
    assert.equal(competition.deadlineISO, primary.date, competition.id);

    const markedPrimary = competition.deadlines.filter((deadline) => deadline.primary);
    assert.equal(markedPrimary.length, 1, competition.id);
    assert.equal(markedPrimary[0].date, primary.date, competition.id);
    assert.equal(markedPrimary[0].type, primary.type, competition.id);
  }
});

test('eligibility, fee, prize and IP unknowns are explicit rather than guessed', () => {
  const chinaValues = new Set(['yes', 'no', 'not-stated', 'yes-with-travel']);
  for (const competition of competitionRound4Additions) {
    assert.ok(competition.eligibility?.scope, competition.id);
    assert.ok(competition.eligibility?.regions?.length > 0, competition.id);
    assert.ok(chinaValues.has(competition.eligibility.chinaEligible), competition.id);
    assert.ok(competition.eligibility.fee, competition.id);
    assert.ok(competition.eligibility.team, competition.id);
    assert.ok(Array.isArray(competition.prizeBoundary?.cash), competition.id);
    assert.ok(Array.isArray(competition.prizeBoundary?.nonCash), competition.id);
    assert.ok(Array.isArray(competition.prizeBoundary?.investment), competition.id);
    assert.ok(competition.prizeBoundary.cashStatus, competition.id);
    assert.ok(competition.prizeBoundary.ip, competition.id);
  }

  assert.equal(additionsById.get('clean-bayu-microdrama-2026').prizeBoundary.ip.startsWith('not-stated'), true);
  assert.equal(additionsById.get('gx-ai-nonferrous-metals-2026').prizeBoundary.cashStatus, 'not-stated');
  assert.equal(additionsById.get('the-great-agent-hackathon-2026').prizeBoundary.cashStatus, 'not-stated');
  assert.equal(additionsById.get('liaoning-qiangsheng-cup-2026').prizeBoundary.cash.length, 0);
});

test('special identity, regional, student and onsite gates are visible before details', () => {
  const cases = [
    ['chongqing-returnee-innovation-2026', /海归/, /境外学习/, /普通无境外/],
    ['hubei-returnee-innovation-2026', /留学|海外/, /留学回国/, /海外经历/],
    ['shenzhen-generative-ai-skills-2026', /深圳关联/, /深圳工作或就学/, /深圳工作或就学/],
    ['guangzhou-global-startup-special-eligibility-2026', /仅港澳台 \/ 海外资格/, /港澳台 \/ 海外/, /普通大陆团队/],
    ['western-land-sea-audiovisual-2026', /六省区市限定/, /云南、广西、重庆、四川、贵州、陕西/, /六省区市/],
    ['shandong-air-ground-ai-student-2026', /学生限定/, /全日制/, /仅限全日制学生/],
    ['ruc-global-ai-governance-safety-2026', /青年范围待确认/, /青年/, /青年.*未定义/],
    ['the-great-agent-hackathon-2026', /18\+.*班加罗尔/, /18\+/, /自费赴 Bangalore/],
  ];

  for (const [id, namePattern, audiencePattern, consPattern] of cases) {
    const competition = additionsById.get(id);
    assert.match(competition.name, namePattern, id);
    assert.match(competition.audience, audiencePattern, id);
    assert.match(competition.cons.join(' '), consPattern, id);
  }
});

test('Hubei and Guangzhou do not conflate cash with investment or subsidy', () => {
  const hubei = additionsById.get('hubei-returnee-innovation-2026');
  assert.ok(hubei.prizeBoundary.cash.every((item) => /创业赛不适用/.test(item.scope)));
  assert.match(hubei.prizeBoundary.investment.join(' '), /股权投资；非奖金/);
  assert.match(hubei.prizeBoundary.conditionalSubsidy.join(' '), /追加资助/);

  const guangzhou = additionsById.get('guangzhou-global-startup-special-eligibility-2026');
  assert.ok(guangzhou.prizeBoundary.cash.every((item) => /广州注册并实体运营/.test(item.scope)));
  assert.match(guangzhou.prizeBoundary.investment.join(' '), /股权投资.*非奖金/);
});

test('round-four P0 corrections preserve the reviewed conflict boundaries', () => {
  const agentic = finalById.get('agenticcinema2026');
  assert.equal(agentic.verification.status, 'partially-verified');
  assert.equal(agentic.eligibility.chinaEligible, 'no');
  assert.equal(agentic.prizeBoundary.cash.length, 5);
  assert.equal(agentic.prizeBoundary.cash.reduce((sum, item) => sum + item.amount, 0), 65000);
  assert.deepEqual(
    agentic.prizeBoundary.cash.map((item) => item.amount),
    [15000, 12500, 12500, 12500, 12500],
  );
  assert.match(agentic.verification.notes, /USD 75,000/);

  const nanning = finalById.get('nanningopc2026');
  const deadline = getPrimaryDeadline(nanning);
  assert.equal(nanning.entryStatus, 'open-to-new');
  assert.equal(nanning.verification.status, 'partially-verified');
  assert.equal(deadline.certainty, 'confirmed');
  assert.equal(deadline.date, '2026-08-20');
  assert.equal(deadline.timezone, 'Asia/Shanghai');
  assert.match(deadline.label, /24:00/);
  assert.equal(nanning.sources.length, 3);
  assert.ok(nanning.sources.every((item) => item.kind === 'reported'));
  assert.match(nanning.verification.notes, /不等同直接打开政府原文/);
});

test('MediaAIAC, CCF OPC and Bay Area Cup use their confirmed existing ids and first-party evidence', () => {
  for (const id of ['mediaaiac2026', 'ccfopc', 'gbacc2026']) {
    assert.ok(Object.hasOwn(competitionRound4Corrections, id), id);
    const competition = finalById.get(id);
    assert.equal(competition.verification.status, 'verified', id);
    assert.equal(competition.verification.checkedAt, researchDate, id);
    assert.equal(competition.verification.sourceKind, 'official', id);
    assert.ok(competition.sources.length > 0, id);
    assert.ok(competition.sources.every((item) => item.kind === 'official'), id);
  }

  assert.ok(finalById.get('mediaaiac2026').sources.some((item) => item.url.includes('nrta.gov.cn')));
  assert.ok(finalById.get('ccfopc').sources.some((item) => item.url.includes('ccf.org.cn/Focus/')));
  assert.ok(finalById.get('gbacc2026').sources.some((item) => item.url.includes('/race/gbacc2026')));
});
