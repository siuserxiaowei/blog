const freezeRule = rule => Object.freeze({
  ...rule,
  categoryAny: Object.freeze(rule.categoryAny ?? []),
  keywordAny: Object.freeze(rule.keywordAny ?? []),
  eligibilityAny: Object.freeze(rule.eligibilityAny ?? []),
  excludeAny: Object.freeze(rule.excludeAny ?? []),
  includeCompetitionIds: Object.freeze(rule.includeCompetitionIds ?? []),
});

const createPreset = preset => Object.freeze({
  ...preset,
  rules: freezeRule(preset.rules),
});

export const DEFAULT_PROJECT_PRESET_ID = 'all';
export const HERCLAW_PROJECT_PRESET_ID = 'herclaw';

export const HERCLAW_PROFILE = Object.freeze({
  id: HERCLAW_PROJECT_PRESET_ID,
  positioning: '企业 / 运营 AI 一体机',
  currentCapabilities: Object.freeze([
    'OpenClaw + Hermes 双 Agent 运行栈',
    '飞书双机器人作为业务入口',
    '本地控制台与服务健康检查',
    '宿主机 supervisor 与远程运维是当前产品方向',
  ]),
  notAssumed: Object.freeze([
    'Registry / OTA 仍在验证或设计中，不按已完成能力匹配',
    '不假设已经量产，也不假设具备传感器与多设备联动',
    '不把家庭或教育功能写成当前产品能力',
  ]),
});

export const HERCLAW_EXPLICIT_COMPETITION_IDS = Object.freeze([
  'pazhou-super-claw-2026',
  'xfyocasskill2026',
  'xfynl2wf2026',
  'goai',
  'pazhou-ai-application-2026',
  'aiskillathon2026',
  'xfyrisk2026',
  'global-excellent-engineer-innovation-2026',
  'xfyspacemind2026',
  'datahubagent',
  'bilibili-ai-create-2026',
  'dongguan-industrial-ai-100-2026',
  'tianchi-industry-agent-2026',
  'seeed-xiao-productization-2026',
  'kaggle-benchflow-skill-lift-2026',
  'weibo-vibelab-2026',
  'huaqiu-cup-ai-hardware-2026',
  'lcsc-wch-riscv-2026',
  'iflytek-robot-innovation-2026',
  'pazhou-international-ai-2026',
  'dfrobot-xhs-maker-2026',
  'meshtastic-build-off-2026',
  'fossee-oshw-makeathon-2026',
  'jciiot-embodied-ai-2026',
]);

export const OCG_PROJECT_PRESET_ID = 'ocg';

export const OCG_EXPLICIT_COMPETITION_IDS = Object.freeze([
  'pokemonagent2026',
  'talestribute2026',
  'ggac-7th-2026',
  'valorant-ggac-card-2026',
  'tencentgamecreator2026',
  'unitychina2026',
  'gwb2026',
  'igf2027',
  'devgammawards2026',
  'tgsiga2027',
  'bigbytejam2026',
  'game1440k2026',
  'ifcomp-2026',
  'roblox-inspire-2026',
  'square-enix-game-contest-2026',
  'fightingicellm2026',
  'fightingicesound2026',
  'brackeys-jam-2026-2',
  'lowrezjam-2026',
  'inkjam-2026',
  'ludum-dare-60',
  'gauntlet-of-gods-2026',
  'btt-web-game-jam-2026',
  'godothub-festival-2026',
  'gbjam-14',
  'godot-wild-jam-rolling',
  'spooktober-vn-jam-2026',
  'climate-jam-2026',
  'craftpix-indie-jam-2026',
]);

export const PROJECT_PRESETS = Object.freeze([
  createPreset({
    id: DEFAULT_PROJECT_PRESET_ID,
    title: '全部',
    shortTitle: '全部项目',
    description: '先浏览全部机会，再叠加搜索、状态、分类与收藏。',
    rules: { type: 'all' },
  }),
  createPreset({
    id: HERCLAW_PROJECT_PRESET_ID,
    title: '龙虾盒子',
    shortTitle: 'HerClaw',
    description: '按真实 HerClaw 画像与显式赛事清单精确推荐。',
    rules: {
      type: 'explicit',
      includeCompetitionIds: HERCLAW_EXPLICIT_COMPETITION_IDS,
    },
  }),
  createPreset({
    id: OCG_PROJECT_PRESET_ID,
    title: 'OCG 网站',
    shortTitle: 'OCG',
    description: '按 OCG 卡牌/游戏网站受众筛选：TCG 与卡牌 AI 赛、游戏开发 jam、卡面与游戏美术设计赛。',
    rules: {
      type: 'explicit',
      includeCompetitionIds: OCG_EXPLICIT_COMPETITION_IDS,
    },
  }),
  createPreset({
    id: 'ai-agent',
    title: 'AI 软件 / Agent',
    shortTitle: 'AI 软件 / Agent',
    description: 'Agent、Skill、工作流、MCP 与可运行 AI 应用。',
    rules: {
      type: 'criteria',
      categoryAny: ['AI 软件', '开源开发', '安全攻防'],
      keywordAny: ['agent', '智能体', 'skill', '工作流', 'mcp', '大模型', 'ai 应用', '自动化'],
    },
  }),
  createPreset({
    id: 'hybrid-product',
    title: '软硬件产品',
    shortTitle: '软硬件产品',
    description: '智能终端、轻硬件、机器人与软硬件解决方案。',
    rules: {
      type: 'criteria',
      categoryAny: ['工程量产'],
      keywordAny: ['智能硬件', '智能终端', '硬件产品', '机器人', '设备', '端云', 'fpga', '传感器'],
    },
  }),
  createPreset({
    id: 'algorithm',
    title: '算法项目',
    shortTitle: '算法项目',
    description: '建模、预测、视觉、优化、安全与算法研究成果。',
    rules: {
      type: 'criteria',
      categoryAny: ['数据算法', '安全攻防'],
      keywordAny: ['算法', '建模', '预测', '分割', '检测', '优化挑战', '数据集', 'kaggle'],
    },
  }),
  createPreset({
    id: 'creative-work',
    title: '创意作品',
    shortTitle: '创意作品',
    description: 'AIGC、游戏、影像、互动艺术与社区创作。',
    rules: {
      type: 'criteria',
      categoryAny: ['创意 AI', '游戏创作', '社区创意', '国际曝光'],
      keywordAny: ['aigc', '影像', '短片', '动画', '游戏', '视觉艺术', '互动艺术', '创作者'],
    },
  }),
  createPreset({
    id: 'startup',
    title: '创业项目',
    shortTitle: '创业项目',
    description: '已有产品、商业计划、真实用户或公司主体的项目。',
    rules: {
      type: 'criteria',
      categoryAny: ['创业路演', '创投曝光', '政府政策', '渠道变现'],
      keywordAny: ['创业', '商业计划', 'bp', '真实用户', '营收', '融资', '初创企业', '商业化'],
    },
  }),
  createPreset({
    id: 'student-team',
    title: '学生团队',
    shortTitle: '学生团队',
    description: '高校、职校、研究生或明确设置学生组的机会。',
    rules: {
      type: 'criteria',
      categoryAny: ['学生限定'],
      eligibilityAny: ['学生', '大学生', '研究生', '高校', '高职', '职校', '校园'],
      excludeAny: ['不要求学生'],
    },
  }),
]);

export const PROJECT_PRESET_BY_ID = new Map(PROJECT_PRESETS.map(preset => [preset.id, preset]));
