import { normalizeCompetitionCollection } from './competition-schema.js';

export const ROUND20_ADDITIONS_CHECKED_AT = '2026-08-09';

const handbookUrl = 'https://my.feishu.cn/docx/JQyOdER0joNvW4x8j2jcwPbonCe?from=from_copylink';

const additions = [{
  id: 'eazo-global-youth-ai-agent-hackathon-2026',
  name: 'Eazo · Global Youth AI Agent 黑客松',
  fullName: 'Eazo · Global Youth AI Agent Hackathon 2026',
  org: 'Eazo / EAZO AI',
  rel: 'A',
  loc: '北京、上海、新加坡三赛区 · 线上初赛 + 线下复赛路演',
  date: '初赛作品提交截止 2026-08-10 22:00（手册未注明时区，暂按北京时间）',
  deadlineISO: '2026-08-10',
  deadlineTimezone: 'Asia/Shanghai',
  deadlineType: 'submission',
  deadlineLabel: '初赛 Agent 作品提交截止（22:00；手册未注明时区）',
  tier: 'A',
  cat: 'AI 软件',
  match: 9.0,
  suit: '很高；适合人文创意、场景洞察、低代码 Agent 和快速交付型产品',
  desc: 'Eazo 面向全球青年的 AI Agent 黑客松，强调“人文创意优先、落地实用性为王”，弱化代码门槛。参赛者 1—4 人组队，在北京、上海或新加坡赛区提交一个可体验的 Agent；初赛包含静态测评和动态测评，各赛区前 15 名进入线下复赛路演。',
  strategy: '优先做一个窄场景、可直接体验的 Agent，而不是泛聊天机器人；提交前准备原始体验链接、Agent 简介、使用方式、头像和源码 ZIP。每组只能提交一份作品，资料提交后会锁定为初赛评测版本。',
  audience: '全球青年创作者与跨界团队；1—4 人组队。手册称“青年”但未在可读取正文中给出具体年龄、国籍或费用条款，报名前应以官方报名页/选手群确认为准。',
  rewards: ['各赛区前 15 名进入线下复赛路演', '官方选手手册未披露统一现金奖金或奖项金额'],
  pros: ['截止很近且规则清晰', '强调人文创意和真实场景', '支持低代码/弱代码 Agent', '北京、上海、新加坡三地联动'],
  cons: ['初赛截止 8 月 10 日 22:00，准备窗口很短', '复赛需要线下路演', '青年年龄边界、奖金和报名费用未在公开手册正文明确', '源码 ZIP 需随作品提交并接受技术测评'],
  winning: ['场景洞察和人文创意', 'Agent 可用性与交付完整度', '静态/动态技术测评', '扩展性和路演表达'],
  timeline: [
    { event: '初赛 Agent 作品提交截止（22:00；时区待主办方确认）', date: '2026-08-10', critical: true },
    { event: '北京、上海赛区线下复赛路演', date: '2026-08-16', critical: true },
    { event: '新加坡赛区线下复赛路演', date: '2026-08-17', critical: true },
  ],
  deadlines: [{ type: 'submission', date: '2026-08-10', certainty: 'confirmed', timezone: 'Asia/Shanghai', label: '初赛 Agent 作品提交截止 22:00（手册未注明时区，暂按北京时间）', primary: true, sourceUrl: handbookUrl }],
  primaryDeadline: { type: 'submission', date: '2026-08-10', certainty: 'confirmed', timezone: 'Asia/Shanghai', label: '初赛 Agent 作品提交截止 22:00（手册未注明时区，暂按北京时间）', primary: true, sourceUrl: handbookUrl },
  eligibility: { scope: 'global-youth', regions: ['全球；北京、上海、新加坡赛区'], chinaEligible: 'yes', fee: 'not-stated', team: '1—4 人组队；青年年龄边界需向主办方确认' },
  prizeBoundary: { cash: [], nonCash: ['各赛区前 15 名进入线下复赛路演'], investment: [], cashStatus: 'not-stated', ip: '源码 ZIP 仅用于技术评测，不提供公开下载；其他作品权利以主办方条款为准' },
  curation: { primaryFormats: ['agent', 'ai-application', 'low-code'], rewardAccessibility: 'medium', rewardEvidence: '官方选手手册明确组队、提交材料、静态/动态测评和晋级名额；奖金未披露。', recommendationPriority: 'high' },
  verification: { status: 'verified', checkedAt: ROUND20_ADDITIONS_CHECKED_AT, sourceKind: 'official', linkHealth: 'reachable', notes: '根据用户提供的 Eazo 官方飞书选手说明书核验：1—4 人组队、初赛提交截止 8 月 10 日 22:00、各赛区前 15 名晋级、北京/上海 8 月 16 日和新加坡 8 月 17 日线下复赛；手册可读取正文未披露具体年龄、奖金和时区，已明确标注。' },
  sources: [{ title: 'Eazo 官方选手说明书（用户提供的飞书文档）', date: ROUND20_ADDITIONS_CHECKED_AT, url: handbookUrl, kind: 'official' }],
  url: handbookUrl,
  recordType: 'competition',
  seriesId: null,
  parentId: null,
}];

export const competitionRound20Additions = normalizeCompetitionCollection(additions, {}, { updatedAt: ROUND20_ADDITIONS_CHECKED_AT });
export default competitionRound20Additions;
