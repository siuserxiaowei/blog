import assert from 'node:assert/strict';
import test from 'node:test';

import {
  competitions,
  getPrimaryDeadline,
  validateCompetitionCollectionV2,
  validateCompetitions,
} from '../src/data/competitions.js';
import {
  ROUND16_ADDITIONS_CHECKED_AT,
  competitionRound16Additions,
} from '../src/data/competition-round16-additions.js';

const activityId = 'alipay-ai-pay-developer-incentive-phase2-2026';
const finalById = new Map(competitions.map((item) => [item.id, item]));

test('round sixteen adds the Alipay AI Pay developer incentive exactly once', () => {
  assert.equal(ROUND16_ADDITIONS_CHECKED_AT, '2026-08-09');
  assert.deepEqual(competitionRound16Additions.map((item) => item.id), [activityId]);
  assert.equal(competitions.length, 439);
  assert.equal(competitions.filter((item) => item.id === activityId).length, 1);
  assert.equal(new Set(competitions.map((item) => item.id)).size, competitions.length);
});

test('the incentive is represented as a developer program rather than a cash competition', () => {
  const activity = finalById.get(activityId);
  assert.ok(activity);
  assert.equal(activity.recordType, 'program');
  assert.equal(activity.entryStatus, 'open-to-new');
  assert.match(activity.name, /支付宝.*AI.*开发者激励计划.*第?\s*2\s*期/);
  assert.match(activity.desc, /开发者激励|激励活动/);
  assert.match(activity.desc, /并非传统比赛|不是传统比赛/);
  assert.equal(activity.prizeBoundary.cash.length, 0);
  assert.equal(activity.prizeBoundary.cashStatus, 'non-cash-token-credit');
});

test('official eligibility, product scope, deadline and five cumulative token tiers stay exact', () => {
  const activity = finalById.get(activityId);
  const primary = getPrimaryDeadline(activity);

  assert.equal(primary.type, 'application');
  assert.equal(primary.date, '2026-08-21');
  assert.equal(primary.timezone, 'Asia/Shanghai');
  assert.match(activity.eligibility.scope, /个人开发者/);
  assert.match(activity.eligibility.team, /个人账号|个人开发者/);
  assert.match(activity.desc, /2026-07-15|7 月 15 日/);
  assert.match(activity.desc, /AI 按量付费/);
  assert.match(activity.desc, /AI 网页应用收款/);
  assert.match(activity.desc, /AI 移动应用收款/);

  assert.deepEqual(activity.incentiveTiers, [
    { users: 10, tokenCreditCNY: 10 },
    { users: 100, tokenCreditCNY: 50 },
    { users: 1000, tokenCreditCNY: 100 },
    { users: 5000, tokenCreditCNY: 500 },
    { users: 50000, tokenCreditCNY: 5000 },
  ]);
  assert.equal(
    activity.incentiveTiers.reduce((sum, tier) => sum + tier.tokenCreditCNY, 0),
    5660,
  );
  assert.match(activity.prizeBoundary.nonCash.join(' '), /5660.*Token|Token.*5660/);
});

test('the official program page and the user-provided ModelScope implementation article are retained separately', () => {
  const activity = finalById.get(activityId);
  const sources = new Map(activity.sources.map((source) => [source.url, source]));
  const officialUrl = 'https://aipay.alipay.com/incentive';
  const articleUrl = 'https://modelscope.cn/learn/435399';

  assert.equal(sources.get(officialUrl)?.kind, 'official');
  assert.equal(sources.get(articleUrl)?.kind, 'case-study');
  assert.match(sources.get(articleUrl)?.title ?? '', /ModelScope.*支付宝|创空间.*收款/);
  assert.match(activity.verification.notes, /案例文章不单独证明活动规则|不单独证明.*规则/);
});

test('round sixteen and the full catalogue satisfy both data contracts', () => {
  assert.deepEqual(validateCompetitions(competitionRound16Additions).errors, []);
  assert.deepEqual(validateCompetitionCollectionV2(competitionRound16Additions).errors, []);
  assert.deepEqual(validateCompetitions(competitions).errors, []);
});
