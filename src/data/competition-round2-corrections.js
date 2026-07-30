const CHECKED_AT = '2026-07-30';

function source(title, url, kind = 'official', date = CHECKED_AT) {
  return { title, date, url, kind };
}

function reviewedPatch({
  sources,
  notes,
  status = 'verified',
  sourceKind = 'official',
  linkHealth = 'reachable',
  ...patch
}) {
  return {
    ...patch,
    verification: {
      status,
      checkedAt: CHECKED_AT,
      sourceKind,
      linkHealth,
      notes,
    },
    sources,
  };
}

const wearableSources = [
  source('Wearable AI Workshop｜Grand Challenge', 'https://wearable-ai-workshop.github.io/'),
  source('Wearable AI Grand Challenge｜Official Rules', 'https://wearable-ai-workshop.github.io/challenge_rules.html'),
];

const wearablePatch = {
  recordType: 'track',
  seriesId: 'wearable-ai-grand-challenge-2026',
  deadlines: [
    {
      type: 'submission',
      date: '2026-08-07',
      certainty: 'confirmed',
      timezone: 'Etc/GMT+12',
      label: 'Validation Phase 截止（AoE）',
      primary: true,
    },
    {
      type: 'submission',
      date: '2026-08-15',
      certainty: 'confirmed',
      timezone: 'Etc/GMT+12',
      label: '入围者 Test Phase 截止（AoE）',
    },
  ],
  primaryDeadline: {
    type: 'submission',
    date: '2026-08-07',
    certainty: 'confirmed',
    timezone: 'Etc/GMT+12',
    label: 'Validation Phase 截止（AoE）',
  },
};

/**
 * Round-two corrections are intentionally kept separate from the canonical
 * collection. Consumers can merge this map through normalizeCompetitionCollection
 * after review. Every entry contains fresh provenance and verification metadata.
 */
export const competitionRound2Corrections = Object.freeze({
  amddevmaster2026: reviewedPatch({
    sources: [
      source('PyTorch Foundation｜AMD AI DevMaster Hackathon', 'https://pytorch.org/event/amd-ai-devmaster-hackathon/'),
      source('AMD AI DevMaster｜Registration', 'https://luma.com/amd-4dhi'),
    ],
    notes: '官方活动页与报名页确认 8 月 6 日截止、三人以内团队、三赛道合计 $30,000；GPU 资源须另行申请，不计作现金。',
  }),

  aidisability2026: reviewedPatch({
    desc: '聚焦残疾人生活、康复、教育、就业、心理支持与社会融入。创新赛道只接受依法登记单位及成熟产品；创意赛道接受个人、团队和单位提交创意设计或服务方案。',
    audience: '创新赛道：依法登记单位及成熟产品；创意赛道：个人、团队、高校 / 职校师生及单位',
    deadlines: [{
      type: 'submission',
      date: '2026-07-31',
      certainty: 'confirmed',
      timezone: 'Asia/Shanghai',
      label: '报名材料提交截止',
      primary: true,
    }],
    primaryDeadline: {
      type: 'submission',
      date: '2026-07-31',
      certainty: 'confirmed',
      timezone: 'Asia/Shanghai',
      label: '报名材料提交截止',
    },
    sources: [
      source('中国残联｜2026 年 AI 助残创新创意大赛公告', 'https://www.cdpf.org.cn/zwgk/ggtz1/b31d1051536848d998aea1e2a178132a.htm'),
    ],
    notes: '截止日准确；补齐两赛道资格边界。公告只写“酌情给予物质奖励”，不得推导现金数额。',
  }),

  beidouspace2026: reviewedPatch({
    deadlines: [{
      type: 'registration',
      date: '2026-08-07',
      certainty: 'confirmed',
      timezone: 'Asia/Shanghai',
      label: '官网报名截止（18:00）',
      primary: true,
    }],
    primaryDeadline: {
      type: 'registration',
      date: '2026-08-07',
      certainty: 'confirmed',
      timezone: 'Asia/Shanghai',
      label: '官网报名截止（18:00）',
    },
    sources: [
      source('湖南省科技厅｜北斗时空信息专业赛通知', 'https://kjt.hunan.gov.cn/kjt/xxgk/tzgg/tzgg_1/202607/t20260720_34030088.html'),
    ],
    notes: '政府通知确认 8 月 7 日 18:00 报名截止及奖项；企业组限中国境内非上市法人，未注册团队组限高校 / 科研院所且至少 3 人。自动审计出现 TLS EPROTO，但浏览器人工复核可达，不能标死链。',
    linkHealth: 'uncertain',
  }),

  qingchuangopc2026: reviewedPatch({
    date: '预计报名截止 2026-08-03；须向主办方复核',
    deadlines: [{
      type: 'registration',
      date: '2026-08-03',
      certainty: 'estimated',
      timezone: 'Asia/Shanghai',
      label: '聚合页所列报名截止；官方入口未找到',
      primary: true,
    }],
    primaryDeadline: {
      type: 'registration',
      date: '2026-08-03',
      certainty: 'estimated',
      timezone: 'Asia/Shanghai',
      label: '聚合页所列报名截止；官方入口未找到',
    },
    sources: [
      source('CompeteHub｜青创杯 OPC 专项赛整理页', 'https://competehub.dev/zh/competitions/urls2fd2c6fa6d1f7bf00f65d15e3f09f28b', 'reported'),
    ],
    notes: '报名日与资格只能由第三方整理页支持，未找到本届主办方规则或报名页；降为 estimated，禁止进入倒计时与 ICS。',
    status: 'partially-verified',
    sourceKind: 'reported',
  }),

  autonomousagentbeta2026: reviewedPatch({
    sources: [
      source('Kaggle｜Autonomous Agent Prediction (Beta)', 'https://www.kaggle.com/competitions/autonomous-agent-prediction-beta'),
    ],
    notes: 'Kaggle 活动页确认当前开放、奖项为 Swag 而非现金；8 月 6 日为当前页面所列截止日。',
  }),

  fujianfinanceai2026: reviewedPatch({
    date: '报名截止 2026-07-31 · 方案 / PPT 截止 2026-08-31',
    desc: '只面向福建省内金融机构和地方金融组织中、于 2026 年 1 月 1 日前入职的在职职工。团队 2—3 人，先由单位在 7 月 31 日前报名，再于 8 月 31 日前提交方案和 PPT。',
    audience: '福建省内金融机构 / 地方金融组织中 2026-01-01 前入职的在职职工；2—3 人团队',
    rewards: [
      '三个赛道分别设一等奖 1 名 × 1 万元',
      '三个赛道分别设二等奖 2 名 × 8000 元',
      '三个赛道分别设三等奖 3 名 × 5000 元',
      '金牌选手 / 数字工匠等荣誉',
    ],
    deadlines: [
      {
        type: 'registration',
        date: '2026-07-31',
        certainty: 'confirmed',
        timezone: 'Asia/Shanghai',
        label: '单位报名截止',
        primary: true,
      },
      {
        type: 'submission',
        date: '2026-08-31',
        certainty: 'confirmed',
        timezone: 'Asia/Shanghai',
        label: '参赛方案与 PPT 提交截止',
      },
    ],
    primaryDeadline: {
      type: 'registration',
      date: '2026-07-31',
      certainty: 'confirmed',
      timezone: 'Asia/Shanghai',
      label: '单位报名截止',
    },
    sources: [
      source('福建省地方金融管理局｜金融数智杯通知', 'https://fjjrb.gov.cn/tzgg/tzgg/202606/t20260617_7164041.htm'),
    ],
    notes: '原记录把 7 月 31 日误标为作品提交，且漏掉 8 月 31 日方案节点、入职时间和地方金融组织边界；奖金为三个赛道分别设置。',
  }),

  xfydigital2026: reviewedPatch({
    sources: [
      source('科大讯飞 AI 开发者大赛｜数字化转型赛题', 'https://challenge.xfyun.cn/topic/info?type=digital-transformation'),
    ],
    notes: '官方赛题入口可达；截止与 3/2/1 万元现金档位保留。页面首屏为动态渲染，提交前仍应登录确认具体时刻。',
  }),

  backblaze2026: reviewedPatch({
    sources: [
      source('Devpost｜Backblaze Generative Media Challenge', 'https://backblaze-generative-media.devpost.com/'),
    ],
    notes: 'Devpost 官方活动页确认 8 月 3 日截止和 $10,000 总现金奖。',
  }),

  pokemonagent2026: reviewedPatch({
    recordType: 'series',
    seriesId: 'pokemon-tcg-ai-battle-challenge-2026',
    sources: [
      source('Kaggle｜PTCG AI Battle Challenge Strategy', 'https://www.kaggle.com/competitions/pokemon-tcg-ai-battle-challenge-strategy'),
      source('Kaggle｜PTCG AI Battle Challenge Simulation', 'https://www.kaggle.com/competitions/pokemon-tcg-ai-battle/overview/description'),
    ],
    notes: '这是 Simulation 与 Strategy 两个相连赛项的聚合记录：参加 Strategy 必须参加 Simulation。8/9 是 Simulation 规则接受 / 组队截止，8/16 是 Agent 截止，9/6 是 Strategy 报名截止，9/13 是报告截止；Strategy 奖池 $240,000，Simulation 本身无现金奖。',
  }),

  waxalasr2026: reviewedPatch({
    url: 'https://zindi.world/competitions/google-waxal-asr-challenge',
    sources: [
      source('Zindi｜Google WAXAL ASR Challenge', 'https://zindi.world/competitions/google-waxal-asr-challenge'),
    ],
    notes: '截止、四人团队上限与奖金口径保留；action URL 从已 301 的 zindi.africa 更新到 zindi.world 最终地址。',
  }),

  scriptctf2026: reviewedPatch({
    sources: [
      source('scriptCTF 2026｜Official Site', 'https://ctf.scriptsorcerers.xyz/'),
    ],
    notes: '官方站确认赛事与 8 月 10 日截止；约 $7,600 是奖品价值，不应写成现金总奖池。',
  }),

  energytechasia2026: reviewedPatch({
    deadlines: [{
      type: 'application',
      date: '2026-08-10',
      certainty: 'confirmed',
      timezone: null,
      label: '创业公司申请截止',
      primary: true,
    }],
    primaryDeadline: {
      type: 'application',
      date: '2026-08-10',
      certainty: 'confirmed',
      timezone: null,
      label: '创业公司申请截止',
    },
    audience: '全球 Pre-Seed 至 Series B 私营科技公司；须有 market-ready 产品和收入或最小 traction；入围者须由创始人 / C-level 到吉隆坡现场路演',
    sources: [
      source('Energy Tech Challengers Asia｜Official Competition', 'https://energytechchallengers.com/challengers-asia/'),
    ],
    notes: '官网确认 8 月 10 日申请截止、60 强各一张大会票；无现金奖，且不鼓励 pre-product 项目。',
  }),

  xtcai3602026: reviewedPatch({
    deadlines: [{
      type: 'application',
      date: '2026-07-30',
      certainty: 'confirmed',
      timezone: null,
      label: '全球创业公司申请截止',
      primary: true,
    }],
    primaryDeadline: {
      type: 'application',
      date: '2026-07-30',
      certainty: 'confirmed',
      timezone: null,
      label: '全球创业公司申请截止',
    },
    audience: '全球已有 MVP 且有市场 traction 的 AI 创业公司；入围者须自费参加 11 月 19 日 Palo Alto 决赛',
    sources: [
      source('Extreme Tech Challenge｜XTC AI:360 2026', 'https://extremetechchallenge.org/news/applications-now-open-for-the-xtc-ai360-global-startup-competition-2026/'),
    ],
    notes: '申请截止准确；补齐 MVP / traction 门槛与入围团队自行承担 Palo Alto 到场费用的行动成本。',
  }),

  xinghuocup2026: reviewedPatch({
    sources: [
      source('科大讯飞｜2026 星火杯大模型应用赛', 'https://challenge.xfyun.cn/xinghuo'),
    ],
    notes: '官方入口确认高校学生、1—6 人团队、8 月 13 日节点与 25 万元总奖池。',
  }),

  aistudentsecurity2026: reviewedPatch({
    sources: [
      source('上海交通大学｜大学生 AI 安全赛', 'https://ai-contest.sjtu.edu.cn/'),
    ],
    notes: '官方站确认仅全日制本专科生及 8 月 2 日报名节点；当前页面未披露现金奖金，不作现金推断。',
  }),

  geoaiagua2026: reviewedPatch({
    url: 'https://zindi.world/competitions/geoai-aquaculture-pond-identification-challenge',
    sources: [
      source('Zindi｜GeoAI Aquaculture Pond Identification Challenge', 'https://zindi.world/competitions/geoai-aquaculture-pond-identification-challenge'),
    ],
    notes: '截止、最多四人及 CHF 1,000 现金奖准确；action URL 更新到 zindi.world 最终地址。',
  }),

  talestribute2026: reviewedPatch({
    recordType: 'track',
    seriesId: 'ieee-cog-2026-ai-competitions',
    sources: [
      source('ScriptsOfTribute｜IEEE CoG 2026 Competition', 'https://github.com/ScriptsOfTribute'),
    ],
    notes: '组织者仓库 README 确认 8 月 10 日 Agent 截止及 $500/$300/$200 现金奖。',
  }),

  fightingicellm2026: reviewedPatch({
    recordType: 'track',
    seriesId: 'darefightingice-2026',
    deadlines: [{
      type: 'submission',
      date: '2026-08-07',
      certainty: 'confirmed',
      timezone: 'Etc/GMT+12',
      label: 'LLM Agent 最终提交（AoE）',
      primary: true,
    }],
    primaryDeadline: {
      type: 'submission',
      date: '2026-08-07',
      certainty: 'confirmed',
      timezone: 'Etc/GMT+12',
      label: 'LLM Agent 最终提交（AoE）',
    },
    sources: [
      source('TeamFightingICE｜2026 LLM AI Competition', 'https://github.com/TeamFightingICE/FightingICE/tree/master/DareFightingICE/AI'),
    ],
    notes: '组织者 README 确认 8 月 7 日 AoE、不延期及 $500/$300/$200；本条标为 DareFightingICE 系列赛道。',
  }),

  fightingicesound2026: reviewedPatch({
    recordType: 'track',
    seriesId: 'darefightingice-2026',
    deadlines: [{
      type: 'submission',
      date: '2026-08-07',
      certainty: 'confirmed',
      timezone: 'Etc/GMT+12',
      label: 'Sound Design 最终提交（AoE）',
      primary: true,
    }],
    primaryDeadline: {
      type: 'submission',
      date: '2026-08-07',
      certainty: 'confirmed',
      timezone: 'Etc/GMT+12',
      label: 'Sound Design 最终提交（AoE）',
    },
    sources: [
      source('TeamFightingICE｜2026 Sound Design Competition', 'https://github.com/TeamFightingICE/FightingICE/tree/master/DareFightingICE/Sound'),
    ],
    notes: '组织者 README 确认 8 月 7 日 AoE、CC0 声音要求及 $500/$300/$200。自动审计超时但人工浏览器复核可达，不标死链。',
    linkHealth: 'uncertain',
  }),

  wearableproactive2026: reviewedPatch({
    ...wearablePatch,
    sources: wearableSources,
    notes: '官网确认三 Track、每 Track 两个 Subtrack；8/7 仅为 Validation 截止，入围者还需在 8/15 提交 Test。每个 Subtrack 冠军 $2,500、亚军 $1,000，总现金 $21,000。',
  }),

  wearableconversation2026: reviewedPatch({
    ...wearablePatch,
    sources: wearableSources,
    notes: '官网确认三 Track、每 Track 两个 Subtrack；8/7 仅为 Validation 截止，入围者还需在 8/15 提交 Test。每个 Subtrack 冠军 $2,500、亚军 $1,000，总现金 $21,000。',
  }),

  wearablelongvideo2026: reviewedPatch({
    ...wearablePatch,
    sources: wearableSources,
    notes: '官网确认三 Track、每 Track 两个 Subtrack；8/7 仅为 Validation 截止，入围者还需在 8/15 提交 Test。每个 Subtrack 冠军 $2,500、亚军 $1,000，总现金 $21,000。',
  }),

  shundeaihack2026: reviewedPatch({
    date: '预计报名截止 2026-08-02；须向主办方复核',
    deadlines: [{
      type: 'registration',
      date: '2026-08-02',
      certainty: 'estimated',
      timezone: 'Asia/Shanghai',
      label: '资讯聚合页所列报名截止',
      primary: true,
    }],
    primaryDeadline: {
      type: 'registration',
      date: '2026-08-02',
      certainty: 'estimated',
      timezone: 'Asia/Shanghai',
      label: '资讯聚合页所列报名截止',
    },
    sources: [
      source('AI TOP100｜顺德创青春 AI 黑客松资讯', 'https://www.aitop100.cn/infomation/details/34308.html', 'reported'),
    ],
    notes: '页面可达，但未找到主办方规则 / 报名入口来独立确认日期、食宿、交通和奖金；降级为 estimated，禁止倒计时与 ICS。',
    status: 'partially-verified',
    sourceKind: 'reported',
  }),

  miaoyatoy2026: reviewedPatch({
    date: '预计投稿截止 2026-08-10；须在妙呀平台复核',
    deadlines: [{
      type: 'submission',
      date: '2026-08-10',
      certainty: 'estimated',
      timezone: 'Asia/Shanghai',
      label: '资讯聚合页所列投稿截止',
      primary: true,
    }],
    primaryDeadline: {
      type: 'submission',
      date: '2026-08-10',
      certainty: 'estimated',
      timezone: 'Asia/Shanghai',
      label: '资讯聚合页所列投稿截止',
    },
    sources: [
      source('AI TOP100｜妙呀潮玩创作者赛资讯', 'https://www.aitop100.cn/infomation/details/34302.html', 'reported'),
    ],
    notes: '现金 / 积分组合和日期仅见于资讯聚合页，当前 action URL 不是妙呀提交页；降级为 estimated，避免误导立即行动。',
    status: 'partially-verified',
    sourceKind: 'reported',
  }),

  hkust1m: reviewedPatch({
    deadlines: [{
      type: 'application',
      date: '2026-08-04',
      certainty: 'confirmed',
      timezone: 'Asia/Shanghai',
      label: '上海赛区申请截止',
      primary: true,
    }],
    primaryDeadline: {
      type: 'application',
      date: '2026-08-04',
      certainty: 'confirmed',
      timezone: 'Asia/Shanghai',
      label: '上海赛区申请截止',
    },
    sources: [
      source('HKUST Entrepreneurship Center｜One Million Shanghai 2026', 'https://ec.hkust.edu.hk/one-million-sh/2026/home'),
    ],
    notes: '港科大官方页面确认上海赛区 8 月 4 日申请节点；“百万奖金”是赛事品牌 / 体系，本记录没有依据将其写成单项目现金。',
  }),

  jiangsuxiaofei2026: reviewedPatch({
    deadlines: [{
      type: 'application',
      date: '2026-07-31',
      certainty: 'confirmed',
      timezone: 'Asia/Shanghai',
      label: '项目报名截止',
      primary: true,
    }],
    primaryDeadline: {
      type: 'application',
      date: '2026-07-31',
      certainty: 'confirmed',
      timezone: 'Asia/Shanghai',
      label: '项目报名截止',
    },
    sources: [
      source('江苏省商务厅｜2026 江苏省新消费创新创业大赛', 'https://doc.jiangsu.gov.cn/art/2026/6/9/art_78721_11784673.html'),
      source('江苏新消费创业赛｜报名站', 'https://xxf2026.sandlake.com/'),
    ],
    notes: '政府通知与报名站确认 7 月 31 日、10/5/2 万元现金档位；最高 500 万元是潜在股权投资支持，不计现金奖金。',
  }),

  aiskillathon2026: reviewedPatch({
    deadlines: [{
      type: 'submission',
      date: '2026-08-07',
      certainty: 'confirmed',
      timezone: 'Asia/Shanghai',
      label: '意向登记与 Demo 提交截止',
      primary: true,
    }],
    primaryDeadline: {
      type: 'submission',
      date: '2026-08-07',
      certainty: 'confirmed',
      timezone: 'Asia/Shanghai',
      label: '意向登记与 Demo 提交截止',
    },
    sources: [
      source('智极松 AI Skillathon｜官方站', 'https://www.ai-skillathon.com/'),
      source('湖南日报｜全球人工智能技能大赛落地长沙', 'https://www.hunantoday.cn/news/xhn/202606/33008475.html', 'reported', '2026-06-24'),
    ],
    notes: '8 月 7 日同时要求意向登记与 Demo；50 万元以上为现金奖池，100 万元算力券和 50 万元合规服务券均非现金。',
  }),

  aifactory2026: reviewedPatch({
    desc: '为期一周的全球线上 AI 应用黑客松，作品须主要使用 Native.builder 做出可部署应用。当前奖励为合作方工具 / API Credits 与展示资源，未披露现金奖。',
    sources: [
      source('lablab.ai｜AI Factory · Native.builder', 'https://lablab.ai/ai-hackathons/nativebuilder-build-without-limits'),
    ],
    notes: '8 月 10 日截止准确；所有列出的美元额度均为 Credits，不得计入现金奖池。',
  }),

  jiangxitalent2026: reviewedPatch({
    deadlines: [{
      type: 'application',
      date: '2026-08-10',
      certainty: 'confirmed',
      timezone: 'Asia/Shanghai',
      label: '项目申报截止',
      primary: true,
    }],
    primaryDeadline: {
      type: 'application',
      date: '2026-08-10',
      certainty: 'confirmed',
      timezone: 'Asia/Shanghai',
      label: '项目申报截止',
    },
    sources: [
      source('江西高层次人才创新创业大赛｜报名系统', 'https://cxcy.jxciit.gov.cn/'),
      source('央广网｜江西第二届高层次人才创新创业大赛启动', 'https://jx.cnr.cn/cj/20260519/t20260519_527626130.shtml', 'reported', '2026-05-19'),
    ],
    notes: '8 月 10 日申报节点与奖补口径保留；2000 万直接投资和 8000 万授信是条件性金融支持，不是比赛现金奖金。',
  }),

  westlakeagentctf2026: reviewedPatch({
    deadlines: [{
      type: 'registration',
      date: '2026-08-10',
      certainty: 'confirmed',
      timezone: 'Asia/Shanghai',
      label: '高校团队报名截止',
      primary: true,
    }],
    primaryDeadline: {
      type: 'registration',
      date: '2026-08-10',
      certainty: 'confirmed',
      timezone: 'Asia/Shanghai',
      label: '高校团队报名截止',
    },
    sources: [
      source('西湖论剑｜赛事报名系统', 'https://game.gcsis.cn/'),
      source('杭州网｜第九届西湖论剑 AI Agent 赛题', 'https://hznews.hangzhou.com.cn/jingji/content/2026-07/14/content_9254726.htm', 'reported', '2026-07-14'),
    ],
    notes: '8 月 10 日是报名节点，不是作品提交；仅全国普通高校 / 职业院校全日制学生。',
  }),

  bund: reviewedPatch({
    sources: [
      source('外滩黑客松 2026｜报名页', 'https://hackathon2026.app.weavefox.cn/'),
      source('Inclusion 外滩大会 2026', 'https://www.inclusionconf.com/'),
    ],
    notes: '官方报名页确认 8 月 9 日提交节点及 2 万/1 万/5000 元现金档位。',
  }),

  datahubagent: reviewedPatch({
    sources: [
      source('Devpost｜Build with DataHub: The Agent Hackathon', 'https://datahub.devpost.com/'),
    ],
    notes: 'Devpost 官方活动页确认 8 月 10 日截止和 $20,500 总现金奖。',
  }),

  forestryai: reviewedPatch({
    sources: [
      source('中国—东盟林业人工智能创新应用大赛｜官网', 'https://ca-forestry-ai.org.cn/'),
    ],
    notes: '赛事官网确认 8 月 10 日报名节点与每赛道 2 万/1 万/5000/3000 元档位。',
  }),

  wmdcai: reviewedPatch({
    sources: [
      source('WMDC 2026｜数伴 AI 伴侣形象创意设计赛', 'https://wmdc2026.dipal.cn/'),
    ],
    notes: '官网确认 7 月 31 日截止和 5 万元总现金；Dipal D1 标称价值及会员权益不计现金。',
  }),

  'pazhou-super-claw-2026': reviewedPatch({
    sources: [
      source('琶洲算法大赛｜超级龙虾挑战赛规则', 'https://www.aicompetition-pz.com/topic_detail/33'),
    ],
    notes: '第二轮复核保留 8 月 5 日、最多 3 人与各赛道奖金档位；未发现变更。',
  }),

  'guangzhou-super-agent-2026': reviewedPatch({
    sources: [
      source('广州市科技局｜广州超级智能体赛事启动报道', 'https://kjj.gz.gov.cn/xwlb/yw/content/post_10865186.html', 'official', '2026-06-18'),
    ],
    notes: '政府来源确认 7 月 31 日报名节点；未披露统一现金奖，继续只写产业 / 孵化资源。',
  }),

  'ifcomp-2026': reviewedPatch({
    sources: [
      source('IFComp｜2026 Author Handbook', 'https://ifcomp.org/about/how_to_enter'),
    ],
    notes: '复核保留 8 月 1 日 23:59 ET 参赛意向、8 月 28 日成品节点；The Colossal Fund 随捐赠变化，不写固定现金总额。自动链接审计超时但页面并非已证实死链。',
    linkHealth: 'uncertain',
  }),

  aigcforfuture2026: reviewedPatch({
    date: '官网日期冲突：时间轴列 2026-08-31，正文仍有 3—5 月旧文案',
    deadlines: [{
      type: 'submission',
      date: '2026-08-31',
      certainty: 'estimated',
      timezone: 'Asia/Shanghai',
      label: '官网时间轴所列日期；提交前确认表单',
      primary: true,
    }],
    primaryDeadline: {
      type: 'submission',
      date: '2026-08-31',
      certainty: 'estimated',
      timezone: 'Asia/Shanghai',
      label: '官网时间轴所列日期；提交前确认表单',
    },
    sources: [
      source('AIGC For Future｜赛事官网', 'https://aigc.bjit.org.cn/'),
    ],
    notes: '官网内部日期自相矛盾，不能把 8 月 31 日作为 confirmed 倒计时；表单开放状态需人工确认。',
    status: 'partially-verified',
  }),

  guangdongsensor2026: reviewedPatch({
    date: '预征集至 2026-08-31；正式赛规则待发布',
    deadlines: [{
      type: 'application',
      date: '2026-08-31',
      certainty: 'estimated',
      timezone: 'Asia/Shanghai',
      label: '预征集截止；正式报名规则待发布',
      primary: true,
    }],
    primaryDeadline: {
      type: 'application',
      date: '2026-08-31',
      certainty: 'estimated',
      timezone: 'Asia/Shanghai',
      label: '预征集截止；正式报名规则待发布',
    },
    sources: [
      source('增城区政府｜智能传感器创业大赛预征集', 'https://www.zc.gov.cn/zx/bmdt/qrsj/content/post_10912548.html'),
      source('赛事征集平台', 'https://smp.dwq360.com/dasai/competition/list'),
    ],
    notes: '8 月 31 日对应预征集而非已发布的正式比赛截止；奖金和正式资格仍待规则，降为 estimated。',
    status: 'partially-verified',
  }),

  goai: reviewedPatch({
    date: '初赛截止：2026 年 8 月中旬（具体日期待官网确认）',
    deadlines: [{
      type: 'submission',
      date: '2026-08-16',
      certainty: 'estimated',
      timezone: 'Asia/Shanghai',
      label: '官网仅写 Mid-August；8 月 16 日为估算提醒',
      primary: true,
    }],
    primaryDeadline: {
      type: 'submission',
      date: '2026-08-16',
      certainty: 'estimated',
      timezone: 'Asia/Shanghai',
      label: '官网仅写 Mid-August；8 月 16 日为估算提醒',
    },
    sources: [
      source('GOAI｜Global Open-source AI Competition', 'https://www.goaihz.com/en'),
    ],
    notes: '原记录把官网“Mid-August”硬编码为 confirmed 8 月 16 日；保留为估算提醒但禁止倒计时与 ICS。500 万元总奖池与算力 / Token 等非现金资源须分开理解。',
    status: 'partially-verified',
  }),

  geminixprize: reviewedPatch({
    date: '截止 2026-08-17 13:00 PDT',
    desc: '总奖金 200 万美元。参赛者须在赛事期内新建并运营一门由 AI 驱动的真实业务，获得真实用户与收入，并至少使用一种 Google Cloud 产品；既有组织可参赛，但提交项目本身必须是赛期内新建。',
    audience: '达到居住地法定成年年龄的个人 / 团队，或少于 25 名员工的小型组织；受制裁地区与人员除外',
    deadlines: [{
      type: 'submission',
      date: '2026-08-17',
      certainty: 'confirmed',
      timezone: 'America/Los_Angeles',
      label: '最终提交截止（13:00 PDT）',
      primary: true,
    }],
    primaryDeadline: {
      type: 'submission',
      date: '2026-08-17',
      certainty: 'confirmed',
      timezone: 'America/Los_Angeles',
      label: '最终提交截止（13:00 PDT）',
    },
    sources: [
      source('Devpost｜Build with Gemini XPRIZE Official Rules', 'https://xprize.devpost.com/rules'),
    ],
    notes: '补齐 13:00 PDT、少于 25 名员工、项目须于 5/19 后新建以及真实用户 / 收入证明要求；$2,000,000 为规则列明现金奖总额。',
  }),

  creatorhackathonvol1: reviewedPatch({
    sources: [
      source('Creator Hackathon Vol.1｜报名表', 'https://my.feishu.cn/share/base/shrcn0SNvOuCKHymgEfNfHYtd6c', 'reported'),
    ],
    notes: '链接重定向链超过自动审计上限；公开海报仅能确认 8/1—8/2 活动日，不能确认独立报名截止。10 万美元等额 Token 不是现金。',
    status: 'partially-verified',
    sourceKind: 'reported',
    linkHealth: 'uncertain',
  }),

  oh: reviewedPatch({
    url: 'https://www.openharmony.cn/',
    date: '2026 届规则与截止日待公告',
    deadlines: [{
      type: 'submission',
      date: null,
      certainty: 'unknown',
      timezone: 'Asia/Shanghai',
      label: '2026 届规则与截止日待公告',
      primary: true,
    }],
    primaryDeadline: {
      type: 'submission',
      date: null,
      certainty: 'unknown',
      timezone: 'Asia/Shanghai',
      label: '2026 届规则与截止日待公告',
    },
    sources: [
      source('OpenHarmony｜官网', 'https://www.openharmony.cn/'),
    ],
    notes: '原 action URL /competition/introduction/ 返回 404，改为可达官网；尚无可核验的 2026 届规则，保持 unknown。',
    status: 'stale',
    linkHealth: 'dead',
  }),

  mp: reviewedPatch({
    url: 'https://www.miracleplus.com/apply/',
    desc: '奇绩创坛 2026 秋季创业营常规申请已截止，但官网仍接受延期申请。官方当前条款为每家 30 万美元或等值人民币投资，换取 7% 股权；这是股权投资，不是奖金。',
    audience: '早期创业公司的创始人；申请人须持团队至少 5% 股权，单人创始人也可申请',
    rewards: [
      '每家 $300,000 或等值人民币投资，换取 7% 股权',
      '3 个月集中加速与合伙人 Office Hour',
      '投资人路演与奇绩校友网络',
      '延期申请全年可提交，但反馈和名额均弱于常规批次',
    ],
    deadlines: [
      {
        type: 'application',
        date: '2026-06-12',
        certainty: 'confirmed',
        timezone: 'Asia/Shanghai',
        label: '2026 秋季常规申请截止（已截止）',
        primary: true,
      },
      {
        type: 'application',
        date: null,
        certainty: 'rolling',
        timezone: 'Asia/Shanghai',
        label: '延期申请全年开放',
      },
    ],
    primaryDeadline: {
      type: 'application',
      date: '2026-06-12',
      certainty: 'confirmed',
      timezone: 'Asia/Shanghai',
      label: '2026 秋季常规申请截止（已截止）',
    },
    sources: [
      source('MiraclePlus｜2026 Fall Accelerator Application', 'https://www.miracleplus.com/apply/'),
      source('MiraclePlus｜FAQ', 'https://www.miracleplus.com/faq/'),
    ],
    notes: '原 miraclepl.us 域名 DNS 失效，投资条款也从参考 $250K 更新为官方当前 $300K / 7%；投资不得计作现金奖金。',
  }),
});

export default competitionRound2Corrections;
