import { normalizeCompetitionCollection } from './competition-schema.js';

export const ROUND21_ADDITIONS_CHECKED_AT = '2026-08-09';

const awsUrl = 'https://aws.amazon.com/cn/local/hongkong/idea-to-frontier/';
const applicationUrl = 'https://pages.awscloud.com/From-idea-Frontier-SC.html';

const additions = [{
  id: 'aws-from-idea-to-frontier-2026',
  name: 'AWS From Idea to Frontier 创业加速计划',
  fullName: 'Amazon Web Services China · From Idea to Frontier 2026',
  org: '亚马逊云科技中国',
  rel: 'A+',
  loc: '中国创业者 · 线上申请 + 培育 + 全球 re:Invent Showcase',
  date: '申请截止 2026-08-12',
  deadlineISO: '2026-08-12',
  deadlineTimezone: 'Asia/Shanghai',
  deadlineType: 'application',
  deadlineLabel: '申请截止',
  tier: 'A',
  cat: '创业路演',
  match: 9.4,
  suit: '很高；适合一人公司、独立开发者、AI 产品创业者和有出海计划的小团队',
  desc: 'AWS 中国区 2026 年度创业加速计划，面向一人公司、独立开发者、连续创业者及潜在创业者，提供 AWS Credits、资深架构师技术辅导、VC/合作伙伴/海外法律专家支持和全球开发者社群连接。官方流程为 8 月 15 日公布 Top 100，8—10 月培育，10 月中 Top 50，11 月中 Top 5，12 月在拉斯维加斯 AWS re:Invent Showcase。',
  strategy: '用“单人成军 + AI 产品 + 已有用户/收入 + 出海路径”组织申请材料；产品信息、技术介绍和海外市场计划要在表单里讲清楚。若通过 VibeFriends 获知活动，用户提供的报名提示是推荐字段填写“VibeFriends”，但具体内推规则以表单页面为准。',
  audience: '10 人以下团队（含独立创始人）；成立不超过 2 年；有正常运营的网站、公开资料或商业计划书；明确出海意愿和全球市场潜力；未曾加入过云创计划。',
  rewards: ['Top 100 进入培育阶段', 'AWS Activate Credits 云服务抵扣额度（具体金额按入选层级/官方条款）', 'AWS 资深架构师 1:1 技术辅导、商业课程、VC Demo Day 和合作伙伴/海外法律专家资源', 'Top 5 进入 2026 AWS re:Invent 拉斯维加斯 Showcase（2026-11-30 至 12-04）', '用户提供的活动信息称 Top 100 最高可获 17.5 万元云资源抵扣券；AWS 页面公开正文未列出该金额，报名时应以官方表单/入选通知为准'],
  pros: ['AWS 官方创业加速计划', '一人公司和独立开发者明确适配', '出海法律、市场和技术支持完整', 'Top 5 获全球 re:Invent 舞台展示'],
  cons: ['申请截止很近', '需要公司/项目公开材料和明确出海计划', 'Top 100/Top 50/Top 5 是筛选结果，不是报名即得', '云 Credits 不是现金且具体额度需以官方条款确认', 're:Invent 线下旅行成本与签证需自行规划'],
  winning: ['产品真实进展与用户价值', '全球市场潜力', 'AI/云技术路线和可扩展性', '创始人执行力', '出海与商业化计划'],
  timeline: [
    { event: '申请截止', date: '2026-08-12', critical: true },
    { event: 'Top 100 公布并进入培育', date: '2026-08-15', critical: true },
    { event: 'Top 50 公布', date: '2026-10-15', critical: false },
    { event: 'Top 5 公布', date: '2026-11-15', critical: true },
    { event: 'AWS re:Invent Showcase（拉斯维加斯）', date: '2026-12-04', critical: false },
  ],
  deadlines: [{ type: 'application', date: '2026-08-12', certainty: 'confirmed', timezone: 'Asia/Shanghai', label: '申请截止', primary: true, sourceUrl: awsUrl }],
  primaryDeadline: { type: 'application', date: '2026-08-12', certainty: 'confirmed', timezone: 'Asia/Shanghai', label: '申请截止', primary: true, sourceUrl: awsUrl },
  eligibility: { scope: 'china-startups-and-builders', regions: ['中国创业者/团队；需具备全球市场潜力'], chinaEligible: 'yes', fee: 'free', team: '10 人以下团队，含独立创始人；成立不超过 2 年；未加入过云创计划' },
  prizeBoundary: { cash: [], nonCash: ['AWS Activate Credits（云服务抵扣额度）', '技术与商业导师支持', 'Top 5 re:Invent Showcase'], investment: ['VC Demo Day 与资本/合作伙伴对接机会（非投资承诺）'], cashStatus: 'not-stated', ip: '按 AWS 申请表、培育计划和 Showcase 条款执行' },
  curation: { primaryFormats: ['startup', 'ai-application', 'one-person-company', 'global-expansion'], rewardAccessibility: 'medium', rewardEvidence: 'AWS 官方页明确 Credits、培育流程、Top 100/50/5 节点和 re:Invent Showcase；17.5 万元额度来自用户提供的活动信息，需以入选通知确认。', recommendationPriority: 'high' },
  verification: { status: 'verified', checkedAt: ROUND21_ADDITIONS_CHECKED_AT, sourceKind: 'official', linkHealth: 'reachable', notes: 'AWS 中国官方页面核验申请截止、筛选节点、申请条件、导师/云 Credits 支持和 re:Invent 日期；用户提供的 VibeFriends 推荐字段与 17.5 万元最高额度作为补充信息单独标注，未写成 AWS 页面已公开事实。' },
  sources: [
    { title: 'AWS 中国官方｜From Idea to Frontier', date: ROUND21_ADDITIONS_CHECKED_AT, url: awsUrl, kind: 'official' },
    { title: 'AWS 官方申请入口', date: ROUND21_ADDITIONS_CHECKED_AT, url: applicationUrl, kind: 'official' },
  ],
  url: applicationUrl,
  recordType: 'program',
  seriesId: null,
  parentId: null,
}];

export const competitionRound21Additions = normalizeCompetitionCollection(additions, {}, { updatedAt: ROUND21_ADDITIONS_CHECKED_AT });
export default competitionRound21Additions;
