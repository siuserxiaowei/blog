import assert from 'node:assert/strict';
import test from 'node:test';

import { competitions } from '../src/data/competitions.js';
import { HERCLAW_EXPLICIT_COMPETITION_IDS } from '../src/data/competition-project-presets.js';
import {
  evaluateCompetitionProjectFit,
  getHerClawCompetitionFit,
  getMatchingProjectPresetIds,
  listHerClawAssessments,
} from '../src/lib/competition-project-fit.js';

const byId = new Map(competitions.map(competition => [competition.id, competition]));

test('generic project presets match auditable category, keyword, and eligibility rules', () => {
  assert.equal(evaluateCompetitionProjectFit(byId.get('xfynl2wf2026'), 'ai-agent').matched, true);
  assert.equal(evaluateCompetitionProjectFit(byId.get('solarfilament2026'), 'algorithm').matched, true);
  assert.equal(evaluateCompetitionProjectFit(byId.get('goldendolphinai2026'), 'creative-work').matched, true);
  assert.equal(evaluateCompetitionProjectFit(byId.get('global-excellent-engineer-innovation-2026'), 'startup').matched, true);
  assert.equal(evaluateCompetitionProjectFit(byId.get('graduallyai2026'), 'student-team').matched, true);
  assert.equal(evaluateCompetitionProjectFit(byId.get('unescohack2026'), 'student-team').matched, false);
});

test('HerClaw recommendations are explicit and include fit angle, gate, effort, and rank', () => {
  for (const id of HERCLAW_EXPLICIT_COMPETITION_IDS) {
    const competition = byId.get(id);
    const result = evaluateCompetitionProjectFit(competition, 'herclaw');
    assert.equal(result.matched, true, `${id} is explicitly recommended`);
    assert.match(result.fit.fitAngle, /\S/);
    assert.match(result.fit.gate, /\S/);
    assert.match(result.fit.effort, /^(低|中|高)$/);
    assert.ok(Number.isInteger(result.fit.rank));
  }

  const unrelatedHardware = byId.get('microchipfpga');
  assert.equal(evaluateCompetitionProjectFit(unrelatedHardware, 'herclaw').matched, false);
  assert.equal(getHerClawCompetitionFit(unrelatedHardware), null);
  assert.ok(!getMatchingProjectPresetIds(unrelatedHardware).includes('herclaw'));
});

test('HerClaw explicitly downgrades platform, eligibility, monetization, and education mismatches', () => {
  const noGoIds = [
    'shipaton2026',
    'amddevmaster2026',
    'armaiopt2026',
    'agenticcinema2026',
    'xfyedu2026',
  ];
  for (const id of noGoIds) {
    const result = evaluateCompetitionProjectFit(byId.get(id), 'herclaw');
    assert.equal(result.matched, false, `${id} must not enter the HerClaw recommendation list`);
    assert.equal(result.fit.decision, 'no-go');
    assert.match(result.fit.noGoReason, /\S/);
  }
  assert.match(getHerClawCompetitionFit('shipaton2026').noGoReason, /RevenueCat.*真实变现/);
  assert.match(getHerClawCompetitionFit('amddevmaster2026').noGoReason, /AMD \/ ROCm/);
  assert.match(getHerClawCompetitionFit('armaiopt2026').noGoReason, /Arm/);
  assert.match(getHerClawCompetitionFit('agenticcinema2026').noGoReason, /中国居民/);
  assert.match(getHerClawCompetitionFit('xfyedu2026').noGoReason, /企业 \/ 运营 AI 一体机/);
});

test('all explicit HerClaw assessments point at current competition records', () => {
  for (const assessment of listHerClawAssessments()) {
    assert.ok(byId.has(assessment.competitionId), `missing competition ${assessment.competitionId}`);
  }
});
