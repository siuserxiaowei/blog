export const ROUND4_CORRECTIONS_CHECKED_AT = '2026-08-02';

function source(title, url, kind = 'official') {
  return { title, date: ROUND4_CORRECTIONS_CHECKED_AT, url, kind };
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
      checkedAt: ROUND4_CORRECTIONS_CHECKED_AT,
      sourceKind,
      linkHealth,
      notes,
    },
    sources,
  };
}

export const competitionRound4Corrections = Object.freeze({
  agenticcinema2026: reviewedPatch({
    entryStatus: 'open-to-new',
    desc: '使用 Gemini、Google Cloud Agent Builder 与合作方 MCP Server 构建媒体娱乐 Agent。当前规则页列出 IBM、Grafana、Parallel、ClickHouse、Replit 5 个奖金轨，合计现金 65,000 美元；Devpost AI 目录同时显示 75,000 美元，只作为冲突线索。中国居民仍明确不可参加。',
    strategy: '中国居民直接跳过；符合地区资格者选择一个合作方轨，按规则页金额准备，并在提交前复核目录 75,000 美元冲突是否已统一。',
    rewards: [
      'IBM：$7,500 / $4,500 / $3,000，小计 $15,000',
      'Grafana：$7,500 / $3,000 / $2,000，小计 $12,500',
      'Parallel：$7,500 / $3,000 / $2,000，小计 $12,500',
      'ClickHouse：$7,500 / $3,000 / $2,000，小计 $12,500',
      'Replit：$7,500 / $3,000 / $2,000，小计 $12,500',
      '规则页合计 $65,000；Devpost AI 目录显示 $75,000，存在冲突',
    ],
    cons: ['中国居民明确不可参加', '规则页 $65,000 与目录 $75,000 冲突', '技术栈绑定', '非专有部分须使用允许商用的 OSI 许可公开'],
    eligibility: {
      scope: 'global-limited',
      regions: ['官方规则所列合格地区；明确排除中国居民'],
      chinaEligible: 'no',
      fee: 'not-stated',
      team: '符合官方地区与成年要求的个人 / 团队；人数上限以规则为准',
    },
    prizeBoundary: {
      cash: [
        { currency: 'USD', amount: 15000, scope: 'IBM 轨合计：7,500 / 4,500 / 3,000' },
        { currency: 'USD', amount: 12500, scope: 'Grafana 轨合计：7,500 / 3,000 / 2,000' },
        { currency: 'USD', amount: 12500, scope: 'Parallel 轨合计：7,500 / 3,000 / 2,000' },
        { currency: 'USD', amount: 12500, scope: 'ClickHouse 轨合计：7,500 / 3,000 / 2,000' },
        { currency: 'USD', amount: 12500, scope: 'Replit 轨合计：7,500 / 3,000 / 2,000' },
      ],
      nonCash: ['Google Cloud / IBM 与合作方生态曝光'],
      investment: [],
      cashStatus: 'rules-total-65000; directory-conflict-75000',
      ip: '非专有部分须以允许商用的 OSI 认可许可开源',
    },
    sources: [
      source('Devpost｜Agentic Cinema Official Rules', 'https://agentic-cinema.devpost.com/rules'),
      source('Devpost｜Artificial Intelligence Directory', 'https://devpost.com/c/artificial-intelligence'),
    ],
    notes: '规则页当前五轨现金合计 USD 65,000，作为主事实；Devpost AI 目录显示 USD 75,000，保留为未解决冲突。中国居民排除与 OSI 开源要求保持不变。',
    status: 'partially-verified',
  }),

  nanningopc2026: reviewedPatch({
    entryStatus: 'open-to-new',
    date: '报名延长至 2026-08-20 24:00；须在报名小程序最终确认',
    deadlineISO: '2026-08-20',
    suit: '高；权威镜像支持，报名端待复核',
    desc: '南宁市人社局署名的 2026-07-02 延期通知文本把报名截止调整至 2026-08-20 24:00。直接政府详情页未能稳定获取，当前由三份相互印证的通知镜像支持，仍须在“数智创就服务”小程序最终确认。',
    strategy: '按 8 月 20 日 24:00 倒排材料，但提交前必须在报名小程序确认入口仍收件，并核对资格、费用与奖励条款。',
    cons: ['南宁人社直接详情页未稳定获取', '当前日期由权威镜像相互印证', '须在微信小程序最终确认', '资格、费用和奖金有效性仍需报名端复核'],
    timeline: [{ event: '延期后报名截止 24:00', date: '2026-08-20', critical: true }],
    deadlines: [{
      type: 'registration',
      date: '2026-08-20',
      certainty: 'confirmed',
      timezone: 'Asia/Shanghai',
      label: '延期后报名截止（24:00）',
      primary: true,
      sourceUrl: 'https://m12333.cn/policy/swfaf.html',
    }],
    primaryDeadline: {
      type: 'registration',
      date: '2026-08-20',
      certainty: 'confirmed',
      timezone: 'Asia/Shanghai',
      label: '延期后报名截止（24:00）',
      sourceUrl: 'https://m12333.cn/policy/swfaf.html',
    },
    sources: [
      source('m12333｜南宁 AI+OPC 延期通知文本（标注来源南宁市人社局）', 'https://m12333.cn/policy/swfaf.html', 'reported'),
      source('m12333｜南宁人社通知索引', 'https://m12333.cn/platform/wry.html', 'reported'),
      source('科航金桥｜保留南宁市人社局署名的完整转载', 'https://nnkhjq.com/nd.jsp?id=24255', 'reported'),
    ],
    notes: '三份镜像共同支持南宁市人社局 2026-07-02 公开通知及 2026-08-20 24:00 延期，但不等同直接打开政府原文；维持 partially-verified，提交前复核原站或报名小程序。',
    status: 'partially-verified',
    sourceKind: 'reported',
  }),

  mediaaiac2026: reviewedPatch({
    entryStatus: 'open-to-new',
    eligibility: {
      scope: 'legal-entity-only',
      regions: ['中国；地方参赛者可能须先经省级广电部门推荐'],
      chinaEligible: 'yes',
      fee: 'not-stated',
      team: '法人主体；联合单位不超过 3 家、完成人不超过 10 人',
    },
    prizeBoundary: {
      cash: [],
      nonCash: ['国家级等级认定', '行业展示'],
      investment: [],
      cashStatus: 'not-stated',
      ip: '须保证合法知识产权或使用权；未要求开源',
    },
    sources: [
      source('国家广播电视总局｜第五届 MediaAIAC 通知', 'https://www.nrta.gov.cn/art/2026/7/21/art_113_73728.html'),
      source('云南省广电局｜地方推荐通知', 'https://ynsgbdsj.yn.gov.cn/zwgk/fdzdgknr/gsgg/202607/t20260727_3254464.html'),
    ],
    notes: '国家广电总局一手来源确认国家系统 2026-08-31 24:00 与法人资格；云南通道 8 月 10 日为地区内部更早节点，不覆盖国家主截止。现金与费用未披露。',
  }),

  ccfopc: reviewedPatch({
    entryStatus: 'open-to-new',
    eligibility: {
      scope: 'legal-entity-only',
      regions: ['中国境内注册法人'],
      chinaEligible: 'yes',
      fee: 'free',
      team: '申报主体须为案例实际使用方而非外部服务商；须有公章与量化成效',
    },
    prizeBoundary: {
      cash: [],
      nonCash: ['等级奖', 'CCF 2026 案例集', 'CCF 官网与媒体展示', 'CNCC 颁证'],
      investment: [],
      cashStatus: 'not-stated',
      ip: '同意在 CCF 渠道与公开出版物展示案例；未要求开源',
    },
    sources: [
      source('中国计算机学会｜2026 企业数字化发展案例大赛', 'https://www.ccf.org.cn/Focus/2026-07-13/914635.shtml'),
    ],
    notes: 'CCF 一手页面确认 2026-08-19 24:00、免费、境内法人、公章及实际使用方要求；无现金奖说明。',
  }),

  gbacc2026: reviewedPatch({
    entryStatus: 'open-to-new',
    eligibility: {
      scope: 'national-multi-division',
      regions: ['全国；E 个人组 1–3 人，另有机构 / 院校 / 企业 / 港澳 / 青少年组'],
      chinaEligible: 'yes',
      fee: 'not-stated',
      team: 'E 个人组 1–3 人且不代表单位；其他组别按各自资格',
    },
    prizeBoundary: {
      cash: [],
      nonCash: ['全国赛事认证', '网络安全行业曝光'],
      investment: [],
      cashStatus: 'not-stated',
      ip: '须满足诚信、原创与安全合规；未要求开源',
    },
    sources: [
      source('湾区杯网络安全大赛｜官方赛事平台', 'https://race.cinsa.org.cn/race/gbacc2026'),
    ],
    notes: '官方赛事平台确认 2026-08-24 09:00、E 个人组 1–3 人及 AI 漏洞 / Agent 自主解题专项；现金与费用未披露。',
  }),
});

export default competitionRound4Corrections;
