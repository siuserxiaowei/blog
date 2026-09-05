export const ROUND17_CORRECTIONS_CHECKED_AT = '2026-08-09';

const bundUrl = 'https://hackathon2026.app.weavefox.cn/';
const bundConferenceUrl = 'https://www.inclusionconf.com/';
const bundQoderUrl = 'https://modelscope.cn/events/330/summary';

export const competitionRound17Corrections = Object.freeze({
  bund: {
    verification: {
      status: 'verified',
      checkedAt: ROUND17_CORRECTIONS_CHECKED_AT,
      sourceKind: 'official',
      linkHealth: 'reachable',
      notes: '外滩黑客松主活动与 ModelScope 记录 330 的 Qoder 赛道属于同一赛事，不另建重复条目；作品提交截止仍为 2026-08-09。',
    },
    sources: [
      { title: '外滩黑客松 2026 官方报名页', date: ROUND17_CORRECTIONS_CHECKED_AT, url: bundUrl, kind: 'official' },
      { title: 'Inclusion 外滩大会 2026 官方', date: ROUND17_CORRECTIONS_CHECKED_AT, url: bundConferenceUrl, kind: 'official' },
      { title: 'ModelScope 官方｜外滩黑客松 AI Coding 大赛 × Qoder 赛道', date: ROUND17_CORRECTIONS_CHECKED_AT, url: bundQoderUrl, kind: 'official' },
    ],
  },
});

export default competitionRound17Corrections;
