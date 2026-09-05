import assert from 'node:assert/strict';
import test from 'node:test';

import { competitions } from '../src/data/competitions.js';
import {
  BIG_TECH_OFFICIAL_TARGET_COUNT,
  OFFICIAL_COVERAGE_CHECKED_AT,
  competitionOfficialCoverage,
} from '../src/data/competition-official-coverage.js';

const finalById = new Map(competitions.map((item) => [item.id, item]));

test('the big-tech sweep keeps a bounded 52-entry official coverage ledger', () => {
  assert.equal(OFFICIAL_COVERAGE_CHECKED_AT, '2026-08-06');
  assert.equal(BIG_TECH_OFFICIAL_TARGET_COUNT, 52);
  assert.equal(competitionOfficialCoverage.length, BIG_TECH_OFFICIAL_TARGET_COUNT);
  assert.equal(new Set(competitionOfficialCoverage.map((item) => item.id)).size, BIG_TECH_OFFICIAL_TARGET_COUNT);

  for (const item of competitionOfficialCoverage) {
    assert.match(item.officialUrl, /^https:\/\//, item.id);
    assert.equal(item.checkedAt, OFFICIAL_COVERAGE_CHECKED_AT, item.id);
    assert.ok(['covered', 'no-current-contest-found', 'partial', 'blocked'].includes(item.status), item.id);
    assert.ok(Array.isArray(item.competitionIds), item.id);
    assert.ok(item.notes.trim().length >= 12, item.id);
    for (const id of item.competitionIds) assert.ok(finalById.has(id), `${item.id} -> ${id}`);
  }
});

test('priority official surfaces are individually represented instead of inferred from brand text', () => {
  const byId = new Map(competitionOfficialCoverage.map((item) => [item.id, item]));
  const required = [
    'hangzhou-yungu-center',
    'modelscope',
    'alibaba-tianchi',
    'tencent-cloud-contests',
    'huawei-cloud-contests',
    'volcengine-contests',
    'iflytek-contests',
    'baidu-ai-studio',
    'kaggle',
    'devpost',
    'openai',
    'anthropic',
    'google-deepmind',
    'microsoft',
    'aws',
    'nvidia',
  ];

  for (const id of required) assert.ok(byId.has(id), id);
  assert.deepEqual(byId.get('hangzhou-yungu-center').competitionIds, ['qincheng-guanghe-aigc-video-2026']);
  assert.deepEqual(byId.get('modelscope').competitionIds, [
    'qincheng-guanghe-aigc-video-2026',
    'ai-infinity-developer-creation-2026',
    'minicpm-ascend-challenge-2026',
    'production-ai-skills-2026',
    'ventured-vibe-coding-hackathon-2026',
    'silicon-carbon-ai-diagnosis-2026',
  ]);
  assert.equal(byId.get('modelscope').status, 'partial');
  assert.match(byId.get('modelscope').notes, /117.*112|112.*117/);
  assert.match(byId.get('modelscope').notes, /第 15 页.*第 14 页/);

  assert.deepEqual(byId.get('huawei-developer').competitionIds, [
    'huawei',
    'hwdevcomp',
    'harmonyos-app-developer-incentive-2026',
    'harmony-agent-tiangong-incentive-2026',
  ]);
});

test('official overview events remain recorded even when registration is closed or restricted', () => {
  const requiredIds = [
    'tencent-cloud-virtual-football-s13-2026',
    'tencent-cloud-agent-championship-2026',
    'tencent-cloud-ai-coding-singapore-2026',
    'tencent-cloud-intelligent-pentest-2026',
    'huawei-terminal-bg-innovation-2026',
    'huawei-youth-tech-challenge-2026',
    'huawei-power-electronics-track1-2026',
    'huawei-power-electronics-track2-2026',
  ];

  for (const id of requiredIds) assert.ok(finalById.has(id), id);
  assert.equal(finalById.get('tencent-cloud-virtual-football-s13-2026').entryStatus, 'closed');
  assert.equal(finalById.get('tencent-cloud-agent-championship-2026').entryStatus, 'registered-only');
  assert.equal(finalById.get('huawei-terminal-bg-innovation-2026').entryStatus, 'open-to-new');
  assert.equal(finalById.get('huawei-terminal-bg-innovation-2026').eligibility.scope, 'finalists-only');
  assert.equal(finalById.get('huawei-youth-tech-challenge-2026').entryStatus, 'registered-only');
});
