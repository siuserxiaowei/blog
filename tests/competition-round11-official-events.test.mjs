import assert from 'node:assert/strict';
import test from 'node:test';

import { competitions, validateCompetitions } from '../src/data/competitions.js';
import {
  ROUND11_ADDITIONS_CHECKED_AT,
  competitionRound11Additions,
} from '../src/data/competition-round11-additions.js';
import { competitionRound11Corrections } from '../src/data/competition-round11-corrections.js';

const byId = new Map(competitionRound11Additions.map((item) => [item.id, item]));

test('round eleven records the eight missing current official-overview events', () => {
  assert.equal(ROUND11_ADDITIONS_CHECKED_AT, '2026-08-06');
  assert.deepEqual(new Set(byId.keys()), new Set([
    'tencent-cloud-virtual-football-s13-2026',
    'tencent-cloud-agent-championship-2026',
    'tencent-cloud-ai-coding-singapore-2026',
    'tencent-cloud-intelligent-pentest-2026',
    'huawei-terminal-bg-innovation-2026',
    'huawei-youth-tech-challenge-2026',
    'huawei-power-electronics-track1-2026',
    'huawei-power-electronics-track2-2026',
  ]));
});

test('closed and finalist-only boundaries are explicit', () => {
  assert.equal(byId.get('tencent-cloud-virtual-football-s13-2026').entryStatus, 'closed');
  assert.equal(byId.get('tencent-cloud-agent-championship-2026').entryStatus, 'registered-only');
  assert.equal(byId.get('tencent-cloud-ai-coding-singapore-2026').entryStatus, 'closed');
  assert.equal(byId.get('tencent-cloud-intelligent-pentest-2026').entryStatus, 'closed');
  assert.equal(byId.get('huawei-terminal-bg-innovation-2026').entryStatus, 'open-to-new');
  assert.equal(byId.get('huawei-terminal-bg-innovation-2026').eligibility.scope, 'finalists-only');
  assert.equal(byId.get('huawei-youth-tech-challenge-2026').entryStatus, 'registered-only');
});

test('the shared Huawei power-electronics prize is not double-counted', () => {
  for (const id of ['huawei-power-electronics-track1-2026', 'huawei-power-electronics-track2-2026']) {
    const item = byId.get(id);
    assert.equal(item.prizeBoundary.cash[0].amount, 790000);
    assert.match(item.prizeBoundary.cash[0].scope, /整届共享|不得跨赛题重复累计/);
  }
});

test('the Volcano Cup umbrella is corrected from ten to the 63-entry official directory', () => {
  const correction = competitionRound11Corrections['volcengine-huoshan-cup-agent-2026'];
  assert.match(correction.fullName, /63/);
  assert.match(correction.desc, /63/);
  assert.match(correction.desc, /36/);
  assert.doesNotMatch(`${correction.fullName} ${correction.desc}`, /当前 10 个|当前10个/);
});

test('round eleven additions and final merged collection pass the data contract', () => {
  assert.deepEqual(validateCompetitions(competitionRound11Additions).errors, []);
  assert.deepEqual(validateCompetitions(competitions).errors, []);
});
