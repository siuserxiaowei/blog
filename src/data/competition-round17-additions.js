import { normalizeCompetitionCollection } from './competition-schema.js';

export const ROUND17_ADDITIONS_CHECKED_AT = '2026-08-09';

function source(title, url, kind = 'official') {
  return { title, date: ROUND17_ADDITIONS_CHECKED_AT, url, kind };
}

function trackedAddition(record) {
  const primaryDeadline = record.primaryDeadline;
  const deadlines = record.deadlines ?? [primaryDeadline];
  return {
    rel: 'A+',
    tier: 'A',
    cat: 'AI 软件',
    recordType: 'competition',
    seriesId: null,
    parentId: null,
    fullName: record.name,
    entryStatus: 'open-to-new',
    verification: {
      status: 'verified',
      checkedAt: ROUND17_ADDITIONS_CHECKED_AT,
      sourceKind: 'official',
      linkHealth: 'reachable',
      notes: '活动身份、关键期限、资格与奖励均按所列官方页面核验；图片规则经本地中文 OCR 后再由原图人工复核。',
    },
    ...record,
    deadlines,
    primaryDeadline,
    timeline: record.timeline ?? deadlines
      .filter((deadline) => deadline.date)
      .map((deadline) => ({
        event: deadline.label,
        date: deadline.date,
        critical: Boolean(deadline.primary),
      })),
  };
}

const modelScopeIndexUrl = 'https://modelscope.cn/api/v1/competitions';
const aiInfinityUrl = 'https://modelscope.cn/events/320/summary';
const aiInfinityLandingUrl = 'https://modelscope.cn/active/AIstudio';
const aiInfinityPosterUrl = 'https://resources.modelscope.cn/race/image/1bd43f85-5ea7-4c85-957f-76e153e2b9da.jpg';
const miniCpmUrl = 'https://modelscope.cn/events/291/summary';
const miniCpmOfficialUrl = 'https://ascend.openbmb.cn/';
const skillsUrl = 'https://modelscope.cn/events/289/summary';
const skillsCenterUrl = 'https://www.modelscope.cn/skills';
const localSkillGuideUrl = 'https://github.com/openvino-dev-samples/local-ai-skill-authoring';
const ventureDUrl = 'https://modelscope.cn/events/331/summary';
const ventureDRegisterUrl = 'https://wj.qq.com/s2/27332848/a062';
const medicalUrl = 'https://modelscope.cn/events/254/summary';
const medicalPlatformUrl = 'https://www.modelscope.cn/studios/baconroot/virtual_hospital';
const harmonyAppUrl = 'https://developer.huawei.com/consumer/cn/activity/harmonyos-incentive/2026';
const harmonyAppSignupUrl = 'https://developer.huawei.com/consumer/cn/activity/601774318225779899/signup';
const harmonyAgentUrl = 'https://developer.huawei.com/consumer/cn/activity/incentive/ai/';

const additions = [
  trackedAddition({
    id: 'ai-infinity-developer-creation-2026',
    modelScopeId: 320,
    name: 'AI+∞ 开发者创作大赛 · 第一期 AI+运营',
    org: '魔搭社区 · Qoder',
    loc: '中国线上 · 个人创作者优先',
    date: '报名及作品提交截止 2026-08-10 23:59',
    deadlineISO: '2026-08-10',
    deadlineTimezone: 'Asia/Shanghai',
    tier: 'S',
    match: 9.8,
    suit: '极高；截止只剩 1 天，适合已有运营工具原型者',
    desc: '魔搭社区与 Qoder 发起的月度开发者创作赛，第一期主题为“AI+运营”。要求把运营场景中的真实问题做成可运行、可体验、可推广的提效工具，并部署到魔搭创空间；方向覆盖运营建站、AI 私域、增长实验、内容工厂、数据驾驶舱和 Vibe Marketing。',
    strategy: '只用已有原型冲刺：今天完成公开参赛方案和报名，明天前部署创空间 Demo，并发布与作品强相关的研习社文章。优先选择能量化节省时间或提升转化的单一运营流程，不要临时堆成大平台。',
    audience: '运营工具、AI Agent、内容自动化、增长工具和 Vibe Coding 开发者；官方元数据同时标有个人/团队报名与单人成员上限，组队前需在报名页复核',
    rewards: [
      '现金奖合计 2 万元（含税）',
      '一等奖 8000 元、二等奖 5000 元、三等奖 2000 元',
      '优秀创作奖 4 名 × 1000 元；社交人气奖 2 名 × 500 元',
      '各奖项另含 Qoder Credits、Notebook GPU 时长与魔粒值',
      '优秀创作者有机会成为后续“运营合伙人”',
    ],
    pros: ['国内大厂开发者生态', '运营软件和 Agent 方向直接', '作品可用 AI Coding 快速完成', '现金与开发资源拆分清楚'],
    cons: ['截止仅剩 1 天', '需公开发布参赛方案与创作内容', '需部署到魔搭创空间', '社交人气奖依赖互动数据'],
    winning: ['问题与用户价值', '可运行 Demo', '作品完成度', '运营提效或增长证据', '评委评分 80% + 作品影响力 20%'],
    eligibility: {
      scope: 'public-developers',
      regions: ['中国线上；以官方报名页为准'],
      chinaEligible: 'yes',
      fee: 'free',
      team: '官方目录元数据标记个人/团队均可，但同时显示 MemberLimit=1；按单人准备最稳妥，组队须在报名页复核',
    },
    prizeBoundary: {
      cash: [
        { currency: 'CNY', amount: 8000, quantity: 1, scope: '一等奖（含税）' },
        { currency: 'CNY', amount: 5000, quantity: 1, scope: '二等奖（含税）' },
        { currency: 'CNY', amount: 2000, quantity: 1, scope: '三等奖（含税）' },
        { currency: 'CNY', amount: 1000, quantity: 4, scope: '优秀创作奖（含税）' },
        { currency: 'CNY', amount: 500, quantity: 2, scope: '社交人气奖（含税）' },
      ],
      nonCash: ['Qoder Credits', 'Notebook GPU 时长', '魔粒值', '证书与官方传播'],
      investment: [],
      cashStatus: 'fully-itemized-20000',
      ip: '海报未完整披露作品知识产权与展示授权；提交前复核报名协议，并确保公开内容、素材和代码可授权展示',
    },
    deadlines: [
      { type: 'registration', date: '2026-08-10', certainty: 'confirmed', timezone: 'Asia/Shanghai', label: '公开参赛方案及报名截止（23:59）', primary: false, sourceUrl: aiInfinityPosterUrl },
      { type: 'submission', date: '2026-08-10', certainty: 'confirmed', timezone: 'Asia/Shanghai', label: '创空间 Demo 与研习社文章提交截止（23:59）', primary: true, sourceUrl: aiInfinityPosterUrl },
      { type: 'results', date: '2026-08-15', certainty: 'confirmed', timezone: 'Asia/Shanghai', label: '结果公布', primary: false, sourceUrl: aiInfinityPosterUrl },
    ],
    primaryDeadline: { type: 'submission', date: '2026-08-10', certainty: 'confirmed', timezone: 'Asia/Shanghai', label: '创空间 Demo 与研习社文章提交截止（23:59）', primary: true, sourceUrl: aiInfinityPosterUrl },
    timeline: [
      { event: '报名与核心创作期截止', date: '2026-08-10', critical: true },
      { event: '评委评审与影响力评估结束', date: '2026-08-14', critical: false },
      { event: '结果公布', date: '2026-08-15', critical: false },
    ],
    curation: { primaryFormats: ['agent', 'software-product', 'vibe-coding'], rewardAccessibility: 'high', rewardEvidence: '官方海报逐项列出 2 万元现金、Credits、GPU 与魔粒值。', recommendationPriority: 'highest' },
    verification: {
      status: 'verified', checkedAt: ROUND17_ADDITIONS_CHECKED_AT, sourceKind: 'official', linkHealth: 'reachable',
      notes: 'ModelScope 官方目录记录 320 与活动落地页交叉核验；长海报经 tesseract chi_sim+eng 分段 OCR，再人工核对报名、提交、结果和奖项区域。',
    },
    sources: [
      source('ModelScope 官方｜AI+∞ 开发者创作大赛', aiInfinityUrl),
      source('魔搭 × Qoder 官方活动页｜第一期 AI+运营', aiInfinityLandingUrl),
      source('官方长海报｜赛程、奖项与提交要求', aiInfinityPosterUrl),
      source('ModelScope 官方竞赛目录接口｜记录 320', modelScopeIndexUrl),
    ],
    url: aiInfinityLandingUrl,
  }),

  trackedAddition({
    id: 'minicpm-ascend-challenge-2026',
    modelScopeId: 291,
    name: 'MiniCPM × 昇腾推理优化与应用创新挑战赛',
    org: 'OpenBMB · 华为昇腾生态 · 昇思 MindSpore',
    loc: '中国线上 · 个人或团队',
    date: '当前官网作品提交截止 2026-08-31',
    deadlineISO: '2026-08-31',
    deadlineTimezone: 'Asia/Shanghai',
    tier: 'S',
    match: 9.6,
    suit: '很高；应用赛道适合多模态产品，性能赛道适合 AI Infra',
    desc: '围绕 MiniCPM-o 4.5 全模态模型与昇腾 NPU 开设“高性能推理优化”和“创新应用”两大赛道。前者要求完成推理适配、benchmark 与复现材料；后者可提交实时问答、伴随式助手、视觉/语音交互、端侧应用等可运行 Demo。',
    strategy: '应用开发者直接选创新应用赛道，用视觉、语音、文本三种能力做一个完整交互闭环；AI Infra 团队才选性能赛道，并先建立 TTFT、RTF、吞吐和资源占用基线。以当前 OpenBMB 官网 8 月 31 日提交截止为准。',
    audience: 'AI 产品开发者、多模态交互团队、学生创新团队、应用工程团队，以及推理/编译/算子优化开发者',
    rewards: ['总奖金 406,000 元（税前）', '高性能赛道：9 万 / 5 万×2 / 2.7 万×3', '创新应用赛道：5.5 万 / 2.5 万×2 / 1 万×3'],
    pros: ['OpenBMB 与华为昇腾生态', '应用与性能双赛道', '现金奖高且逐项披露', '支持个人和团队', '当前官网延长到 8 月 31 日'],
    cons: ['必须使用 MiniCPM-o 4.5 与昇腾环境', '性能赛道复现要求高', '应用赛道也需可运行 Demo 和完整材料', 'ModelScope 旧正文与当前官网日期不一致'],
    winning: ['全模态能力使用深度', '可运行与可复现', '交互体验', '延迟与吞吐证据', '真实场景价值'],
    eligibility: {
      scope: 'public-developers-and-teams',
      regions: ['中国及可访问官方昇腾环境的开发者；以官网协议为准'],
      chinaEligible: 'yes',
      fee: 'free',
      team: '当前官网明确支持个人和团队参赛；报名时选择个人或创建/加入团队',
    },
    prizeBoundary: {
      cash: [
        { currency: 'CNY', amount: 90000, quantity: 1, scope: '高性能推理优化赛道冠军（税前）' },
        { currency: 'CNY', amount: 50000, quantity: 2, scope: '高性能推理优化赛道亚军（税前）' },
        { currency: 'CNY', amount: 27000, quantity: 3, scope: '高性能推理优化赛道季军（税前）' },
        { currency: 'CNY', amount: 55000, quantity: 1, scope: '创新应用赛道冠军（税前）' },
        { currency: 'CNY', amount: 25000, quantity: 2, scope: '创新应用赛道亚军（税前）' },
        { currency: 'CNY', amount: 10000, quantity: 3, scope: '创新应用赛道季军（税前）' },
      ],
      nonCash: ['赛事徽章、技术生态展示与社区传播'],
      investment: [],
      cashStatus: 'fully-itemized-406000',
      ip: '当前官网说明获奖作品授权主办方用于赛事传播、案例展示与技术交流，署名归原作者或原团队',
    },
    deadlines: [
      { type: 'submission', date: '2026-08-31', certainty: 'confirmed', timezone: 'Asia/Shanghai', label: '当前 OpenBMB 官网作品提交截止', primary: true, sourceUrl: miniCpmOfficialUrl },
      { type: 'review', date: '2026-09-15', certainty: 'confirmed', timezone: 'Asia/Shanghai', label: '复现评审', primary: false, sourceUrl: miniCpmOfficialUrl },
      { type: 'results', date: '2026-10-01', certainty: 'confirmed', timezone: 'Asia/Shanghai', label: '奖励发放', primary: false, sourceUrl: miniCpmOfficialUrl },
    ],
    primaryDeadline: { type: 'submission', date: '2026-08-31', certainty: 'confirmed', timezone: 'Asia/Shanghai', label: '当前 OpenBMB 官网作品提交截止', primary: true, sourceUrl: miniCpmOfficialUrl },
    timeline: [
      { event: '当前官网作品提交截止', date: '2026-08-31', critical: true },
      { event: '复现评审', date: '2026-09-15', critical: false },
      { event: '奖励发放', date: '2026-10-01', critical: false },
    ],
    curation: { primaryFormats: ['agent', 'software-product', 'ai-infra'], rewardAccessibility: 'high', rewardEvidence: '当前 OpenBMB 官网与 ModelScope 官方页均列出总奖金 406,000 元和双赛道奖项。', recommendationPriority: 'highest' },
    verification: {
      status: 'verified', checkedAt: ROUND17_ADDITIONS_CHECKED_AT, sourceKind: 'official', linkHealth: 'reachable',
      notes: '发现官方记录日期漂移：ModelScope 列表接口仍显示报名 8 月 14 日，页面旧正文写作品 8 月 17 日；OpenBMB 官网于 8 月 7 日更新为开放报名 7 月 22 日、作品提交 8 月 31 日。按当前主赛官网的更新口径建模并保留冲突说明。',
    },
    sources: [
      source('OpenBMB 官方｜MiniCPM × 昇腾挑战赛', miniCpmOfficialUrl),
      source('ModelScope 官方｜赛事镜像与旧版日程', miniCpmUrl),
      source('ModelScope 官方竞赛目录接口｜记录 291', modelScopeIndexUrl),
    ],
    url: miniCpmOfficialUrl,
  }),

  trackedAddition({
    id: 'production-ai-skills-2026',
    modelScopeId: 289,
    name: 'Production AI Skills 大赛',
    fullName: 'Production AI Skills 大赛——从智能体工作流迈向生产力 Skills',
    org: '英特尔 · OpenVINO · 魔搭社区',
    loc: '中国线上 · 个人 Skill 开发者',
    date: '作品及传播数据截止 2026-08-31 23:59',
    deadlineISO: '2026-08-31',
    deadlineTimezone: 'Asia/Shanghai',
    tier: 'S',
    match: 9.8,
    suit: '极高；直接匹配 Agent Skill、本地 AI 和生产力工作流',
    desc: '要求为 Qoder、WorkBuddy、TRAE Work 等生产力 Agent 工具开发可稳定调用的本地 AI Skill，把 OCR、ASR、TTS、RAG、数据分析等能力嵌入真实工作流。涉及模型必须支持 Localhost 本地运行，作品需发布到魔搭 Skills 中心，并附代码、文档、测试用例和研习社文章。',
    strategy: '复用现有本地 OCR、知识库、文档处理或代码审查能力，先做一个可安装、可测试、可重复调用的 Skill；用 Qoder/WorkBuddy/TRAE Work 实录任务闭环，并把安装、模型准备、失败处理和测试写清楚。',
    audience: 'Agent Skill、AI PC、本地模型、OpenVINO、办公自动化和开发工具开发者',
    rewards: ['Top 10 作品各 1000 元（含税）', '前 50 名完整提交者获 OpenVINO / 魔搭限量周边', '入选 AI PC Skills Collections 并获官方流量扶持', '优秀开发者优先进入 Intel ISV 生态合作伙伴池'],
    pros: ['英特尔与魔搭官方', 'Skill 方向高度匹配', '个人可完成', '交付物可沉淀为长期资产', '现金、周边和商业合作入口'],
    cons: ['涉及的 AI 模型必须支持本地运行（Localhost）', '需适配指定生产力 Agent 工具', '需同时发布 Skill、代码、测试与文章', '训练算力需自行准备'],
    winning: ['场景价值 30%', '商用生产力 30%', '工具使用 20%', '文章质量 10%', '创新性 10%', '传播附加分 5%'],
    eligibility: {
      scope: 'public-developers',
      regions: ['中国线上；官方页面未列地区排除项'],
      chinaEligible: 'yes',
      fee: 'free',
      team: '官方目录元数据允许个人/团队但 MemberLimit=1，按个人作品准备；如需协作先向赛务复核',
    },
    prizeBoundary: {
      cash: [{ currency: 'CNY', amount: 1000, quantity: 10, scope: 'Top 10 作品（含税）' }],
      nonCash: ['前 50 名完整作品周边', 'AI PC Skills Collections', '英特尔与魔搭全渠道推广'],
      investment: ['Intel ISV 生态合作伙伴池优先入驻；属于合作对接，不保证合同或投资'],
      cashStatus: 'fully-itemized-10000',
      ip: '官方正文未完整披露作品权属与展示授权；发布 Skill、代码和文章前应选择合适许可证并复核提交协议',
    },
    deadlines: [{ type: 'submission', date: '2026-08-31', certainty: 'confirmed', timezone: 'Asia/Shanghai', label: '作品提交及传播数据统计截止（23:59）', primary: true, sourceUrl: skillsUrl }],
    primaryDeadline: { type: 'submission', date: '2026-08-31', certainty: 'confirmed', timezone: 'Asia/Shanghai', label: '作品提交及传播数据统计截止（23:59）', primary: true, sourceUrl: skillsUrl },
    curation: { primaryFormats: ['skill', 'agent', 'local-ai'], rewardAccessibility: 'high', rewardEvidence: '官方正文明确 Top 10 各 1000 元、前 50 周边、推广和 Intel ISV 合作池。', recommendationPriority: 'highest' },
    sources: [
      source('ModelScope 官方｜Production AI Skills 大赛', skillsUrl),
      source('魔搭官方｜Skills 中心', skillsCenterUrl),
      source('OpenVINO 官方示例｜Local AI Skill Authoring', localSkillGuideUrl),
      source('ModelScope 官方竞赛目录接口｜记录 289', modelScopeIndexUrl),
    ],
    url: skillsUrl,
  }),

  trackedAddition({
    id: 'ventured-vibe-coding-hackathon-2026',
    modelScopeId: 331,
    name: 'VentureD Vibe Coding 黑客松 2026',
    org: 'VentureD · 杭州全球青年人才中心 · 浙江大学计算机学院等',
    loc: '杭州线下 · 2026-08-27 至 08-29 · 48 小时',
    date: '报名截止 2026-08-23 23:59',
    deadlineISO: '2026-08-23',
    deadlineTimezone: 'Asia/Shanghai',
    tier: 'S',
    match: 9.1,
    suit: '很高；适合能赴杭州参加 48 小时线下开发者',
    desc: '面向真实问题的 Vibe Coding 线下黑客松，目标是把想法做成可运行的 AI 智能体。设 Hardware、Physical AI、Deep Space、Global Commerce、Healthcare 五个真实世界赛道，合作方包括 TiDB、宇树科技、群核科技、天识科技和德适科技。',
    strategy: '只有能在 8 月 27—29 日到杭州再报名。优先选择与现有能力最接近的赛道，提前准备通用 Agent 框架、部署模板和演示脚本，现场把精力集中在真实数据、工具调用和可运行 Demo。',
    audience: '学生、设计师、产品经理、开发者和熟悉真实行业场景的青年创造者；需能赴杭州完成 48 小时线下活动',
    rewards: ['Hardware：3 个企业实习 Offer、9000 美元数据代金券与全球推广', 'Physical AI：5 台宇树 G1 人形机器人现场开放及硬件设备支持', 'Deep Space：企业实习 Offer 直通车、平台与算力支持', 'Global Commerce：6 个线下训练营名额与 1 个 Offer 直通名额', 'Healthcare：国际会议支持，一等奖团队获实习 Offer'],
    pros: ['Vibe Coding 与 Agent 原生', '五个企业真实赛道', '杭州高密度线下协作', '宇树、TiDB 等产业资源', '不要求每个人会传统编程'],
    cons: ['必须赴杭州参加 48 小时线下活动', '官方海报未披露统一现金奖金', '各赛道奖励差异大', '报名后需等待组织方筛选与通知'],
    winning: ['真实问题理解', '可运行 Agent', '赛道方资源使用', '产品完成度', '现场 Demo 与协作'],
    eligibility: {
      scope: 'onsite-selected-participants',
      regions: ['杭州线下；报名者需自行确认出行条件'],
      chinaEligible: 'yes',
      fee: 'not-stated',
      team: '官方目录标记个人/团队报名，MemberLimit=1；实际现场组队与筛选方式以问卷和录取通知为准',
    },
    prizeBoundary: {
      cash: [],
      nonCash: ['企业实习 Offer / 直通机会', '数据代金券', '宇树机器人及硬件开放', '算力与训练营', '国际会议支持'],
      investment: [],
      cashStatus: 'no-unified-cash-stated',
      ip: '系列海报未完整披露作品知识产权、赛道方使用权与差旅承担；报名和到场前必须复核问卷后续协议',
    },
    deadlines: [
      { type: 'registration', date: '2026-08-23', certainty: 'confirmed', timezone: 'Asia/Shanghai', label: '报名截止（23:59）', primary: true, sourceUrl: ventureDUrl },
      { type: 'event-start', date: '2026-08-27', certainty: 'confirmed', timezone: 'Asia/Shanghai', label: '杭州 48 小时黑客松开始', primary: false, sourceUrl: ventureDUrl },
      { type: 'event-end', date: '2026-08-29', certainty: 'confirmed', timezone: 'Asia/Shanghai', label: '杭州 48 小时黑客松结束', primary: false, sourceUrl: ventureDUrl },
    ],
    primaryDeadline: { type: 'registration', date: '2026-08-23', certainty: 'confirmed', timezone: 'Asia/Shanghai', label: '报名截止（23:59）', primary: true, sourceUrl: ventureDUrl },
    curation: { primaryFormats: ['agent', 'vibe-coding', 'software-product'], rewardAccessibility: 'medium', rewardEvidence: '官方海报逐赛道披露 Offer、设备、算力和会议支持，但没有统一现金奖。', recommendationPriority: 'highest' },
    verification: {
      status: 'verified', checkedAt: ROUND17_ADDITIONS_CHECKED_AT, sourceKind: 'official', linkHealth: 'reachable',
      notes: 'ModelScope 官方记录 331 的七张海报经 tesseract chi_sim+eng OCR 并逐张人工核对；报名截止取官方目录时间戳，8 月 27—29 日杭州线下日期与五赛道奖励取原图。',
    },
    sources: [
      source('ModelScope 官方｜VentureD Vibe Coding 黑客松', ventureDUrl),
      source('VentureD 官方报名问卷', ventureDRegisterUrl),
      source('ModelScope 官方竞赛目录接口｜记录 331', modelScopeIndexUrl),
    ],
    url: ventureDUrl,
  }),

  trackedAddition({
    id: 'silicon-carbon-ai-diagnosis-2026',
    modelScopeId: 254,
    name: '硅碳 AI 诊疗挑战赛',
    org: '魔搭社区 · 浙江大学 · 浙江工商大学 · 阿里云百炼',
    loc: '全国高校在校生 · 线上 · 双赛道',
    date: '报名截止 2026-09-06 23:59',
    deadlineISO: '2026-09-06',
    deadlineTimezone: 'Asia/Shanghai',
    tier: 'A',
    match: 8.1,
    suit: '学生限定；非在校开发者不要投入',
    desc: '基于 OpenHospital 构建“硅基智能体 × 碳基医学生”双赛道诊疗 Arena，覆盖问诊、检查、诊断和治疗全流程。硅基赛道要求在魔搭创空间部署医生智能体，考察 Skill、Memory 与诊疗质量；碳基赛道由医学生在线作答。',
    strategy: '仅全国高校在校生参与。开发者选硅基赛道并复用官方 Baseline，先控制问诊与检查精度，再优化诊断、治疗和 Token 成本；不要把普通医疗聊天机器人当成完整诊疗 Agent。',
    audience: '全国高校在校生（含专科、本科、硕士、博士和在职研究生）；硅基赛道面向智能体开发者，碳基赛道限医学相关专业学生',
    rewards: ['官方标注 10 万元奖金池（逐项列示合计 99,200 元）', '硅基赛道：2 万×1、1 万×2、5000×3', '碳基赛道：1000 / 700 / 500 元', '420 份有效参与奖，每次 100 元，每人最多 3 次且可与主奖叠加'],
    pros: ['智能体赛道明确', '浙江大学等高校联合主办', '有 Baseline 与评测平台', '主奖和参与奖可叠加'],
    cons: ['仅限全国高校在校生', '碳基赛道限医学生', '训练阶段可能产生 API 费用', '医疗安全与诊疗准确性要求高', '初赛 9 月 9 日才开放评测'],
    winning: ['诊断准确率 25%', '检查精确率 25%', '治疗方案契合度 25%', '评测 Token 成本 20%', '训练 Token 成本 5%'],
    eligibility: {
      scope: 'students-only',
      regions: ['全国高校'],
      chinaEligible: 'yes',
      fee: 'free-registration; training-api-costs-may-apply',
      team: '硅基智能体赛道每队 1—3 人；碳基医学生赛道个人参赛',
    },
    prizeBoundary: {
      cash: [
        { currency: 'CNY', amount: 20000, quantity: 1, scope: '硅基赛道一等奖（含税）' },
        { currency: 'CNY', amount: 10000, quantity: 2, scope: '硅基赛道二等奖（含税）' },
        { currency: 'CNY', amount: 5000, quantity: 3, scope: '硅基赛道三等奖（含税）' },
        { currency: 'CNY', amount: 1000, quantity: 1, scope: '碳基赛道一等奖（含税）' },
        { currency: 'CNY', amount: 700, quantity: 1, scope: '碳基赛道二等奖（含税）' },
        { currency: 'CNY', amount: 500, quantity: 1, scope: '碳基赛道三等奖（含税）' },
        { currency: 'CNY', amount: 100, quantity: 420, scope: '有效参与提交；每位选手最多 3 次' },
      ],
      nonCash: ['获奖证书', '赛事平台、Baseline 与评测算力支持'],
      investment: [],
      cashStatus: 'itemized-99200-api-rounded-to-100000',
      ip: '官方正文未完整披露智能体代码、Access Token 与作品展示授权边界；提交前复核报名协议，切勿在代码或材料中暴露 Token',
    },
    deadlines: [
      { type: 'registration', date: '2026-09-06', certainty: 'confirmed', timezone: 'Asia/Shanghai', label: '报名截止（23:59）', primary: true, sourceUrl: medicalUrl },
      { type: 'event-start', date: '2026-09-09', certainty: 'confirmed', timezone: 'Asia/Shanghai', label: '初赛 A 卷开放', primary: false, sourceUrl: medicalUrl },
      { type: 'submission', date: '2026-09-30', certainty: 'confirmed', timezone: 'Asia/Shanghai', label: '复赛 B 卷开放（非最终截止）', primary: false, sourceUrl: medicalUrl },
    ],
    primaryDeadline: { type: 'registration', date: '2026-09-06', certainty: 'confirmed', timezone: 'Asia/Shanghai', label: '报名截止（23:59）', primary: true, sourceUrl: medicalUrl },
    curation: { primaryFormats: ['agent', 'software-product'], rewardAccessibility: 'low', rewardEvidence: '奖金清楚，但资格严格限全国高校在校生。', recommendationPriority: 'students-only' },
    sources: [
      source('ModelScope 官方｜硅碳 AI 诊疗挑战赛', medicalUrl),
      source('魔搭官方｜OpenHospital 赛事平台', medicalPlatformUrl),
      source('ModelScope 官方竞赛目录接口｜记录 254', modelScopeIndexUrl),
    ],
    url: medicalUrl,
  }),

  trackedAddition({
    id: 'harmonyos-app-developer-incentive-2026',
    name: '鸿蒙应用开发者激励计划 2026',
    org: '华为开发者联盟',
    loc: '中国大陆 · 个人 / 企业 / 开发服务商',
    date: '报名截止 2026-09-25；须在 09-30 前正式上架',
    deadlineISO: '2026-09-25',
    deadlineTimezone: 'Asia/Shanghai',
    tier: 'S',
    cat: '渠道变现',
    match: 9.3,
    suit: '很高；适合能在 9 月底前正式上架鸿蒙应用者',
    recordType: 'program',
    desc: '华为面向个人开发者、企业开发者和开发服务商的现金激励计划，并非传统比赛。报名后需在 2026 年 3 月 12 日至 9 月 30 日期间完成鸿蒙应用开发并正式上架华为应用市场；现金有限，符合条件的应用按首次正式上架时间先到先得。',
    strategy: '先确认账号和应用符合中国大陆范围，再尽早报名、开通商户服务并开始上架审核；官方 FAQ 建议至少预留一周审核时间，因此不要把 9 月 30 日当成首次提交审核日。',
    audience: '中国大陆注册的个人开发者、企业开发者和开发服务商；应用须面向中国大陆并正式上架 HarmonyOS 5.0 及之后的华为应用市场',
    rewards: ['满足上架、有效月活与评分标准后有机会获得现金激励', '单个开发者主体累计现金激励上限 100 万元', '现金有限，按应用首次正式上架时间先到先得'],
    pros: ['个人开发者可参加', '华为官方现金激励', '面向真实上架应用', '单开发者累计上限高'],
    cons: ['不是传统比赛且现金并非报名即得', '需在 9 月 30 日前正式上架并开通商户服务', '激励先到先得、发完即止', '需达到有效月活和评分标准', '不可与其他 2026 鸿蒙应用激励重复享受'],
    winning: ['尽早正式上架', '应用质量与评分', '有效月活', '合规与持续在架', '商户服务审核完成'],
    eligibility: {
      scope: '个人开发者、企业开发者、开发服务商',
      regions: ['账号注册地中国大陆；应用面向中国大陆'],
      chinaEligible: 'yes',
      fee: 'free',
      team: '按个人、企业或开发服务商主体账号报名；报名账号必须与上架应用关联',
    },
    prizeBoundary: {
      cash: [{ currency: 'CNY', amount: 1000000, quantity: 1, scope: '单个开发者主体累计激励上限；不是保证可得金额' }],
      nonCash: [],
      investment: [],
      cashStatus: 'conditional-limited-first-come',
      ip: '开发者保有应用相关权利并须保证合法合规；激励、上架、展示和数据统计边界以华为计划协议与应用市场规则为准',
    },
    deadlines: [
      { type: 'application', date: '2026-09-25', certainty: 'confirmed', timezone: 'Asia/Shanghai', label: '计划报名截止', primary: true, sourceUrl: harmonyAppUrl },
      { type: 'submission', date: '2026-09-30', certainty: 'confirmed', timezone: 'Asia/Shanghai', label: '应用成功正式上架及商户服务开通截止', primary: false, sourceUrl: harmonyAppUrl },
    ],
    primaryDeadline: { type: 'application', date: '2026-09-25', certainty: 'confirmed', timezone: 'Asia/Shanghai', label: '计划报名截止', primary: true, sourceUrl: harmonyAppUrl },
    timeline: [
      { event: '报名窗口开始', date: '2026-04-15', critical: false },
      { event: '计划报名截止', date: '2026-09-25', critical: true },
      { event: '应用正式上架及商户服务截止', date: '2026-09-30', critical: true },
      { event: '有效月活与评分统计结束', date: '2026-10-31', critical: false },
    ],
    curation: { primaryFormats: ['software-product', 'mobile-app'], rewardAccessibility: 'medium', rewardEvidence: '华为官网直接明确个人/企业/服务商、先到先得和单开发者 100 万元封顶；具体档位表为官网图片，不在数据中擅自展开。', recommendationPriority: 'highest' },
    verification: {
      status: 'verified', checkedAt: ROUND17_ADDITIONS_CHECKED_AT, sourceKind: 'official', linkHealth: 'reachable',
      notes: '报名期、上架期、个人资格、商户服务、先到先得和 100 万元主体封顶均由华为官方落地页正文核验；激励档位图片未被转写，避免将图片识别误差写成确定金额。',
    },
    sources: [source('华为开发者联盟官方｜鸿蒙应用开发者激励计划 2026', harmonyAppUrl), source('华为开发者联盟官方｜计划报名入口', harmonyAppSignupUrl)],
    url: harmonyAppUrl,
  }),

  trackedAddition({
    id: 'harmony-agent-tiangong-incentive-2026',
    name: '天工计划·鸿蒙智能体开发者激励',
    org: '华为开发者联盟 · 小艺开放平台',
    loc: '中国大陆 · 企业开发者 / 开发服务商',
    date: '报名截止 2026-10-25；须在 10-31 前成功上架智能体',
    deadlineISO: '2026-10-25',
    deadlineTimezone: 'Asia/Shanghai',
    tier: 'S',
    cat: '渠道变现',
    match: 9.4,
    suit: '高；Agent 方向匹配，但个人必须先转为企业开发者或开发服务商',
    recordType: 'program',
    desc: '华为面向鸿蒙智能体生态的开发者现金激励计划，并非传统比赛。开发者需在 2026 年 10 月 25 日前报名并通过审核，在 10 月 31 日前通过小艺开放平台成功上架采用 LLM、Workflow 或 A2A 编排的智能体；华为按数据表现、用户体验与创新度综合评估。',
    strategy: '先解决主体资格：个人开发者必须实名认证为企业开发者或开发服务商。已有 Agent 可优先采用 A2A 对接，独立新项目可选 Workflow；尽早上架积累对话月活，并同步开通商户服务和准备发票能力。',
    audience: '中国大陆企业开发者和开发服务商；个人开发者须先完成相应主体实名认证',
    rewards: ['单智能体最高可获得 75 万元现金（含税）', '单开发者最高可获得 200 万元现金（含税）', '现金有限，达到标准后按时间先到先得'],
    pros: ['华为官方 Agent 激励', '支持 LLM、Workflow 和 A2A', '单智能体和单开发者上限高', '适合已有 Agent 接入鸿蒙生态'],
    cons: ['个人开发者不能以普通个人身份直接参加', '需通过报名审核和上架审核', '现金先到先得且须综合评估', '需开通商户服务并开具发票', '需持续在架并防范刷量'],
    winning: ['对话月活与数据表现', '用户体验', '创新度', '尽早达成标准', '持续合规运营'],
    eligibility: {
      scope: 'enterprise-or-service-provider',
      regions: ['账号注册地中国大陆；智能体面向中国大陆'],
      chinaEligible: 'yes',
      fee: 'free',
      team: '个人开发者如需参加，须先实名认证为企业开发者或开发服务商；报名账号与上架智能体账号须一致',
    },
    prizeBoundary: {
      cash: [
        { currency: 'CNY', amount: 750000, quantity: 1, scope: '单个智能体最高现金上限；不是保证可得金额' },
        { currency: 'CNY', amount: 2000000, quantity: 1, scope: '单个开发者累计最高现金上限；与单智能体上限重叠，不可相加为奖池' },
      ],
      nonCash: ['小艺开放平台多端分发与鸿蒙生态触达'],
      investment: [],
      cashStatus: 'conditional-limited-first-come-overlapping-caps',
      ip: '开发者须保证智能体、模型、数据和内容合法合规；上架、评估、展示和数据处理边界以华为计划与小艺开放平台协议为准',
    },
    deadlines: [
      { type: 'application', date: '2026-10-25', certainty: 'confirmed', timezone: 'Asia/Shanghai', label: '报名提交并通过审核截止', primary: true, sourceUrl: harmonyAgentUrl },
      { type: 'submission', date: '2026-10-31', certainty: 'confirmed', timezone: 'Asia/Shanghai', label: '智能体成功上架及商户服务开通截止', primary: false, sourceUrl: harmonyAgentUrl },
    ],
    primaryDeadline: { type: 'application', date: '2026-10-25', certainty: 'confirmed', timezone: 'Asia/Shanghai', label: '报名提交并通过审核截止', primary: true, sourceUrl: harmonyAgentUrl },
    timeline: [
      { event: '报名窗口开始', date: '2025-10-31', critical: false },
      { event: '报名审核截止', date: '2026-10-25', critical: true },
      { event: '智能体成功上架及商户服务截止', date: '2026-10-31', critical: true },
    ],
    curation: { primaryFormats: ['agent', 'software-product', 'a2a'], rewardAccessibility: 'medium', rewardEvidence: '华为官方正文明确单智能体 75 万、单开发者 200 万封顶及先到先得，但主体资格排除普通个人账号。', recommendationPriority: 'high' },
    verification: {
      status: 'verified', checkedAt: ROUND17_ADDITIONS_CHECKED_AT, sourceKind: 'official', linkHealth: 'reachable',
      notes: '活动周期、企业/服务商主体限制、三种编排方式、两级现金上限、商户服务与发票要求均由华为官方页面内嵌 CMS 正文直接核验。',
    },
    sources: [source('华为开发者联盟官方｜天工计划·鸿蒙智能体开发者激励', harmonyAgentUrl)],
    url: harmonyAgentUrl,
  }),
];

export const competitionRound17Additions = normalizeCompetitionCollection(
  additions,
  {},
  { updatedAt: ROUND17_ADDITIONS_CHECKED_AT },
);

export default competitionRound17Additions;
