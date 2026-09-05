import { normalizeCompetitionCollection } from './competition-schema.js';

export const ROUND18_ADDITIONS_CHECKED_AT = '2026-08-09';

function source(title, url, kind = 'official') {
  return { title, date: ROUND18_ADDITIONS_CHECKED_AT, url, kind };
}

const gleeUrl = 'https://glee-competition.com/';
const gleeDocsUrl = 'https://glee-competition.com/docs';
const aiJamUrl = 'https://www.aijam-us.com/';

const additions = [
  {
    id: 'glee-economic-agents-competition-2026',
    name: 'GLEE 语言经济博弈智能体竞赛',
    fullName: 'GLEE Competition — Games in Language-based Economic Environments',
    org: 'GLEE 组织团队 · IAB Workshop @ NeurIPS 2026',
    rel: 'A+',
    loc: '全球线上 · Agent 赛道 / 人类赛道',
    date: '竞赛截止 2026-08-29（AoE）',
    deadlineISO: '2026-08-29',
    deadlineTimezone: 'Etc/GMT+12',
    tier: 'A',
    cat: 'AI 软件',
    match: 8.8,
    suit: '高；适合 Agent 策略、LLM 工程和博弈实验者，也可直接参加人类赛道',
    desc: '围绕 bargaining、negotiation、persuasion 三类自然语言经济博弈，参赛者可以用 Python SDK/API 构建自主智能体，也可以直接在浏览器参加人类赛道。两条赛道共用匹配池，按同配置收益百分位与对手强度调整后的 rating 排名。',
    strategy: 'Agent 赛道先用官方 SDK 跑通三类游戏，再做统一策略和异常超时处理；人类赛道先熟悉三类博弈规则并持续对局。要进入总榜，Agent 需要覆盖全部三类游戏，且 8 月 29 日 AoE 前保持活跃。',
    audience: 'AI Agent 开发者、博弈/多智能体研究者、LLM 应用工程师，以及希望直接与智能体对局的个人参与者',
    rewards: [
      '总奖金池 6000 美元',
      'Agent 赛道：2000 / 1250 / 1000 / 500 / 250 美元（前五名）',
      'Human 赛道：500 / 300 / 200 美元（前三名）',
      '获奖者获得 IAB Workshop @ NeurIPS 2026 官方证书；无需到悉尼现场领奖',
    ],
    pros: ['Agent 与人类两条赛道', '可直接用 Python SDK 快速参赛', '规则、评分与奖项公开', '全球线上且不要求到会'],
    cons: ['Agent 赛道需覆盖三类博弈并持续运行', '最终排名依赖对局数量和稳定性', '奖金为美元，税务和收款条件需按主办方要求确认', '全程英文交互与英文提交要求'],
    winning: ['三类游戏的综合 rating', '收益与对手强度校正后的稳定表现', '低超时和低无效动作率', '持续对局量与策略鲁棒性'],
    timeline: [
      { event: '竞赛开放', date: '2026-08-01', critical: false },
      { event: 'Agent 与 Human 赛道关闭', date: '2026-08-29', critical: true },
      { event: 'IAB Workshop @ NeurIPS 2026 论文截止（独立于排行榜）', date: '2026-08-29', critical: false },
    ],
    deadlines: [{ type: 'submission', date: '2026-08-29', certainty: 'confirmed', timezone: 'Etc/GMT+12', label: '竞赛对局与排行榜结算截止（AoE）', primary: true, sourceUrl: gleeUrl }],
    primaryDeadline: { type: 'submission', date: '2026-08-29', certainty: 'confirmed', timezone: 'Etc/GMT+12', label: '竞赛对局与排行榜结算截止（AoE）', primary: true, sourceUrl: gleeUrl },
    eligibility: { scope: 'global-online-participants', regions: ['全球线上；以官方规则与账户审核为准'], chinaEligible: 'not-stated', fee: 'not-stated', team: 'Agent 以账户和智能体参赛；Human 以个人账户参赛' },
    prizeBoundary: { cash: [{ currency: 'USD', amount: 2000, quantity: 1, scope: 'Agent 赛道第一名' }, { currency: 'USD', amount: 1250, quantity: 1, scope: 'Agent 赛道第二名' }, { currency: 'USD', amount: 1000, quantity: 1, scope: 'Agent 赛道第三名' }, { currency: 'USD', amount: 500, quantity: 1, scope: 'Agent 赛道第四名' }, { currency: 'USD', amount: 250, quantity: 1, scope: 'Agent 赛道第五名' }, { currency: 'USD', amount: 500, quantity: 1, scope: 'Human 赛道第一名' }, { currency: 'USD', amount: 300, quantity: 1, scope: 'Human 赛道第二名' }, { currency: 'USD', amount: 200, quantity: 1, scope: 'Human 赛道第三名' }], nonCash: ['IAB Workshop @ NeurIPS 2026 官方证书'], investment: [], cashStatus: 'fully-itemized-6000', ip: '官方规则未要求提交代码或转让作品权利；参赛账户、API 使用和论文投稿按各自条款执行' },
    curation: { primaryFormats: ['agent', 'multi-agent', 'research'], rewardAccessibility: 'medium', rewardEvidence: '官方首页和 Docs 均列出两条赛道、6000 美元奖金与 8 月 29 日 AoE 截止。', recommendationPriority: 'high' },
    verification: { status: 'verified', checkedAt: ROUND18_ADDITIONS_CHECKED_AT, sourceKind: 'official', linkHealth: 'reachable', notes: 'GLEE 官方首页与官方 Docs 交叉核验赛道、三类博弈、评分方式、奖金和截止时间；未将独立论文投稿截止误写成另一场比赛。' },
    sources: [source('GLEE 官方竞赛主页', gleeUrl), source('GLEE 官方 Docs｜规则、评分与奖项', gleeDocsUrl)],
    url: gleeUrl,
    recordType: 'competition',
    seriesId: null,
    parentId: null,
  },
  {
    id: 'ai-jam-us-invention-challenge-2026',
    name: 'AI-JAM US 国际 AI 发明挑战赛',
    fullName: 'AI-JAM US 2026 — 11th International AI Invention Challenge',
    org: 'AI-JAM US · Hacker Dojo（Mountain View）合作',
    rel: 'A',
    loc: '全球线上 · 学生、教育者与 AI 创新者',
    date: '作品提交截止 2026-08-30 23:59 KST',
    deadlineISO: '2026-08-30',
    deadlineTimezone: 'Asia/Seoul',
    tier: 'A',
    cat: '创意 AI',
    match: 8.1,
    suit: '高；适合已有 AI 产品点子、原型或应用故事，技术实现门槛低于算法赛',
    desc: '面向全球的 AI 创意发明挑战赛，参赛者提交恰好 3 页幻灯片和不超过 30 秒的视频，说明现实问题、AI 方案、影响与落地路径。官方页面显示报名开放、2026 年 8 月 30 日 23:59 KST 截止，结果于 9 月 6 日在线公布。',
    strategy: '把已有 AI 工具或 Agent 压缩成一个清晰的三页叙事：第一张用一个数据讲清痛点，第二张用流程图展示 AI 如何工作，第三张给出可量化影响、成本和下一步；视频严格控制在 30 秒内，并预留上传与格式检查时间。',
    audience: '全球学生、教师、开发者、创业者和 AI 创意项目团队；作品可以是概念、原型或已上线产品',
    rewards: ['全球公开展示与评审', '所有参赛者获得数字证书和 AI 增强社交媒体内容', '获奖项目获得国际 AI 创新挑战赛荣誉与线上公布机会', '官网未在公开首页列出统一现金奖，勿将宣传权益当作现金奖金'],
    pros: ['提交格式极简，适合快速参赛', '全球线上，不要求现场出席', '接受任意语言视频（官方建议英文字幕）', '适合将现有产品转成有传播力的案例'],
    cons: ['必须同时准备 3 页幻灯片和 30 秒视频', '公开首页未完整披露奖金、评审细则与费用条款', '短格式对叙事和视觉表达要求高', '需按 KST 截止并通过官方上传流程'],
    winning: ['问题定义与关键数据', 'AI 方案清晰度', '可行性与影响量化', '3 页视觉表达和 30 秒陈述的完整度'],
    timeline: [
      { event: '报名开放', date: '2026-08-09', critical: false },
      { event: '3 页幻灯片与 30 秒视频提交截止（23:59 KST）', date: '2026-08-30', critical: true },
      { event: '结果线上公布', date: '2026-09-06', critical: false },
    ],
    deadlines: [{ type: 'submission', date: '2026-08-30', certainty: 'confirmed', timezone: 'Asia/Seoul', label: '3 页幻灯片与 30 秒视频提交截止（23:59 KST）', primary: true, sourceUrl: aiJamUrl }],
    primaryDeadline: { type: 'submission', date: '2026-08-30', certainty: 'confirmed', timezone: 'Asia/Seoul', label: '3 页幻灯片与 30 秒视频提交截止（23:59 KST）', primary: true, sourceUrl: aiJamUrl },
    eligibility: { scope: 'global-online-participants', regions: ['全球线上；以官方报名和参赛指南为准'], chinaEligible: 'not-stated', fee: 'not-stated', team: '个人或团队形式以官网报名页面和 Official Guidebook 为准' },
    prizeBoundary: { cash: [], nonCash: ['数字证书', 'AI 增强社交媒体内容', '全球展示与获奖荣誉'], investment: [], cashStatus: 'not-stated', ip: '公开首页未完整披露作品授权边界；上传前应阅读 Official Guidebook、报名协议和隐私条款' },
    curation: { primaryFormats: ['pitch-deck', 'ai-application', 'creative-ai'], rewardAccessibility: 'medium', rewardEvidence: '官网首页明确 3 页、30 秒、提交截止和参与者数字证书；现金奖未在公开首页披露。', recommendationPriority: 'medium' },
    verification: { status: 'verified', checkedAt: ROUND18_ADDITIONS_CHECKED_AT, sourceKind: 'official', linkHealth: 'reachable', notes: 'AI-JAM US 官方首页核验开放报名、提交格式、2026-08-30 23:59 KST 截止和 2026-09-06 结果日期；对官网未公开的奖金与费用不作推断。' },
    sources: [source('AI-JAM US 2026 官方主页', aiJamUrl)],
    url: aiJamUrl,
    recordType: 'competition',
    seriesId: null,
    parentId: null,
  },
];

export const competitionRound18Additions = normalizeCompetitionCollection(
  additions,
  {},
  { updatedAt: ROUND18_ADDITIONS_CHECKED_AT },
);

export default competitionRound18Additions;
