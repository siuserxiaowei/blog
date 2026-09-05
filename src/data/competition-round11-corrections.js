export const ROUND11_CORRECTIONS_CHECKED_AT = '2026-08-06';

const overviewUrl = 'https://developer.volcengine.com/competition';

export const competitionRound11Corrections = Object.freeze({
  'volcengine-huoshan-cup-agent-2026': {
    fullName: '2026 火山杯 Agent 创新大赛（官方目录 63 条子赛事）',
    date: '全年滚动；2026-08-06 核验 36 条作品提交截止尚未过去',
    deadlineISO: '2026-12-30',
    desc: '火山引擎全年 Agent 系列赛。2026-08-06 通过官方总览接口完整核验 63 条子赛事：62 条独立赛与 1 条测试子赛；其中 20 条当日处于作品提交窗口、16 条尚未开始提交，合计 36 条作品提交截止尚未过去。目录包含企业内部赛、校内赛、已截止赛和测试赛，均保留在官方原始目录中，但不会自动作为普通公众推荐。',
    strategy: '先在 63 条官方目录中逐项确认资格；多数企业或高校子赛存在内部限定。优先检查 36 条提交截止尚未过去的记录，再核对是否公开报名、奖励和作品授权，不因“进行中”标签推断普通用户可参加。',
    audience: '企业员工、高校师生、合作伙伴及部分公开开发者；每个子赛资格独立，内部/校内限定不得忽略',
    rewards: ['63 条子赛事奖励各自定义；火山杯伞赛事没有公开统一奖金总额', '官方目录完整保留内部赛、校内赛、已截止赛和测试子赛'],
    pros: ['官方总览目录完整', '全年滚动', 'Agent 应用场景覆盖企业、高校与城市'],
    cons: ['大量企业内部或校内限定', '各子赛奖励与资格独立', '存在 1 条测试子赛', '不能把状态或提交日期等同于公众可报名'],
    eligibility: {
      scope: 'mixed-restricted-series',
      regions: ['中国'],
      chinaEligible: 'yes',
      fee: 'varies-by-subcontest',
      team: '63 条子赛事逐项判断；含企业内部、校内、公开及测试记录',
    },
    prizeBoundary: {
      cash: [],
      nonCash: ['各子赛事自定奖励；伞赛事未公布统一奖励'],
      investment: [],
      cashStatus: 'varies-by-subcontest',
      ip: '各子赛单独约定，提交前必须核验',
    },
    deadlines: [{
      certainty: 'rolling',
      type: 'submission',
      date: null,
      timezone: 'Asia/Shanghai',
      label: '全年滚动；36 条记录的作品提交截止尚未过去，最晚至 2026-12-30',
      primary: true,
      sourceUrl: overviewUrl,
    }],
    primaryDeadline: {
      certainty: 'rolling',
      type: 'submission',
      date: null,
      timezone: 'Asia/Shanghai',
      label: '全年滚动；36 条记录的作品提交截止尚未过去，最晚至 2026-12-30',
      primary: true,
      sourceUrl: overviewUrl,
    },
    timeline: [
      { event: '官方目录核验：63 条子赛事、36 条提交截止尚未过去', date: '2026-08-06' },
      { event: '当前目录中最晚作品提交截止', date: '2026-12-30', critical: true },
    ],
    verification: {
      status: 'verified',
      checkedAt: ROUND11_CORRECTIONS_CHECKED_AT,
      sourceKind: 'official',
      linkHealth: 'reachable',
      notes: '通过火山引擎官方 CompetitionPubListHallSub 接口以 PageSize=100 核验 63/63；PublicID 唯一，62 条独立赛、1 条测试子赛，36 条作品提交截止不早于 2026-08-06。',
    },
    sources: [{ title: '火山引擎官方｜火山杯全部子赛事总览', date: ROUND11_CORRECTIONS_CHECKED_AT, url: overviewUrl, kind: 'official' }],
    url: overviewUrl,
  },
});

export default competitionRound11Corrections;
