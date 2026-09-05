import assert from 'node:assert/strict';
import test from 'node:test';

import {
  COMPETITION_CATEGORIES,
  REQUIRED_COMPETITION_FIELDS,
  competitions,
  getPrimaryDeadline,
  statusOf,
  validateCompetitionCollectionV2,
  validateCompetitions,
} from '../src/data/competitions.js';
import {
  ROUND6_ADDITIONS_CHECKED_AT,
  competitionRound6Additions,
} from '../src/data/competition-round6-additions.js';
import {
  ROUND6_CORRECTIONS_CHECKED_AT,
  competitionRound6Corrections,
} from '../src/data/competition-round6-corrections.js';
import {
  HERCLAW_EXPLICIT_COMPETITION_IDS,
  OCG_EXPLICIT_COMPETITION_IDS,
} from '../src/data/competition-project-presets.js';

const researchDate = '2026-08-04';
const additionsById = new Map(competitionRound6Additions.map((item) => [item.id, item]));
const finalById = new Map(competitions.map((item) => [item.id, item]));

function canonicalUrl(raw) {
  const url = new URL(raw);
  const path = url.pathname.replace(/\/+$/, '') || '/';
  return `${url.hostname.toLowerCase()}${path}${url.search}`;
}

test('round-six delivers the forty-four synthesis records exactly once', () => {
  assert.equal(ROUND6_ADDITIONS_CHECKED_AT, researchDate);
  assert.equal(ROUND6_CORRECTIONS_CHECKED_AT, researchDate);
  assert.equal(competitionRound6Additions.length, 44);
  assert.equal(competitions.length, 439);

  const expected = new Set([
    'gauntlet-of-gods-2026',
    'pazhou-international-ai-2026',
    'kling-inspiration-ventures-2026',
    'emma-hackathon-2026',
    'huaqiu-cup-ai-hardware-2026',
    'lcsc-wch-riscv-2026',
    'iflytek-robot-innovation-2026',
    'harbin-beer-ai-hiphop-2026',
    'jimeng-effie-ad-remix-2026',
    'qianwen-multimodal-reasoning-2026',
    'ai-info-literacy-student-2026',
    'qincheng-guanghe-aigc-video-2026',
    'asus-adol-douding-2026',
    'weibo-video-remix-season-2026',
    'jimeng-weekly-challenge-2026',
    'abb-cup-2026',
    'gba-aigc-shortdrama-2026',
    'ethonline-2026',
    'keeperhub-agents-onchain-2026',
    'flare-summer-signal-2026',
    'gatewayhacks-2026',
    'btt-web-game-jam-2026',
    'reverie-hacks-2026',
    'mlh-ghw-data-2026',
    'fossee-oshw-makeathon-2026',
    'spooktober-vn-jam-2026',
    'godothub-festival-2026',
    'gbjam-14',
    'godot-wild-jam-rolling',
    'meshtastic-build-off-2026',
    'robotac-quadruped-2026',
    'digikey-arduino-dream-lab-2026',
    'zindi-drought-forecast-2026',
    'jciiot-embodied-ai-2026',
    'yixian-ai-create-2026',
    'yuandian-cup-aug-2026',
    'opc-anime-toy-hackathon-2026',
    'china-red-season2-2026',
    'tiantangzhai-ai-video-2026',
    'dfrobot-xhs-maker-2026',
    'climate-jam-2026',
    'craftpix-indie-jam-2026',
    'ccl26-eval-image-translation-2026',
    'volcengine-huoshan-cup-agent-2026',
  ]);
  assert.deepEqual(new Set(additionsById.keys()), expected);
});

test('ids, names and canonical source URLs do not duplicate the prior catalogue', () => {
  const additionIds = new Set(additionsById.keys());
  const prior = competitions.filter((item) => !additionIds.has(item.id));
  const priorNames = new Set(prior.map((item) => item.fullName));
  const priorUrls = new Set(prior.map((item) => canonicalUrl(item.url)));

  assert.equal(new Set(competitions.map((item) => item.id)).size, competitions.length);
  assert.equal(new Set(competitionRound6Additions.map((item) => item.fullName)).size, 44);
  assert.equal(new Set(competitionRound6Additions.map((item) => canonicalUrl(item.url))).size, 44);
  for (const addition of competitionRound6Additions) {
    assert.ok(!priorNames.has(addition.fullName), addition.id);
    assert.ok(!priorUrls.has(canonicalUrl(addition.url)), addition.id);
  }
});

test('round-six additions satisfy legacy and V2 contracts', () => {
  assert.deepEqual(validateCompetitions(competitionRound6Additions).errors, []);
  assert.deepEqual(validateCompetitionCollectionV2(competitionRound6Additions).errors, []);
  assert.deepEqual(validateCompetitions(competitions).errors, []);

  for (const competition of competitionRound6Additions) {
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
  for (const competition of competitionRound6Additions) {
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

test('all additions carry one sourced actionable primary deadline', () => {
  const actionableTypes = new Set(['application', 'entry', 'registration', 'submission']);
  const uncertainCertainties = new Set(['estimated', 'unknown', 'rolling']);
  for (const competition of competitionRound6Additions) {
    const primary = getPrimaryDeadline(competition);
    assert.ok(['open-to-new', 'unknown'].includes(competition.entryStatus), competition.id);
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

test('entries whose registration is unconfirmed do not claim open-to-new', () => {
  const unknownEntry = competitionRound6Additions.filter((item) => item.entryStatus === 'unknown');
  assert.deepEqual(
    unknownEntry.map((item) => item.id).sort(),
    ['jciiot-embodied-ai-2026', 'robotac-quadruped-2026'],
  );
  for (const competition of unknownEntry) {
    assert.match(`${competition.desc} ${competition.verification.notes}`, /待确认/, competition.id);
  }
});

test('eligibility, fee, prize and IP unknowns are explicit rather than guessed', () => {
  const chinaValues = new Set(['yes', 'no', 'not-stated', 'yes-with-travel']);
  for (const competition of competitionRound6Additions) {
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
  const noGo = competitionRound6Additions.filter((item) => item.eligibility.chinaEligible === 'no');
  assert.deepEqual(noGo.map((item) => item.id), ['digikey-arduino-dream-lab-2026']);
  for (const competition of noGo) {
    assert.notEqual(competition.tier, 'S', competition.id);
    assert.match(`${competition.audience} ${competition.cons?.join(' ')}`, /美国|大陆|中国/, competition.id);
  }

  const web3Downgraded = ['ethonline-2026', 'keeperhub-agents-onchain-2026', 'flare-summer-signal-2026'];
  for (const id of web3Downgraded) {
    const competition = additionsById.get(id);
    assert.equal(competition.tier, 'B', id);
    assert.equal(competition.eligibility.chinaEligible, 'not-stated', id);
    assert.match(`${competition.desc} ${competition.cons?.join(' ')}`, /合规/, id);
  }
});

test('AI-banned, student-only and fee-conditional boundaries are written explicitly', () => {
  const aiBanned = ['gauntlet-of-gods-2026', 'spooktober-vn-jam-2026', 'craftpix-indie-jam-2026'];
  for (const id of aiBanned) {
    const competition = additionsById.get(id);
    assert.match(
      `${competition.desc} ${competition.audience} ${competition.prizeBoundary.ip}`,
      /禁止生成式 AI|禁止 AI/,
      id,
    );
  }
  assert.match(additionsById.get('iflytek-robot-innovation-2026').desc, /拒收完全由 AI 生成/);
  assert.match(additionsById.get('spooktober-vn-jam-2026').eligibility.fee, /Judge Pass/);

  const studentOnly = ['ai-info-literacy-student-2026', 'abb-cup-2026', 'reverie-hacks-2026', 'fossee-oshw-makeathon-2026', 'robotac-quadruped-2026'];
  for (const id of studentOnly) {
    assert.equal(additionsById.get(id).eligibility.scope, 'students-only', id);
  }

  assert.match(additionsById.get('meshtastic-build-off-2026').desc, /日期矛盾/);
  assert.match(additionsById.get('gba-aigc-shortdrama-2026').eligibility.regions.join(' '), /大湾区/);
});

test('the mineru-mdic-2026 correction marks the ended lifecycle conservatively', () => {
  const correctionIds = Object.keys(competitionRound6Corrections);
  assert.deepEqual(correctionIds, ['mineru-mdic-2026']);
  for (const id of correctionIds) {
    assert.ok(finalById.has(id), `unknown correction id: ${id}`);
  }

  const patch = competitionRound6Corrections['mineru-mdic-2026'];
  assert.equal(patch.verification?.checkedAt, researchDate);
  assert.ok(['official', 'reported'].includes(patch.verification?.sourceKind));
  assert.ok(Array.isArray(patch.sources) && patch.sources.length > 0);

  const corrected = finalById.get('mineru-mdic-2026');
  assert.equal(corrected.entryStatus, 'closed');
  assert.equal(corrected.deadlineISO, '2026-07-19');
  const primary = getPrimaryDeadline(corrected);
  assert.equal(primary.date, '2026-07-19');
  assert.equal(primary.certainty, 'confirmed');
  assert.equal(statusOf(primary, new Date('2026-08-04T00:00:00+08:00')).kind, 'expired');
  assert.match(corrected.desc, /颁奖结束/);
});

test('round-six preset additions point at real competition records', () => {
  const herclawNew = [
    'huaqiu-cup-ai-hardware-2026',
    'lcsc-wch-riscv-2026',
    'iflytek-robot-innovation-2026',
    'pazhou-international-ai-2026',
    'dfrobot-xhs-maker-2026',
    'meshtastic-build-off-2026',
    'fossee-oshw-makeathon-2026',
    'jciiot-embodied-ai-2026',
  ];
  const ocgNew = [
    'gauntlet-of-gods-2026',
    'btt-web-game-jam-2026',
    'godothub-festival-2026',
    'gbjam-14',
    'godot-wild-jam-rolling',
    'spooktober-vn-jam-2026',
    'climate-jam-2026',
    'craftpix-indie-jam-2026',
  ];
  assert.equal(HERCLAW_EXPLICIT_COMPETITION_IDS.length, 31);
  assert.equal(OCG_EXPLICIT_COMPETITION_IDS.length, 33);
  for (const id of [...herclawNew, ...ocgNew]) {
    assert.ok(finalById.has(id), `missing competition ${id}`);
  }
  for (const id of herclawNew) assert.ok(HERCLAW_EXPLICIT_COMPETITION_IDS.includes(id), id);
  for (const id of ocgNew) assert.ok(OCG_EXPLICIT_COMPETITION_IDS.includes(id), id);
});
