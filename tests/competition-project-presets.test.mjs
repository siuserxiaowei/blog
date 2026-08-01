import assert from 'node:assert/strict';
import test from 'node:test';

import {
  HERCLAW_EXPLICIT_COMPETITION_IDS,
  HERCLAW_PROFILE,
  PROJECT_PRESETS,
} from '../src/data/competition-project-presets.js';

test('project presets expose stable, reviewable public choices', () => {
  assert.deepEqual(
    PROJECT_PRESETS.map(preset => preset.id),
    ['all', 'herclaw', 'ai-agent', 'hybrid-product', 'algorithm', 'creative-work', 'startup', 'student-team'],
  );
  for (const preset of PROJECT_PRESETS) {
    assert.match(preset.title, /\S/);
    assert.match(preset.description, /\S/);
    assert.ok(['all', 'explicit', 'criteria'].includes(preset.rules.type));
  }
});

test('HerClaw is an explicit competition set, not a keyword-shaped hardware shortcut', () => {
  const preset = PROJECT_PRESETS.find(item => item.id === 'herclaw');
  assert.equal(preset.rules.type, 'explicit');
  assert.deepEqual(preset.rules.includeCompetitionIds, HERCLAW_EXPLICIT_COMPETITION_IDS);
  assert.equal(preset.rules.keywordAny.length, 0);
  assert.equal(preset.rules.categoryAny.length, 0);
  assert.equal(new Set(HERCLAW_EXPLICIT_COMPETITION_IDS).size, 10);
});

test('HerClaw profile separates current direction from unverified capabilities', () => {
  assert.equal(HERCLAW_PROFILE.positioning, '企业 / 运营 AI 一体机');
  assert.match(HERCLAW_PROFILE.currentCapabilities.join(' '), /OpenClaw \+ Hermes/);
  assert.match(HERCLAW_PROFILE.currentCapabilities.join(' '), /飞书/);
  assert.match(HERCLAW_PROFILE.currentCapabilities.join(' '), /supervisor.*远程运维/);
  assert.match(HERCLAW_PROFILE.notAssumed.join(' '), /OTA.*验证或设计/);
  assert.match(HERCLAW_PROFILE.notAssumed.join(' '), /量产/);
  assert.match(HERCLAW_PROFILE.notAssumed.join(' '), /传感器/);
  assert.match(HERCLAW_PROFILE.notAssumed.join(' '), /家庭或教育/);
});
