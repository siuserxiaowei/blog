export const ROUND12_CORRECTIONS_CHECKED_AT = '2026-08-06';

const competitionUrl = 'https://cvmart.net/cv_landing/list/wuhu2026';
const articleUrl = 'https://mp.weixin.qq.com/s/5CYFEmBR3KkA6yJDD5_r-w';

export const competitionRound12Corrections = Object.freeze({
  'wuhu-compute-algorithm-2026': {
    cons: ['报名截止仍为 estimated（8 月底）', '决赛须赴芜湖线下'],
    verification: {
      status: 'partially-verified',
      checkedAt: ROUND12_CORRECTIONS_CHECKED_AT,
      sourceKind: 'official',
      linkHealth: 'reachable',
      notes: '承办平台、媒体报道与 2026-08-06 AINLP 微信文章交叉核验。微信文章确认 8 月初赛、9 月复赛、10 月中芜湖决赛及 50 万元奖金，但未披露报名截止日；因此主截止仍保守记为 estimated（8 月底），不能升级为 confirmed。',
    },
    sources: [
      {
        title: '承办平台｜极视角芜湖赛页（2026-08-05 核验）',
        date: '2026-08-05',
        url: competitionUrl,
        kind: 'official',
      },
      {
        title: '报道｜千龙网 2026-08-03（2026-08-05 核验）',
        date: '2026-08-05',
        url: 'https://china.qianlong.com/2026/0803/8706797.shtml',
        kind: 'reported',
      },
      {
        title: 'AINLP 微信文章｜50 万赏金，我的 Agent 终于可以赚钱了...',
        date: ROUND12_CORRECTIONS_CHECKED_AT,
        url: articleUrl,
        kind: 'reported',
      },
    ],
  },
});

export default competitionRound12Corrections;
