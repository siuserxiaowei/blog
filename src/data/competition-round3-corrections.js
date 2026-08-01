export const ROUND3_CORRECTIONS_CHECKED_AT = '2026-08-02';

function source(title, url, kind = 'official') {
  return {
    title,
    date: ROUND3_CORRECTIONS_CHECKED_AT,
    url,
    kind,
  };
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
      checkedAt: ROUND3_CORRECTIONS_CHECKED_AT,
      sourceKind,
      linkHealth,
      notes,
    },
    sources,
  };
}

/**
 * Round-three corrections are applied after the round-two additions have been
 * merged so this sidecar can safely update both baseline and round-two records.
 */
export const competitionRound3Corrections = Object.freeze({
  agenticcinema2026: reviewedPatch({
    desc: '使用 Gemini、Google Cloud Agent Builder 与合作方 MCP Server 构建媒体娱乐 Agent 或多 Agent 系统。当前规则设置 5 个奖金轨，每轨前三名为 5,000 / 3,000 / 2,000 美元，总现金 50,000 美元；规则明确排除中国居民。',
    strategy: '中国居民直接跳过；符合地区资格者应先选择一个奖金轨，再围绕安全治理、MCP 数据流与生产级多 Agent 编排完成公开作品。',
    rewards: [
      '5 个奖金轨，每轨一等奖 $5,000',
      '每轨二等奖 $3,000、三等奖 $2,000',
      '总现金奖金 $50,000',
      'Google Cloud / IBM 官方曝光',
    ],
    cons: ['中国居民明确不可参加', '技术栈绑定', '需公开仓库并使用 OSI 认可许可'],
    eligibility: {
      scope: 'global-limited',
      regions: ['官方规则所列合格地区；明确排除中国居民'],
      chinaEligible: 'no',
      fee: 'not-stated',
      team: '符合官方地区与成年要求的个人 / 团队；人数上限以规则为准',
    },
    prizeBoundary: {
      cash: [{ currency: 'USD', amount: 50000, scope: '5 个奖金轨总额' }],
      nonCash: ['Google Cloud / IBM 官方曝光'],
      investment: [],
    },
    sources: [
      source('Devpost｜Agentic Cinema Official Rules', 'https://agentic-cinema.devpost.com/rules'),
    ],
    notes: '当前官方规则为 5 个奖金轨，每轨 5,000 / 3,000 / 2,000 美元，总计 50,000 美元；保留中国居民不可投及 OSI 开源许可要求。',
  }),

  waxalasr2026: reviewedPatch({
    url: 'https://zindi.world/competitions/google-waxal-asr-challenge',
    date: '截止 2026-08-09',
    deadlineISO: '2026-08-09',
    desc: '面向所有参赛者的自动语音识别挑战，最多 4 人组队，总奖金 1 万美元。只允许开源工具、禁用 AutoML；前 10 名需接受代码复核，最终前三名须把获胜方案代码的全球版权转让给 Zindi。',
    strategy: '先确认数据许可、开源工具与提交格式，再评估一周内能否复用现有 ASR 管线；获奖代码版权转让是明确的 No-go 检查项。',
    audience: '全球语音识别、低资源语言、声学建模与 NLP 团队；最多 4 人',
    rewards: ['总现金奖金 $10,000', 'Zindi / Google 生态曝光'],
    cons: ['时间窗口短', '训练计算量大', '禁用 AutoML', '最终前三名须接受获胜方案代码的全球版权转让'],
    timeline: [{ event: '比赛关闭 / 最终提交截止', date: '2026-08-09', critical: true }],
    deadlines: [{
      type: 'submission',
      date: '2026-08-09',
      certainty: 'confirmed',
      timezone: '官方页未注明',
      label: '比赛关闭 / 最终提交截止',
      primary: true,
      sourceUrl: 'https://zindi.world/competitions/google-waxal-asr-challenge',
    }],
    primaryDeadline: {
      type: 'submission',
      date: '2026-08-09',
      certainty: 'confirmed',
      timezone: '官方页未注明',
      label: '比赛关闭 / 最终提交截止',
      sourceUrl: 'https://zindi.world/competitions/google-waxal-asr-challenge',
    },
    eligibility: {
      scope: 'global',
      regions: ['全球；官方页写明 open to all'],
      chinaEligible: 'yes',
      fee: 'not-stated',
      team: '最多 4 人',
    },
    prizeBoundary: {
      cash: [{ currency: 'USD', amount: 10000, scope: '总奖池' }],
      nonCash: ['Google / Zindi 生态曝光'],
      investment: [],
    },
    sources: [
      source('Zindi｜Google WAXAL ASR Challenge', 'https://zindi.world/competitions/google-waxal-asr-challenge'),
    ],
    notes: 'Zindi 当前官方赛事页把关闭日更新为 2026-08-09；同步截止、四人上限、开源工具限制与前三名代码版权转让边界。',
  }),

  unescohack2026: reviewedPatch({
    loc: '全球 18–30 岁青年 · 2–6 人 · 不要求学生身份',
    cat: '青年限定',
    desc: '面向全球 18–30 岁青年，2–6 人组队，不要求学生身份。可提交 AI 信息素养工具、应用、网站、游戏或教育工具；获胜团队受邀赴希腊展示。',
    strategy: '年龄符合即可，不要把学生身份当门槛；围绕信息可信度、媒体素养或教育做可公开演示、多语言可访问的轻量工具。',
    audience: '全球 18–30 岁青年开发者、设计师与教育团队；2–6 人，不要求学生身份',
    pros: ['全球青年可参加', '不要求学生身份', '软件形式广', 'UNESCO 国际组织背书'],
    cons: ['年龄严格限制为 18–30 岁', '必须 2–6 人组队', '现金奖励未披露'],
    eligibility: {
      scope: 'age-limited',
      regions: ['全球'],
      chinaEligible: 'yes',
      fee: 'not-stated',
      team: '2–6 人；所有成员 18–30 岁；不要求学生身份',
    },
    prizeBoundary: {
      cash: [],
      nonCash: ['获胜团队赴希腊展示', 'UNESCO 国际曝光', '青年创新网络'],
      investment: [],
    },
    sources: [
      source('UNESCO｜Youth Hackathon 2026', 'https://www.unesco.org/en/articles/unesco-youth-hackathon-2026'),
    ],
    notes: 'UNESCO 官方公告确认全球 18–30 岁、2–6 人；资格是青年限定而非学生限定，费用未在本轮证据中补猜。',
  }),

  'roblox-inspire-2026': reviewedPatch({
    rewards: [
      '各类别每名成员 GoGift：第一名 $600、第二名 $400、第三名 $200',
      'Honorable Mention：每名成员 $100 GoGift',
      'Best Overall：RDC 2026 行程；不适用时可替换为每名成员 $1,000 GoGift',
      '所有 GoGift 与行程均为非现金奖励，并受所在地可用性限制',
    ],
    prizeBoundary: {
      cash: [],
      nonCash: [
        '类别奖每成员 USD 600 / 400 / 200 GoGift',
        'Honorable Mention 每成员 USD 100 GoGift',
        'Best Overall 的 RDC 2026 行程或每成员 USD 1,000 GoGift 替代',
      ],
      investment: [],
    },
    sources: [
      source('Roblox Developer Forum｜Roblox Inspire 2026', 'https://devforum.roblox.com/t/roblox-inspire-2026/4670208'),
      source('Roblox Creator Docs｜Inspire', 'https://create.roblox.com/docs/creator-programs/inspire'),
    ],
    notes: '官方公告已披露 GoGift 档位与 Best Overall 替代方案；这些仍是礼品卡 / 行程，不计现金奖。',
  }),

  nanningopc2026: reviewedPatch({
    date: '当前报名截止未确认；8 月 20 日、9 月 20 日与“4–6 月报名”互相冲突',
    deadlineISO: '2026-08-20',
    suit: '待官方确认',
    desc: '赛事存在性与 AI+OPC 方向有公开线索，但没有可读的一手页面支持当前晚于 8 月 2 日的报名截止。既有 8 月 20 日、聚合页元数据 9 月 20 日及正文“4–6 月报名”互相冲突，不能进入紧急倒计时。',
    strategy: '暂停按日期推荐；只在微信“数智创就服务”小程序或组委会渠道核实当前报名状态、资格、费用与奖励后再投入。',
    audience: 'AI+OPC 创业个人 / 团队的资格口径待主办方可读规则复核',
    rewards: ['奖金组成、兑现条件与当前有效性待主办方规则复核'],
    pros: ['AI+OPC 主题与一人公司方向相关'],
    cons: ['当前报名截止没有一手证据', '8 月 20 日、9 月 20 日与 4–6 月报名口径冲突', '微信小程序入口需人工核验', '费用、资格与奖金有效性待确认'],
    timeline: [
      { event: '原基线 8 月 20 日说法（未确认，勿倒计时）', date: '2026-08-20', critical: false },
      { event: '聚合页元数据 9 月 20 日冲突值（仅线索）', date: '2026-09-20', critical: false },
    ],
    deadlines: [{
      type: 'registration',
      date: null,
      certainty: 'unknown',
      timezone: 'Asia/Shanghai',
      label: '当前报名截止待主办方确认',
      primary: true,
      sourceUrl: null,
    }],
    primaryDeadline: {
      type: 'registration',
      date: null,
      certainty: 'unknown',
      timezone: 'Asia/Shanghai',
      label: '当前报名截止待主办方确认',
      sourceUrl: null,
    },
    eligibility: {
      scope: 'unknown',
      regions: ['南宁相关赛事；当前海内外资格说法待官方复核'],
      chinaEligible: 'not-stated',
      fee: 'not-stated',
      team: '个人 / 团队 / 主体资格与人数待官方可读规则复核',
    },
    prizeBoundary: {
      cash: [],
      nonCash: ['奖金与孵化权益的当前有效性待官方复核'],
      investment: [],
    },
    sources: [
      source('CompeteHub｜南宁 AI+OPC 日期冲突线索', 'https://www.competehub.dev/zh/competitions/urls07e8fe3972755c23b3db212cdc0e7593', 'reported'),
    ],
    notes: '没有可读一手页面支持 8 月 20 日或 9 月 20 日；聚合正文又写 4–6 月报名。降为 unknown / partially-verified，保留 deadlineISO 仅作旧字段兼容，不用于状态算法。',
    status: 'partially-verified',
    sourceKind: 'reported',
    linkHealth: 'uncertain',
  }),

  calle: reviewedPatch({
    date: '提交日 2026-09-14；官方页头 23:45 与规则正文 11:45 SGT 冲突',
    deadlines: [{
      type: 'submission',
      date: '2026-09-14',
      certainty: 'confirmed',
      timezone: 'Asia/Singapore',
      label: '最终提交日；23:45 / 11:45 SGT 冲突，按 11:45 准备',
      primary: true,
      sourceUrl: 'https://call-e.devpost.com/rules',
    }],
    primaryDeadline: {
      type: 'submission',
      date: '2026-09-14',
      certainty: 'confirmed',
      timezone: 'Asia/Singapore',
      label: '最终提交日；23:45 / 11:45 SGT 冲突，按 11:45 准备',
      sourceUrl: 'https://call-e.devpost.com/rules',
    },
    sources: [
      source('Devpost｜CALL-E Official Rules', 'https://call-e.devpost.com/rules'),
    ],
    notes: '官方页面头部显示 2026-09-14 23:45 SGT，规则正文出现 11:45 SGT；日期一致但时刻冲突，标记 partially-verified 并按较早时刻准备。',
    status: 'partially-verified',
  }),

  'pazhou-super-claw-2026': reviewedPatch({
    desc: '以 OpenClaw 为核心技术载体，设智能办公、智慧生活、高效学习与创作三条平行赛道。必须提交项目 PPT 与 3—5 分钟真实本地运行视频；当前官方原页为 8 月 5 日，奖金档位属于拟设置且为税前金额。',
    rewards: [
      '拟：每赛道金奖 1.8 万元（税前）',
      '拟：每赛道银奖 2 名 × 9000 元（税前）',
      '拟：每赛道铜奖 3 名 × 5000 元（税前）',
      '拟：每赛道优胜奖 5 名 × 1000 元（税前）',
    ],
    prizeBoundary: {
      cash: [{
        currency: 'CNY',
        amount: 168000,
        scope: '三赛道按当前拟定档位合计；税前、非保证最终金额',
        gross: true,
        provisional: true,
      }],
      nonCash: ['赛事展示与生态资源'],
      investment: [],
      provisional: true,
      tax: 'gross',
    },
    sources: [
      source('琶洲算法大赛｜超级龙虾挑战赛当前规则', 'https://www.aicompetition-pz.com/topic_detail/33'),
    ],
    notes: '保留当前官方原页 2026-08-05。搜索缓存曾显示 2026-07-15，只作为历史冲突线索，不覆盖当前原页；奖金为拟设置且税前。团队保留 IP，主办方获宣传展示许可。',
  }),
});

export default competitionRound3Corrections;
