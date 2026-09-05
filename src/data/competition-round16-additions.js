import { normalizeCompetitionCollection } from './competition-schema.js';

export const ROUND16_ADDITIONS_CHECKED_AT = '2026-08-09';

const incentiveUrl = 'https://aipay.alipay.com/incentive';
const incentiveAgreementUrl = 'https://opendocs.alipay.com/b/aiDeveloperIncentive';
const modelScopeCaseUrl = 'https://modelscope.cn/learn/435399';

const additions = [{
  id: 'alipay-ai-pay-developer-incentive-phase2-2026',
  name: '支付宝 AI 支付开发者激励计划第 2 期',
  fullName: '支付宝 AI 支付开发者激励计划第 2 期',
  org: '支付宝 AI 支付',
  rel: 'A+',
  loc: '中国线上 · 个人开发者',
  date: '活动及报名截止 2026-08-21',
  deadlineISO: '2026-08-21',
  deadlineTimezone: 'Asia/Shanghai',
  tier: 'S',
  cat: '渠道变现',
  match: 9.6,
  suit: '很高；适合已有 AI 应用、API、Skill 或 MCP 服务的个人开发者',
  desc: '支付宝面向个人开发者开展的第二期 AI 支付开发者激励活动，并非传统比赛。2026 年 7 月 21 日至 8 月 21 日期间，报名并接入 AI 按量付费、AI 网页应用收款或 AI 移动应用收款之一，可按累计有效交易用户数解锁阿里云 Token 包；参与产品须在 2026 年 7 月 15 日及之后开通。',
  strategy: '优先用已有可收费产品参与：先完成官方报名，再接入三类支持产品中的任意一种并上线。不要只做支付 Demo；激励按有效交易用户数计档，先争取 10 个真实付费用户拿到首档，再通过清晰付费点、低门槛首单和留存设计逐档增长。',
  audience: '已拥有或准备上线 AI 应用、API、数字内容、算力资源、Skill 或 MCP 服务的个人开发者',
  rewards: [
    '累计最高 5660 元阿里云 Token 资源包（五档累计口径）',
    '10 位有效交易用户：10 元 Token 包',
    '100 位：50 元 Token 包',
    '1000 位：100 元 Token 包',
    '5000 位：500 元 Token 包',
    '50000 位：5000 元 Token 包',
  ],
  pros: ['支付宝官方开发者激励', '个人开发者可参加', '支持网页应用、移动应用与按量付费', '可用已有产品参与', '五档门槛与权益清楚'],
  cons: ['奖励是阿里云 Token 资源包而非现金', '产品开通时间须在 7 月 15 日及之后', '按累计有效交易用户数达档', '各档达成后 T+7 解锁', '需完成支付接入并产生真实有效交易'],
  winning: ['先完成报名', '支付产品成功接入并上线', '累计有效交易用户数', '真实交易与用户留存', '支付场景合规性'],
  timeline: [
    { event: '第二期激励开始', date: '2026-07-21', critical: false },
    { event: '活动及报名截止', date: '2026-08-21', critical: true },
  ],
  entryStatus: 'open-to-new',
  recordType: 'program',
  seriesId: 'alipay-ai-pay-developer-incentive',
  parentId: null,
  eligibility: {
    scope: '个人开发者',
    regions: ['中国线上；以支付宝账号认证及活动协议为准'],
    chinaEligible: 'yes',
    fee: 'free',
    team: '以完成认证的个人账号报名；官方页面明确面向个人开发者',
  },
  incentiveTiers: [
    { users: 10, tokenCreditCNY: 10 },
    { users: 100, tokenCreditCNY: 50 },
    { users: 1000, tokenCreditCNY: 100 },
    { users: 5000, tokenCreditCNY: 500 },
    { users: 50000, tokenCreditCNY: 5000 },
  ],
  prizeBoundary: {
    cash: [],
    nonCash: ['五档累计最高 5660 元阿里云 Token 资源包；不是现金，达档后 T+7 解锁'],
    investment: [],
    cashStatus: 'non-cash-token-credit',
    ip: '活动不要求转让参赛作品知识产权；支付产品、交易与材料使用边界以《支付宝 AI 生态开发者激励计划》及业务协作协议为准',
  },
  deadlines: [{
    type: 'application',
    date: '2026-08-21',
    certainty: 'confirmed',
    timezone: 'Asia/Shanghai',
    label: '第二期活动及报名截止',
    primary: true,
    sourceUrl: incentiveUrl,
  }],
  primaryDeadline: {
    type: 'application',
    date: '2026-08-21',
    certainty: 'confirmed',
    timezone: 'Asia/Shanghai',
    label: '第二期活动及报名截止',
    primary: true,
    sourceUrl: incentiveUrl,
  },
  curation: {
    primaryFormats: ['software-product', 'api', 'skill', 'mcp'],
    rewardAccessibility: 'high',
    rewardEvidence: '官网明确个人开发者、三类产品、五档有效交易用户门槛及累计最高 5660 元 Token 资源包。',
    recommendationPriority: 'highest',
  },
  verification: {
    status: 'verified',
    checkedAt: ROUND16_ADDITIONS_CHECKED_AT,
    sourceKind: 'official',
    linkHealth: 'reachable',
    notes: '活动名称、对象、周期、产品范围、开通时间门槛与五档 Token 激励均由支付宝官方激励页核验。ModelScope 文章 435399 是 AI 网页应用收款的真实接入案例，案例文章不单独证明活动规则。',
  },
  sources: [
    { title: '支付宝 AI 支付官方｜开发者激励计划第 2 期', date: ROUND16_ADDITIONS_CHECKED_AT, url: incentiveUrl, kind: 'official' },
    { title: '支付宝官方｜AI 生态开发者激励计划协议', date: ROUND16_ADDITIONS_CHECKED_AT, url: incentiveAgreementUrl, kind: 'official' },
    { title: 'ModelScope 案例｜给创空间施一场“收款魔法”：ModelScope 创空间 × 支付宝接入实战', date: ROUND16_ADDITIONS_CHECKED_AT, url: modelScopeCaseUrl, kind: 'case-study' },
  ],
  url: incentiveUrl,
}];

export const competitionRound16Additions = normalizeCompetitionCollection(
  additions,
  {},
  { updatedAt: ROUND16_ADDITIONS_CHECKED_AT },
);
