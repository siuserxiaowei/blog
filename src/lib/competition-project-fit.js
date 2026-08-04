import {
  DEFAULT_PROJECT_PRESET_ID,
  HERCLAW_PROJECT_PRESET_ID,
  PROJECT_PRESET_BY_ID,
  PROJECT_PRESETS,
} from '../data/competition-project-presets.js';

const HERCLAW_FITS = Object.freeze({
  'pazhou-super-claw-2026': Object.freeze({
    decision: 'recommend', rank: 1, effort: '高',
    fitAngle: '智能办公：飞书入口 → OpenClaw 编排 → Hermes 执行 → 本地运维台。',
    gate: '必须提交 3—5 分钟真实本地运行视频；不要把仍在验证的 OTA 或量产能力写成成品。',
  }),
  xfyocasskill2026: Object.freeze({
    decision: 'recommend', rank: 2, effort: '中',
    fitAngle: '把飞书消息到任务、执行回执与异常升级收敛为可安装办公协同 Skill。',
    gate: '须提交原创 Skill ZIP、SKILL.md，并同步 SkillHub。',
  }),
  xfynl2wf2026: Object.freeze({
    decision: 'recommend', rank: 3, effort: '中',
    fitAngle: '展示自然语言需求解析、工具选择、执行校验与错误恢复闭环。',
    gate: '须遵循指定项目结构；获奖序列需要可复现代码和 README。',
  }),
  goai: Object.freeze({
    decision: 'recommend', rank: 4, effort: '中',
    fitAngle: '投 Agent Infra：双 Agent 编排、权限、健康检查与可恢复执行。',
    gate: '官方只确认 8 月中旬，具体日期与开源边界必须先向主办方复核。',
  }),
  'pazhou-ai-application-2026': Object.freeze({
    decision: 'recommend', rank: 5, effort: '中',
    fitAngle: '以企业本地 AI 一体机投 AI+软件应用赛道，用运维可控和真实业务闭环证明落地。',
    gate: '需要真实用户或商业验证；赛事扶持资源不等于现金奖金。',
  }),
  aiskillathon2026: Object.freeze({
    decision: 'recommend', rank: 6, effort: '高',
    fitAngle: '投工业制造或安全可信：本地诊断、远程恢复、权限与审计。',
    gate: '先交可运行 Demo，进入决赛还需线下赴长沙；不能只交概念方案。',
  }),
  xfyrisk2026: Object.freeze({
    decision: 'recommend', rank: 7, effort: '中',
    fitAngle: '把 License、Token、服务健康和人工复核组织成企业运维风险 Agent。',
    gate: '必须补出风险证据链与人工复核闭环，单纯监控面板不够。',
  }),
  'global-excellent-engineer-innovation-2026': Object.freeze({
    decision: 'recommend', rank: 8, effort: '高',
    fitAngle: '以可部署、可远程运维的企业 AI 一体机投人工智能 / 软件组。',
    gate: '核心团队 2—3 人、全员 18+；技术负责人需工程师资格证明，并准备自主 IP 材料。',
  }),
  xfyspacemind2026: Object.freeze({
    decision: 'stretch', rank: 9, effort: '高',
    fitAngle: '只复用本地隐私、双机器人入口和远程守护，不宣称已有家庭传感器能力。',
    gate: '必须补出真实家庭 / 空间、多设备和权限场景，否则不建议投入。',
  }),
  datahubagent: Object.freeze({
    decision: 'stretch', rank: 10, effort: '高',
    fitAngle: '做 Fleet metadata / 运维知识 Agent，把设备服务状态转成可查询、可执行的运维上下文。',
    gate: '必须深度使用 DataHub 组件，并复核公开仓库与开源许可要求。',
  }),
  shipaton2026: Object.freeze({
    decision: 'no-go',
    noGoReason: '当前 HerClaw 不是赛期内新上架的移动 App；Shipaton 还要求 RevenueCat 与真实变现。',
  }),
  amddevmaster2026: Object.freeze({
    decision: 'no-go',
    noGoReason: '赛事要求 AMD / ROCm 使用深度，HerClaw 当前 N100 / Ubuntu 栈不匹配。',
  }),
  armaiopt2026: Object.freeze({
    decision: 'no-go',
    noGoReason: '赛事以 Arm 平台优化为硬门槛，HerClaw 当前硬件架构不匹配。',
  }),
  agenticcinema2026: Object.freeze({
    decision: 'no-go',
    noGoReason: '官方规则排除中国居民，不进入 HerClaw 可投清单。',
  }),
  xfyedu2026: Object.freeze({
    decision: 'no-go',
    noGoReason: 'HerClaw 当前定位是企业 / 运营 AI 一体机，不以尚未完成的教育能力参赛。',
  }),
  xfyedums2026: Object.freeze({
    decision: 'no-go',
    noGoReason: '教学管理不是 HerClaw 当前已验证场景，不能沿用旧的教育产品画像。',
  }),
  acesatedu: Object.freeze({
    decision: 'no-go',
    noGoReason: '赛事要求解决教育问题；HerClaw 当前没有可作为事实提交的教育产品闭环。',
  }),
  'global-digital-education-2026': Object.freeze({
    decision: 'no-go',
    noGoReason: '默认教育赛与企业 / 运营 AI 一体机定位不符，除非先形成真实教育产品证据。',
  }),
  'bilibili-ai-create-2026': Object.freeze({
    decision: 'recommend', rank: 11, effort: '中',
    fitAngle: '「AI 造物」硬件原型方向：龙虾盒子整机 + 双 Agent 运行栈做成 3–5 分钟可演示视频，一等奖 100 万元。',
    gate: '投稿前不得在其他平台公开发布该作品，获奖后须 B站独家；须 ≥1 分钟原创横屏视频。',
  }),
  'tianchi-industry-agent-2026': Object.freeze({
    decision: 'recommend', rank: 12, effort: '低',
    fitAngle: '以「已落地 / 试运营的企业运营 Agent」直接申报真实行业 Agent 项目，材料当天可备齐。',
    gate: '无现金奖，价值在天池背书与云资源；截止 8-10 很近，勿重投入。',
  }),
  'dongguan-industrial-ai-100-2026': Object.freeze({
    decision: 'recommend', rank: 13, effort: '中',
    fitAngle: '选企业运营 / 质检 / 知识库相关赛题，用现有 Agent 栈快速出 POC，目标是 300 万订单直通。',
    gate: '赛题偏工业垂直，需按赛季节奏持续投入；1–5 人组队，可配 ≤2 指导老师。',
  }),
  'seeed-xiao-productization-2026': Object.freeze({
    decision: 'stretch', rank: 14, effort: '高',
    fitAngle: '若有 PCB 能力，语音控制器或 PoE 边界路由方向与产品栈最近，入选方案由 Seeed 产品化。',
    gate: '须交付 KiCad 工程与样机；没有硬件工程能力则不建议投入。',
  }),
  'kaggle-benchflow-skill-lift-2026': Object.freeze({
    decision: 'stretch', rank: 15, effort: '中',
    fitAngle: '把 OpenClaw 生态沉淀的高质量 Skill 资产脱敏后投 Static / Meta-Skills 双赛道。',
    gate: '截止日按官方列表倒计时推算，提交前以 Kaggle 赛页实际倒计时为准；英文提交。',
  }),
  'weibo-vibelab-2026': Object.freeze({
    decision: 'recommend', rank: 16, effort: '低',
    fitAngle: 'VibeWork 职场自动化赛道：发一条含可体验链接 + 工作流拆解的长微博即完成参赛。',
    gate: '奖池分配细则未公开；须公开创作思路与 Demo 效果，依赖微博传播数据。',
  }),
  'huaqiu-cup-ai-hardware-2026': Object.freeze({
    decision: 'recommend', rank: 17, effort: '中',
    fitAngle: '端侧 AI / 具身智能赛题对口：龙虾盒子整机原型可投，先申领免费赞助开发板降低硬件成本。',
    gate: '作品须 100% 开源 + 大赛专属首发；获奖后须寄实物验证；现金档位小且税前。',
  }),
  'lcsc-wch-riscv-2026': Object.freeze({
    decision: 'recommend', rank: 18, effort: '中',
    fitAngle: '自由命题可做 AI 硬件，复刻赛道含 MoHi AI 对话机器狗；优秀作品有众筹+量产+资本对接。',
    gate: '参加过嘉立创集团其他赛事（星火计划/硬核手搓/训练营等）的作品不可再参赛，先自查再投入。',
  }),
  'iflytek-robot-innovation-2026': Object.freeze({
    decision: 'recommend', rank: 19, effort: '高',
    fitAngle: '陪伴机器人/具身智能赛道与产品方向直接重合，入围决赛的实物模型制作与运输费由组委会承担。',
    gate: '拒收完全由 AI 生成的作品，须有真实工程含量；决赛须线下答辩；≤5 人。',
  }),
  'pazhou-international-ai-2026': Object.freeze({
    decision: 'recommend', rank: 20, effort: '中',
    fitAngle: '以「AI 硬件 + 出海」叙事投国内组，BP 突出具身智能与海外市场路径；无需代码。',
    gate: '国内组须具备出海能力并在 BP 说明；奖励是落地扶持与政策而非现金，按资源对接价值投入。',
  }),
  'dfrobot-xhs-maker-2026': Object.freeze({
    decision: 'recommend', rank: 21, effort: '低',
    fitAngle: '把龙虾盒子的硬件 DIY 过程做成小红书图文/视频带双话题发布即完成参赛。',
    gate: '须带 #小红书maker创造季 #dfrobot创造分享 双话题；现金为瓜分制单人额度小。',
  }),
  'meshtastic-build-off-2026': Object.freeze({
    decision: 'stretch', rank: 22, effort: '中',
    fitAngle: 'LoRa mesh 场景显式匹配，可用盒子做离网通信/分布式节点 demo。',
    gate: '官方日期口径矛盾（README 横幅 8-15 / 表格 8 月下旬），按最早口径 8 月中旬前提交；须开源（GitHub Issue 提交）。',
  }),
  'fossee-oshw-makeathon-2026': Object.freeze({
    decision: 'stretch', rank: 23, effort: '中',
    fitAngle: '开源硬件 + TinyML 方向弱匹配，价值在 IIT Bombay 背书与开源履历。',
    gate: '学生限定：须全日制在校学生团队（≤5 人），非学生团队不可投；IP 与 FOSSEE 共有、硬件成本自理，现金仅象征性。',
  }),
  'jciiot-embodied-ai-2026': Object.freeze({
    decision: 'stretch', rank: 24, effort: '中',
    fitAngle: '工业具身智能方向相关，可复用工业场景 Agent/质检经验。',
    gate: '新队伍是否仍可报名待确认（队伍合并截止 07-24 已过），先登录 Biendata 核实；实名制（姓名+机构）；奖金拆分待确认。',
  }),
});

function normalized(value) {
  return String(value ?? '').normalize('NFKC').toLocaleLowerCase();
}

function joinValues(values) {
  return normalized(values.flat(Infinity).filter(Boolean).join(' '));
}

function competitionText(competition) {
  return joinValues([
    competition.id,
    competition.name,
    competition.fullName,
    competition.cat,
    competition.org,
    competition.desc,
    competition.strategy,
    competition.audience,
    competition.loc,
    competition.recordType,
  ]);
}

function eligibilityText(competition) {
  return joinValues([
    competition.audience,
    competition.loc,
    competition.eligibility ? JSON.stringify(competition.eligibility) : '',
  ]);
}

function hits(text, values) {
  return values.filter(value => text.includes(normalized(value)));
}

export function getProjectPreset(presetOrId = DEFAULT_PROJECT_PRESET_ID) {
  if (presetOrId && typeof presetOrId === 'object') return presetOrId;
  return PROJECT_PRESET_BY_ID.get(presetOrId) ?? PROJECT_PRESET_BY_ID.get(DEFAULT_PROJECT_PRESET_ID);
}

export function getHerClawCompetitionFit(competitionOrId) {
  const id = typeof competitionOrId === 'string' ? competitionOrId : competitionOrId?.id;
  const fit = HERCLAW_FITS[id];
  return fit ? { competitionId: id, ...fit } : null;
}

export function evaluateCompetitionProjectFit(competition, presetOrId = DEFAULT_PROJECT_PRESET_ID) {
  const preset = getProjectPreset(presetOrId);
  if (!competition?.id || !preset) return { matched: false, presetId: preset?.id ?? '' };

  if (preset.rules.type === 'all') {
    return { matched: true, presetId: preset.id, matchedOn: { all: true } };
  }

  if (preset.id === HERCLAW_PROJECT_PRESET_ID || preset.rules.type === 'explicit') {
    const fit = preset.id === HERCLAW_PROJECT_PRESET_ID ? getHerClawCompetitionFit(competition) : null;
    const included = preset.rules.includeCompetitionIds.includes(competition.id);
    return {
      matched: included && fit?.decision !== 'no-go',
      presetId: preset.id,
      matchedOn: { explicitId: included },
      ...(fit ? { fit } : {}),
    };
  }

  const text = competitionText(competition);
  const eligibility = eligibilityText(competition);
  const categoryMatches = preset.rules.categoryAny.includes(competition.cat) ? [competition.cat] : [];
  const keywordMatches = hits(text, preset.rules.keywordAny);
  const eligibilityMatches = hits(eligibility, preset.rules.eligibilityAny);
  const excludedBy = hits(`${text} ${eligibility}`, preset.rules.excludeAny);
  const matched = excludedBy.length === 0
    && (categoryMatches.length > 0 || keywordMatches.length > 0 || eligibilityMatches.length > 0);

  return {
    matched,
    presetId: preset.id,
    matchedOn: {
      categories: categoryMatches,
      keywords: keywordMatches,
      eligibility: eligibilityMatches,
      excludedBy,
    },
  };
}

export function getMatchingProjectPresetIds(competition) {
  return PROJECT_PRESETS
    .filter(preset => evaluateCompetitionProjectFit(competition, preset).matched)
    .map(preset => preset.id);
}

export function listHerClawAssessments() {
  return Object.entries(HERCLAW_FITS)
    .map(([competitionId, fit]) => ({ competitionId, ...fit }))
    .sort((a, b) => (a.rank ?? Number.POSITIVE_INFINITY) - (b.rank ?? Number.POSITIVE_INFINITY));
}
