import assert from 'node:assert/strict';
import test from 'node:test';

import { evaluateCompetitionIntake } from '../src/lib/competition-curation.js';

function candidate(overrides = {}) {
  return {
    id: 'candidate',
    name: '候选赛事',
    rewards: [],
    curation: { primaryFormats: ['software-product'] },
    ...overrides,
  };
}

test('software and agent competitions remain eligible even when one optional track mentions music', () => {
  const result = evaluateCompetitionIntake(candidate({
    curation: {
      primaryFormats: ['software-product', 'agent'],
      secondaryFormats: ['music'],
    },
  }));

  assert.equal(result.decision, 'include');
  assert.equal(result.reasonCode, 'preferred-format');
});

test('video-only and music-only competitions are excluded by default', () => {
  for (const primaryFormat of ['video', 'music']) {
    const result = evaluateCompetitionIntake(candidate({
      curation: { primaryFormats: [primaryFormat] },
    }));
    assert.equal(result.decision, 'exclude', primaryFormat);
    assert.equal(result.reasonCode, 'low-priority-media-format', primaryFormat);
  }
});

test('a media-only competition needs explicit, evidence-backed easy rewards for an exception', () => {
  const result = evaluateCompetitionIntake(candidate({
    rewards: ['完成有效投稿即可获得 500 元固定奖励'],
    curation: {
      primaryFormats: ['video'],
      rewardAccessibility: 'high',
      rewardEvidence: '官方规则明确：所有通过基础审核的有效投稿都获得固定奖励。',
    },
  }));

  assert.equal(result.decision, 'include');
  assert.equal(result.reasonCode, 'accessible-reward-exception');
});

test('a large prize pool alone does not qualify as an easy-reward exception', () => {
  const result = evaluateCompetitionIntake(candidate({
    rewards: ['冠军 100 万元'],
    curation: {
      primaryFormats: ['music'],
      rewardAccessibility: 'low',
      rewardEvidence: '只有一个冠军席位。',
    },
  }));

  assert.equal(result.decision, 'exclude');
  assert.equal(result.reasonCode, 'low-priority-media-format');
});

test('legacy creative media records are recognized by explicit creation terms in their titles', () => {
  for (const name of ['AI 视频创作大赛', 'AIGC 微短剧征集', 'AI 音乐创作赛', 'Sound Design Competition']) {
    const result = evaluateCompetitionIntake(candidate({ name, fullName: name, curation: undefined }));
    assert.equal(result.decision, 'exclude', name);
  }
});

test('demo-video requirements and video-understanding algorithms are not mistaken for media creation contests', () => {
  for (const record of [
    candidate({ name: 'AI Agent 开发赛', desc: '提交代码、说明和 3 分钟 Demo 视频', curation: undefined }),
    candidate({ name: 'Long Video Understanding Challenge', desc: '对长视频数据进行算法建模', curation: undefined }),
  ]) {
    assert.equal(evaluateCompetitionIntake(record).decision, 'include', record.name);
  }
});
