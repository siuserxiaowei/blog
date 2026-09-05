import { normalizeCompetitionCollection } from './competition-schema.js';

export const ROUND19_ADDITIONS_CHECKED_AT = '2026-08-09';

function source(title, url, kind = 'official') {
  return { title, date: ROUND19_ADDITIONS_CHECKED_AT, url, kind };
}

function addition(record) {
  const primaryDeadline = record.primaryDeadline ?? {
    type: record.deadlineType ?? 'submission',
    date: record.deadlineISO,
    certainty: 'confirmed',
    timezone: record.deadlineTimezone ?? 'Asia/Shanghai',
    label: record.deadlineLabel,
    primary: true,
    sourceUrl: record.url,
  };
  return {
    rel: 'A', tier: 'A', recordType: 'competition', seriesId: null, parentId: null,
    entryStatus: 'open-to-new',
    fullName: record.fullName ?? record.name,
    deadlines: [primaryDeadline], primaryDeadline,
    verification: { status: 'verified', checkedAt: ROUND19_ADDITIONS_CHECKED_AT, sourceKind: 'official', linkHealth: 'reachable', notes: record.verificationNotes ?? '官方赛事页面已核对开放状态、截止日期、参赛对象与奖励；未披露字段保持 not-stated。' },
    ...record,
    deadlines: [primaryDeadline], primaryDeadline,
  };
}

const additions = [
  addition({
    id: 'cdir-agentic-regulator-hackathon-2026',
    name: 'C:\\>DIR Agentic Regulator Hackathon',
    fullName: 'C:\\>DIR Global Agentic Regulator Hackathon 2026',
    org: 'C:\\>DIR Global · Cambridge Regulator Fellows',
    loc: '全球线上 · 面向监管、金融科技与 AI 构建者',
    date: '概念说明提交截止 2026-08-09 23:59 BST',
    deadlineISO: '2026-08-09', deadlineTimezone: 'Europe/London', deadlineType: 'submission', deadlineLabel: '初赛 Concept Note 提交截止（23:59 BST）',
    cat: '安全攻防', match: 8.7,
    suit: '高；适合金融风控、反欺诈、支付监管、Agent 安全与合规工作流',
    desc: '面向全球监管机构、金融机构、金融科技企业、研究者和开发者的 Agentic AI 监管黑客松。初赛提交每个问题空间不超过 1500 字的 Concept Note 和示意图；入选队伍在 9 月 1—8 日使用合成数据与工具构建原型。',
    strategy: '优先选择反欺诈、Know Your Agent 或 Agentic Payments 方向，用一页架构图讲清数据来源、人工复核、审计轨迹和安全控制；概念说明必须在英国夏令时 8 月 9 日 23:59 前提交。',
    audience: '全球监管机构、金融机构、FinTech、AI 工程师、研究者、创业者和学生；可跨学科组队',
    rewards: ['总奖池最高 10 万美元', '前六名 7.5 万美元（第一名 3.5 万、第二名 1.5 万、第三名 1 万，第四至第六名各 5000 美元）', 'Vouch.finance 特别奖最高 2.5 万美元', '入选决赛队伍可获 300 英镑云算力；获奖队伍可能获新加坡金融科技节门票'],
    pros: ['真实监管问题与公开问题空间', 'Agent 安全/合规方向匹配', '全球线上初赛', '奖池和评审流程公开'],
    cons: ['初赛截止非常近', '金融监管知识门槛高', '决赛原型周期仅一周', '奖金部分按监管机构归属规则发放'],
    winning: ['问题定义与监管价值', '可审计、可解释和 human-in-the-loop 设计', '反欺诈/支付/身份验证场景落地性', '原型安全与可迁移性'],
    timeline: [{ event: '初赛 Concept Note 截止（23:59 BST）', date: '2026-08-09', critical: true }, { event: '虚拟原型开发周', date: '2026-09-01' }, { event: 'Demo 与监管者投票', date: '2026-09-15' }, { event: '获奖公布', date: '2026-09-18' }],
    eligibility: { scope: 'global-online-participants', regions: ['全球'], chinaEligible: 'not-stated', fee: 'free', team: '跨学科团队；官方欢迎个人申请后组队' },
    prizeBoundary: { cash: [{ currency: 'USD', amount: 35000, quantity: 1, scope: '第一名' }, { currency: 'USD', amount: 15000, quantity: 1, scope: '第二名' }, { currency: 'USD', amount: 10000, quantity: 1, scope: '第三名' }], nonCash: ['云算力', '新加坡金融科技节门票（获奖队伍）'], investment: [], cashStatus: 'partially-itemized-100000', ip: '官方鼓励开源但不强制；按活动条款提交' },
    sources: [source('C:\\>DIR 官方赛事页', 'https://www.cdir.global/cdir-hackathon')],
    url: 'https://www.cdir.global/cdir-hackathon',
  }),
  addition({
    id: 'chimera-agent-miccai-2026',
    name: 'CHIMERA-agent 医疗决策智能体挑战赛',
    fullName: 'CHIMERA-agent Challenge · MICCAI 2026',
    org: 'Radboudumc / CHIMERA-agent 组织团队',
    loc: '全球线上 · 医疗 AI 研究与 Agent 决策',
    date: '测试集提交截止 2026-09-10',
    deadlineISO: '2026-09-10', deadlineTimezone: 'Europe/Amsterdam', deadlineType: 'submission', deadlineLabel: '测试集提交截止',
    cat: '数据算法', match: 8.4,
    suit: '高；适合医疗多模态、临床推理、可解释 Agent 和决策策略编排',
    desc: 'MICCAI 2026 相关的前列腺癌临床决策智能体挑战，覆盖 MRI 术前活检决策、MRI+病理风险分层和术后复发预测。参赛者提交预测及结构化 reasoning trace，重点考察缺失模态、纵向证据和冲突信息下的决策。',
    strategy: '先注册并跑通官方 baseline，再把多模态工具编排、证据引用和结构化推理 trace 做成可复现流程；官方明确不要求从零训练模型。',
    audience: '全球医疗 AI 研究者、临床 NLP/影像团队、Agent 工程师和高校科研团队',
    rewards: ['MICCAI 2026 竞赛展示与学术曝光', '官方页面未披露统一现金奖'],
    pros: ['Agent-level reasoning 评价清晰', '官方提供预训练工具和 baseline', '医学多模态研究价值高', '可线上提交'],
    cons: ['需要医疗数据与临床知识', '结果需提交结构化推理轨迹', '官方未披露现金奖金', '可能需要 MICCAI 会议相关安排'],
    winning: ['预测性能', '推理轨迹对证据的忠实度', '缺失/冲突模态处理', '可复现性与临床合理性'],
    timeline: [{ event: '开放注册与训练数据发布', date: '2026-07-10' }, { event: '验证阶段及公开榜单开始', date: '2026-08-10' }, { event: '测试集提交截止', date: '2026-09-10', critical: true }, { event: 'MICCAI 2026', date: '2026-09-27' }],
    eligibility: { scope: 'global-online-participants', regions: ['全球'], chinaEligible: 'not-stated', fee: 'not-stated', team: '个人或团队以 Grand Challenge 账户规则为准' },
    prizeBoundary: { cash: [], nonCash: ['MICCAI 2026 竞赛展示与学术曝光'], investment: [], cashStatus: 'not-stated', ip: '按 Grand Challenge 与赛事规则执行' },
    sources: [source('CHIMERA-agent 官方主页', 'https://chimera-agent.grand-challenge.org/'), source('CHIMERA-agent 官方赛程', 'https://chimera-agent.grand-challenge.org/challenge-timeline/')],
    url: 'https://chimera-agent.grand-challenge.org/',
  }),
  addition({
    id: 'agi-international-ai-app-challenge-2026',
    name: 'AGI International AI/APP Innovation Challenge',
    fullName: 'AGI International AI/APP Innovation Challenge 2026',
    org: 'Amazing Grace Institute / ESCEDU',
    loc: '全球线上 · 6—12 年级学生',
    date: '作品提交截止 2026-09-21',
    deadlineISO: '2026-09-21', deadlineTimezone: 'America/New_York', deadlineType: 'submission', deadlineLabel: '作品提交截止',
    cat: '学生限定', match: 7.2,
    suit: '中等；仅适合 6—12 年级学生团队的 AI 应用项目',
    desc: '面向全球 6—12 年级学生的 AI/APP 创新挑战，围绕社区服务、健康、环境、教育、家庭、代际关怀等真实问题开发 AI 应用。官方页面列出 9 月 21 日提交截止、9 月 24 日入围公布和 9 月 27 日答辩评审。',
    strategy: '选一个可在短周期内演示的公益应用闭环，明确用户、风险边界和 AI 的具体作用；报名和提交需以官方活动页面为准。',
    audience: '全球 6—12 年级学生；中国大陆参赛可行性需向主办方确认',
    rewards: ['行业评委答辩与项目展示', '官方页面未披露统一现金奖金'],
    pros: ['主题贴近真实社会问题', '学生项目可用 AI/APP 原型参赛', '全球线上准备'],
    cons: ['年龄资格严格', '奖项和费用信息披露有限', '中国参赛安排未明确', '需参加最终线上/线下活动安排'],
    winning: ['社会影响', '应用可行性', 'AI 创新性', '演示和答辩表达'],
    timeline: [{ event: '作品提交截止', date: '2026-09-21', critical: true }, { event: '入围公布', date: '2026-09-24' }, { event: '最终展示与评审', date: '2026-09-27' }],
    eligibility: { scope: 'global-students', regions: ['全球；6—12 年级'], chinaEligible: 'not-stated', fee: 'not-stated', team: '学生个人或团队以官方报名规则为准' },
    prizeBoundary: { cash: [], nonCash: ['行业评委展示与赛事荣誉'], investment: [], cashStatus: 'not-stated', ip: '未在公开赛事页完整披露' },
    sources: [source('AGI Innovation AI/APP Challenge 官方页面', 'https://escedu.org/2026agi/')],
    url: 'https://escedu.org/2026agi/',
  }),
];

export const competitionRound19Additions = normalizeCompetitionCollection(additions, {}, { updatedAt: ROUND19_ADDITIONS_CHECKED_AT });
export default competitionRound19Additions;
