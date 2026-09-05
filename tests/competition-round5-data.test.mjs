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
  ROUND5_ADDITIONS_CHECKED_AT,
  competitionRound5Additions,
} from '../src/data/competition-round5-additions.js';

const researchDate = '2026-08-02';
const additionsById = new Map(competitionRound5Additions.map((item) => [item.id, item]));

function canonicalUrl(raw) {
  const url = new URL(raw);
  const path = url.pathname.replace(/\/+$/, '') || '/';
  return `${url.hostname.toLowerCase()}${path}${url.search}`;
}

test('round-five delivers the fifty social-platform records exactly once', () => {
  assert.equal(ROUND5_ADDITIONS_CHECKED_AT, researchDate);
  assert.equal(competitionRound5Additions.length, 50);
  assert.equal(competitions.length, 439);

  const expected = new Set([
    'bilibili-ai-create-2026',
    'douyin-ai-create-2026',
    'dongguan-industrial-ai-100-2026',
    'meitu-hatch-catch-2026',
    'mvland-aimv-2026',
    'ai-builders-hackathon-2026',
    'weibo-vibelab-2026',
    'tianchi-industry-agent-2026',
    'ggac-7th-2026',
    'valorant-ggac-card-2026',
    'smg-ai-film-2026',
    'seeed-xiao-productization-2026',
    'csig-camera-2026',
    'zindi-road-barbados-2026',
    'kaggle-benchflow-skill-lift-2026',
    'mineru-mdic-2026',
    'capcut-creaite-2026',
    'volthacks-2026',
    'xpeng-agent-tianchi-2026',
    'delphi-agent-arena-2026',
    'weex-ai-wars2-2026',
    'techex-amsterdam-hackathon-2026',
    'ai-genesis-2026',
    'since-ai-hackathon-2026',
    'munichtech-innovation-2026',
    'gpu-ai-buildathon-2026',
    'mlh-ghw-agents-2026',
    'kuaishou-ican-ai-2026',
    'shandong-ai-film-2026',
    'foco-taiwan-ai-2026',
    'qianwen-ai-comic-2026',
    'libtv-skill-creator-2026',
    'bilibili-updream-animation-2026',
    'zhongguancun-ai-design-2026',
    'xidha-costume-2026',
    'brackeys-jam-2026-2',
    'lowrezjam-2026',
    'inkjam-2026',
    'ludum-dare-60',
    'adi-codefusion-2026',
    'seeed-make-a-sign-2026',
    'funpack-5-4-2026',
    'autodesk-au-2027-product',
    'sea-openai-hackathon-tw-2026',
    'hotai-hackathon-2026',
    'tabei-trustworthy-ai-2026',
    'csig-rongqi-anomaly-2026',
    'zindi-bias-bounty-2026',
    'mozilla-lost-in-transcription-2026',
    'vidu-ai-film-hackathon-2026',
  ]);
  assert.deepEqual(new Set(additionsById.keys()), expected);
});

test('ids, names and canonical source URLs do not duplicate the prior catalogue', () => {
  const additionIds = new Set(additionsById.keys());
  const prior = competitions.filter((item) => !additionIds.has(item.id));
  const priorNames = new Set(prior.map((item) => item.fullName));
  const priorUrls = new Set(prior.map((item) => canonicalUrl(item.url)));

  assert.equal(new Set(competitions.map((item) => item.id)).size, competitions.length);
  assert.equal(new Set(competitionRound5Additions.map((item) => item.fullName)).size, 50);
  assert.equal(new Set(competitionRound5Additions.map((item) => canonicalUrl(item.url))).size, 50);
  for (const addition of competitionRound5Additions) {
    assert.ok(!priorNames.has(addition.fullName), addition.id);
    assert.ok(!priorUrls.has(canonicalUrl(addition.url)), addition.id);
  }
});

test('round-five additions satisfy legacy and V2 contracts', () => {
  assert.deepEqual(validateCompetitions(competitionRound5Additions).errors, []);
  assert.deepEqual(validateCompetitionCollectionV2(competitionRound5Additions).errors, []);
  assert.deepEqual(validateCompetitions(competitions).errors, []);

  for (const competition of competitionRound5Additions) {
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

test('every addition has access-dated evidence matching its verification claim', () => {
  for (const competition of competitionRound5Additions) {
    assert.ok(['verified', 'partially-verified'].includes(competition.verification.status), competition.id);
    assert.equal(competition.verification.checkedAt, researchDate, competition.id);
    assert.ok(competition.sources.length > 0, competition.id);
    for (const source of competition.sources) {
      assert.ok(['official', 'reported'].includes(source.kind), `${competition.id}: ${source.kind}`);
      assert.equal(source.date, researchDate, `${competition.id}: ${source.url}`);
      assert.match(source.url, /^https?:\/\//, `${competition.id}: ${source.url}`);
    }
    if (competition.verification.sourceKind === 'official') {
      assert.ok(competition.sources.some((source) => source.kind === 'official'), competition.id);
    }
  }
});

test('all additions are open to new entry with one sourced actionable primary deadline', () => {
  const actionableTypes = new Set(['application', 'entry', 'registration', 'submission']);
  const uncertainCertainties = new Set(['estimated', 'unknown', 'rolling']);
  for (const competition of competitionRound5Additions) {
    const primary = getPrimaryDeadline(competition);
    assert.equal(competition.entryStatus, 'open-to-new', competition.id);
    assert.ok(['confirmed', ...uncertainCertainties].includes(primary.certainty), competition.id);
    assert.ok(actionableTypes.has(primary.type), `${competition.id}: ${primary.type}`);
    assert.ok(primary.timezone, competition.id);
    assert.match(primary.sourceUrl, /^https?:\/\//, competition.id);
    assert.ok(competition.sources.some((source) => source.url === primary.sourceUrl), competition.id);

    const markedPrimary = competition.deadlines.filter((deadline) => deadline.primary);
    assert.equal(markedPrimary.length, 1, competition.id);
    assert.equal(markedPrimary[0].date, primary.date, competition.id);
    assert.equal(markedPrimary[0].type, primary.type, competition.id);

    if (primary.certainty === 'confirmed') {
      assert.ok(primary.date > researchDate, `${competition.id}: ${primary.date}`);
      assert.equal(competition.deadlineISO, primary.date, competition.id);
    } else if (primary.date) {
      assert.match(primary.label, /待确认|预计|待官宣|推算/, `${competition.id}: estimated date must be labelled as unconfirmed`);
    } else {
      assert.ok(competition.deadlineISO >= researchDate, `${competition.id}: sentinel deadlineISO must not be in the past`);
    }
  }
});

test('eligibility, fee, prize and IP unknowns are explicit rather than guessed', () => {
  const chinaValues = new Set(['yes', 'no', 'not-stated', 'yes-with-travel']);
  for (const competition of competitionRound5Additions) {
    assert.ok(competition.eligibility?.scope, competition.id);
    assert.ok(competition.eligibility?.regions?.length > 0, competition.id);
    assert.ok(chinaValues.has(competition.eligibility.chinaEligible), competition.id);
    assert.ok(competition.eligibility.fee, competition.id);
    assert.ok(competition.eligibility.team, competition.id);
    assert.ok(Array.isArray(competition.prizeBoundary?.cash), competition.id);
    assert.ok(Array.isArray(competition.prizeBoundary?.nonCash), competition.id);
    assert.ok(Array.isArray(competition.prizeBoundary?.investment), competition.id);
    assert.ok(competition.prizeBoundary.cashStatus, competition.id);
  }
});

test('China-ineligible or downgraded records never claim open eligibility', () => {
  const noGo = competitionRound5Additions.filter((item) => item.eligibility.chinaEligible === 'no');
  assert.ok(noGo.length >= 2, 'expected at least capcut-creaite-2026 and autodesk-au-2027-product');
  for (const competition of noGo) {
    assert.notEqual(competition.tier, 'S', competition.id);
    assert.match(`${competition.audience} ${competition.cons?.join(' ')}`, /大陆|中国/, competition.id);
  }
});
