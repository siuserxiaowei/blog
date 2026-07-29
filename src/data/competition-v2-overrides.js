const officialVerification = (notes = null) => ({
  status: 'verified',
  checkedAt: '2026-07-30',
  sourceKind: 'official',
  linkHealth: 'reachable',
  notes,
});

const uncertainDeadline = (certainty, label, date = null) => ({
  type: certainty === 'rolling' ? 'application' : 'submission',
  date,
  certainty,
  timezone: 'Asia/Shanghai',
  label,
  primary: true,
});

export const competitionV2Overrides = Object.freeze({
  aiinfrasummit2026: {
    date: '报名 / 开赛 2026-09-10 · 现场提交 2026-09-17',
    deadlines: [
      {
        type: 'registration',
        date: '2026-09-10',
        certainty: 'confirmed',
        timezone: 'America/Los_Angeles',
        label: '报名与线上构建开始',
        primary: true,
      },
      {
        type: 'submission',
        date: '2026-09-17',
        certainty: 'confirmed',
        timezone: 'America/Los_Angeles',
        label: '现场最终提交',
      },
    ],
    primaryDeadline: {
      type: 'registration',
      date: '2026-09-10',
      certainty: 'confirmed',
      timezone: 'America/Los_Angeles',
      label: '报名与线上构建开始',
    },
    verification: officialVerification('报名/开赛日与最终提交日分开建模；勿把 9 月 10 日写成唯一提交截止。'),
  },
  pokemonagent2026: {
    date: '参赛意向 08-09 · Agent 08-16 · 报告 09-13',
    deadlines: [
      {
        type: 'intent',
        date: '2026-08-09',
        certainty: 'confirmed',
        timezone: 'UTC',
        label: '接受 Simulation 规则 / 参赛意向',
        primary: true,
      },
      {
        type: 'submission',
        date: '2026-08-16',
        certainty: 'confirmed',
        timezone: 'UTC',
        label: 'Simulation Agent 最终提交',
      },
      {
        type: 'registration',
        date: '2026-09-06',
        certainty: 'confirmed',
        timezone: 'UTC',
        label: 'Strategy 赛道报名截止',
      },
      {
        type: 'submission',
        date: '2026-09-13',
        certainty: 'confirmed',
        timezone: 'UTC',
        label: 'Strategy 报告最终提交',
      },
    ],
    primaryDeadline: {
      type: 'intent',
      date: '2026-08-09',
      certainty: 'confirmed',
      timezone: 'UTC',
      label: '接受 Simulation 规则 / 参赛意向',
    },
    verification: officialVerification('首个强制节点为 8 月 9 日，不应按 9 月 13 日排序。'),
  },
  agenticcinema2026: {
    desc: '使用 Gemini、Google Cloud Agent Builder 与合作方 MCP Server 构建媒体娱乐 Agent 或多 Agent 系统。五组赞助赛道合计现金奖 $65,000；规则明确排除中国等地区，本条仅为符合资格的全球读者保留。',
    rewards: [
      '五组赞助赛道合计 $65,000',
      'IBM：$7,500 / $4,500 / $3,000',
      'Grafana：$7,500 / $3,000 / $2,000',
      'Parallel、ClickHouse 与 Partner Track 5：各 $12,500',
      'Google Cloud / IBM 等合作方曝光',
    ],
    verification: officialVerification('奖金按 Devpost Rules 的五组奖项合计，原 $15,000 是只统计 IBM 赛道的错误。'),
  },
  creatorhackathonvol1: {
    deadlines: [uncertainDeadline('estimated', '以开赛日作保守提醒；独立报名截止未公开', '2026-08-01')],
    primaryDeadline: uncertainDeadline('estimated', '以开赛日作保守提醒；独立报名截止未公开', '2026-08-01'),
    verification: {
      status: 'partially-verified',
      checkedAt: '2026-07-30',
      sourceKind: 'reported',
      linkHealth: 'reachable',
      notes: '公开海报可确认活动日，无法确认独立报名截止；不得进入紧急倒计时。',
    },
  },
  oh: {
    deadlines: [uncertainDeadline('unknown', '2026 届规则与截止日待公告')],
    primaryDeadline: uncertainDeadline('unknown', '2026 届规则与截止日待公告'),
  },
  hax: {
    deadlines: [uncertainDeadline('rolling', '全年滚动申请')],
    primaryDeadline: uncertainDeadline('rolling', '全年滚动申请'),
  },
  geekpark: {
    deadlines: [uncertainDeadline('estimated', 'IF 2027 提名窗口待公告', '2026-10-15')],
    primaryDeadline: uncertainDeadline('estimated', 'IF 2027 提名窗口待公告', '2026-10-15'),
  },
  builderx: {
    deadlines: [uncertainDeadline('estimated', '2026 届报名规则待公告', '2026-10-20')],
    primaryDeadline: uncertainDeadline('estimated', '2026 届报名规则待公告', '2026-10-20'),
  },
  hwdevcomp: {
    deadlines: [uncertainDeadline('rolling', '各分赛道独立发布，不存在统一年度截止')],
    primaryDeadline: uncertainDeadline('rolling', '各分赛道独立发布，不存在统一年度截止'),
  },
  mihome: {
    deadlines: [uncertainDeadline('rolling', '生态链产品全年滚动申请')],
    primaryDeadline: uncertainDeadline('rolling', '生态链产品全年滚动申请'),
  },
  wise36kr: {
    deadlines: [uncertainDeadline('estimated', '2026 届提名与截止待 36氪公告', '2026-11-30')],
    primaryDeadline: uncertainDeadline('estimated', '2026 届提名与截止待 36氪公告', '2026-11-30'),
  },
});
