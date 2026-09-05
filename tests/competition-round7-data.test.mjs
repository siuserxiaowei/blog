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
  ROUND7_ADDITIONS_CHECKED_AT,
  competitionRound7Additions,
} from '../src/data/competition-round7-additions.js';
import {
  HERCLAW_EXPLICIT_COMPETITION_IDS,
  OCG_EXPLICIT_COMPETITION_IDS,
} from '../src/data/competition-project-presets.js';

const researchDate = '2026-08-05';
const additionsById = new Map(competitionRound7Additions.map((item) => [item.id, item]));
const finalById = new Map(competitions.map((item) => [item.id, item]));

function canonicalUrl(raw) {
  const url = new URL(raw);
  const path = url.pathname.replace(/\/+$/, '') || '/';
  return `${url.hostname.toLowerCase()}${path}${url.search}`;
}

test('round-seven delivers the forty-nine synthesis records exactly once', () => {
  assert.equal(ROUND7_ADDITIONS_CHECKED_AT, researchDate);
  assert.equal(competitionRound7Additions.length, 49);
  assert.equal(competitions.length, 439);

  const expected = new Set([
    'gz-sci-tech-innovation-2026',
    'itec-robot-scenario-2026',
    'dcd-car-vision-ai-2026',
    'intern-ai-skills-challenge-2026',
    'wuhu-compute-algorithm-2026',
    'fujian-youth-talent-2026',
    'golden-panda-2026',
    'afac2026-financial-intelligence',
    'jiangyuan-cup-embodied-2026',
    'meituan-lowaltitude-embodied-2026',
    'jd-joyinside-innovation-2026',
    'openvela-ai-hardware-2026',
    'chuangpi-ai-robot-2026',
    'ecny-ip-design-2026',
    'qiaosheng-card-design-2026',
    'xwc-newcultural-design-2026',
    'catdc-ceramic-toy-2026',
    'asia-ip-contest-tokyo-2026',
    'data-element-x-2026',
    'cumcm-2026',
    'gjmcm-postgraduate-2026',
    'algo-security-challenge-2026',
    'bioos-antibody-design-2026',
    'flowary-jiangan-hackathon-2026',
    'zotac-ai-create-2026',
    'jinshow-shortdrama-aigc-2026',
    'quwan-shengzhou-ai-music-2026',
    'reading-wanxiang-video-2026',
    'ai-shaanxi-video-2026',
    'motuo-image-2026',
    'shandong-public-ad-2026',
    'shanghai-student-tv-ai-2026',
    'suzhou-jichengjiangxin-2026',
    'kunlunyao-aigc-multimodal-2026',
    'capt-aigc-visual-2026',
    'shandong-youth-ai-opc-2026',
    'baoying-overseas-talent-2026',
    'jiaxing-innovation-2026',
    'yangzhou-lvyangjinfeng-2026',
    'hangzhou-postdoc-2026',
    'jinxue-run-2026',
    'hefei-overseas-capital-2026',
    'skyodyssey-game-ai-2026',
    'smartcity-postgraduate-2026',
    'shuweibei-autumn-2026',
    'kaggle-kaggriculture-2026',
    'rtthread-embedded-2026',
    'uav-counter-uav-2026',
    'zhuoyi-swarm-challenge-2026',
  ]);
  assert.deepEqual(new Set(additionsById.keys()), expected);
});

test('the round-seven CSIG 生成式图像增强 candidate stays de-duplicated', () => {
  // 规范第 19 条 csig-genimage-enhance-2026 与在库 csig-camera-2026 为同一赛事
  // （天池 raceId 532499/532500、双赛道与 20 万/赛道口径完全一致），按「已在库不重复收录」先例不新增。
  assert.ok(!finalById.has('csig-genimage-enhance-2026'));
  assert.ok(finalById.has('csig-camera-2026'));
  const existing = finalById.get('csig-camera-2026');
  assert.ok(existing.sources.some((source) => source.url.includes('532499')));
  assert.ok(existing.sources.some((source) => source.url.includes('532500')));
});

test('ids, names and canonical source URLs do not duplicate the prior catalogue', () => {
  const additionIds = new Set(additionsById.keys());
  const prior = competitions.filter((item) => !additionIds.has(item.id));
  const priorNames = new Set(prior.map((item) => item.fullName));
  const priorUrls = new Set(prior.map((item) => canonicalUrl(item.url)));

  assert.equal(new Set(competitions.map((item) => item.id)).size, competitions.length);
  assert.equal(new Set(competitionRound7Additions.map((item) => item.fullName)).size, 49);
  assert.equal(new Set(competitionRound7Additions.map((item) => canonicalUrl(item.url))).size, 49);
  for (const addition of competitionRound7Additions) {
    assert.ok(!priorNames.has(addition.fullName), addition.id);
    assert.ok(!priorUrls.has(canonicalUrl(addition.url)), addition.id);
  }
});

test('round-seven additions satisfy legacy and V2 contracts', () => {
  assert.deepEqual(validateCompetitions(competitionRound7Additions).errors, []);
  assert.deepEqual(validateCompetitionCollectionV2(competitionRound7Additions).errors, []);
  assert.deepEqual(validateCompetitions(competitions).errors, []);

  for (const competition of competitionRound7Additions) {
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
  for (const competition of competitionRound7Additions) {
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

test('action links never use WeChat signature temp links', () => {
  const longTermMpLinks = new Set([
    'https://mp.weixin.qq.com/s/pLK_xRBM7WWunjJ8SbhQrw',
    'https://mp.weixin.qq.com/s/ZRx-b1RV5Cy15TnEZozw4w',
  ]);
  for (const competition of competitionRound7Additions) {
    const urls = [competition.url, ...competition.sources.map((source) => source.url)];
    for (const raw of urls) {
      if (!raw.includes('mp.weixin.qq.com')) continue;
      assert.ok(longTermMpLinks.has(raw), `${competition.id}: ${raw} must be a spec-provided long-term mp link`);
      assert.doesNotMatch(raw, /[?&](signature|tempkey|scene)=/, `${competition.id}: signature temp link`);
    }
  }
});

test('all additions carry one sourced actionable primary deadline', () => {
  const actionableTypes = new Set(['application', 'entry', 'registration', 'submission']);
  const uncertainCertainties = new Set(['estimated', 'unknown', 'rolling']);
  for (const competition of competitionRound7Additions) {
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
      assert.match(primary.label, /待确认|预计|待官宣|推算|待直核|二核/, `${competition.id}: estimated date must be labelled as unconfirmed`);
    } else {
      assert.ok(competition.deadlineISO >= researchDate, `${competition.id}: sentinel deadlineISO must not be in the past`);
    }
  }
});

test('eligibility, fee, prize and IP unknowns are explicit rather than guessed', () => {
  const chinaValues = new Set(['yes', 'no', 'not-stated', 'yes-with-travel']);
  for (const competition of competitionRound7Additions) {
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

test('student, regional, fee, tight-deadline and series boundaries are written explicitly', () => {
  const studentOnly = [
    'meituan-lowaltitude-embodied-2026',
    'cumcm-2026',
    'gjmcm-postgraduate-2026',
    'shanghai-student-tv-ai-2026',
    'kunlunyao-aigc-multimodal-2026',
    'smartcity-postgraduate-2026',
    'shuweibei-autumn-2026',
    'uav-counter-uav-2026',
  ];
  for (const id of studentOnly) {
    assert.equal(additionsById.get(id).eligibility.scope, 'students-only', id);
  }

  const feeCharged = ['asia-ip-contest-tokyo-2026', 'shuweibei-autumn-2026'];
  for (const id of feeCharged) {
    assert.match(additionsById.get(id).eligibility.fee, /paid/, id);
  }

  const regional = ['suzhou-jichengjiangxin-2026', 'shandong-youth-ai-opc-2026', 'jiaxing-innovation-2026'];
  for (const id of regional) {
    assert.equal(additionsById.get(id).eligibility.scope, 'regional-limited', id);
  }

  const tight = [
    ['algo-security-challenge-2026', '2026-08-06'],
    ['chuangpi-ai-robot-2026', '2026-08-07'],
    ['bioos-antibody-design-2026', '2026-08-07'],
  ];
  for (const [id, date] of tight) {
    const primary = getPrimaryDeadline(additionsById.get(id));
    assert.equal(primary.certainty, 'confirmed', id);
    assert.equal(primary.date, date, id);
  }

  const series = ['data-element-x-2026', 'jiaxing-innovation-2026', 'yangzhou-lvyangjinfeng-2026'];
  for (const id of series) {
    assert.equal(additionsById.get(id).recordType, 'series', id);
    assert.notEqual(getPrimaryDeadline(additionsById.get(id)).certainty, 'confirmed', id);
  }
  assert.equal(additionsById.get('hefei-overseas-capital-2026').recordType, 'program');
});

test('cross-catalogue relations are documented in descriptions', () => {
  assert.match(additionsById.get('jd-joyinside-innovation-2026').desc, /jdjoyinside.*同系列不同赛季/);
  assert.match(additionsById.get('gz-sci-tech-innovation-2026').desc, /中国创新创业大赛广东·广州赛区/);
  assert.match(additionsById.get('gz-sci-tech-innovation-2026').desc, /cxcyds/);
});

test('round-seven preset additions point at real competition records', () => {
  const herclawNew = [
    'itec-robot-scenario-2026',
    'gz-sci-tech-innovation-2026',
    'jiangyuan-cup-embodied-2026',
    'openvela-ai-hardware-2026',
    'jd-joyinside-innovation-2026',
    'chuangpi-ai-robot-2026',
    'golden-panda-2026',
  ];
  const ocgNew = [
    'qiaosheng-card-design-2026',
    'xwc-newcultural-design-2026',
    'catdc-ceramic-toy-2026',
    'ecny-ip-design-2026',
  ];
  assert.equal(HERCLAW_EXPLICIT_COMPETITION_IDS.length, 31);
  assert.equal(OCG_EXPLICIT_COMPETITION_IDS.length, 33);
  for (const id of [...herclawNew, ...ocgNew]) {
    assert.ok(finalById.has(id), `missing competition ${id}`);
  }
  for (const id of herclawNew) assert.ok(HERCLAW_EXPLICIT_COMPETITION_IDS.includes(id), id);
  for (const id of ocgNew) assert.ok(OCG_EXPLICIT_COMPETITION_IDS.includes(id), id);
  // 规范明确不入预设：asia-ip-contest 收费由用户决定、meituan 学生限定不入。
  assert.ok(!OCG_EXPLICIT_COMPETITION_IDS.includes('asia-ip-contest-tokyo-2026'));
  assert.ok(!HERCLAW_EXPLICIT_COMPETITION_IDS.includes('meituan-lowaltitude-embodied-2026'));
});
