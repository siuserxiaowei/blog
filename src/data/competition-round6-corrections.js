export const ROUND6_CORRECTIONS_CHECKED_AT = '2026-08-04';

function source(title, url, kind = 'official') {
  return { title, date: ROUND6_CORRECTIONS_CHECKED_AT, url, kind };
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
      checkedAt: ROUND6_CORRECTIONS_CHECKED_AT,
      sourceKind,
      linkHealth,
      notes,
    },
    sources,
  };
}

/**
 * Round-six corrections are applied after the round-five additions have been
 * merged so this sidecar can safely update any earlier record. Every entry
 * contains fresh provenance and verification metadata.
 */
export const competitionRound6Corrections = Object.freeze({
  'mineru-mdic-2026': reviewedPatch({
    entryStatus: 'closed',
    date: '已于 2026-07-19 颁奖结束（浦江生态论坛 / WAIC 期间）',
    deadlineISO: '2026-07-19',
    suit: '本届已结束',
    desc: '上海 AI 实验室与库帕思联合发起的数据智能赛（含 Data Agent 等三大赛道）已于 2026-07-19 在浦江生态论坛 / WAIC 期间颁奖结束，多篇主办方生态微信文章确认；记录保留供回溯，不再可报名。',
    strategy: '本届已结束，勿再投入；关注主办方下一届与模速空间孵化动态。',
    timeline: [{ event: '颁奖结束（浦江生态论坛 / WAIC 期间）', date: '2026-07-19', critical: true }],
    deadlines: [{
      type: 'result',
      date: '2026-07-19',
      certainty: 'confirmed',
      timezone: 'Asia/Shanghai',
      label: '赛事已结束（2026-07-19 颁奖）',
      primary: true,
      sourceUrl: 'https://mineru.net/MDIC2026',
    }],
    primaryDeadline: {
      type: 'result',
      date: '2026-07-19',
      certainty: 'confirmed',
      timezone: 'Asia/Shanghai',
      label: '赛事已结束（2026-07-19 颁奖）',
      sourceUrl: 'https://mineru.net/MDIC2026',
    },
    sources: [
      source('官网｜MinerU MDIC2026', 'https://mineru.net/MDIC2026'),
      source('主办方页｜上海 AI 实验室', 'https://www.shlab.org.cn/event/detail/101'),
    ],
    notes: '本届已于 2026-07-19 在浦江生态论坛 / WAIC 期间颁奖结束（多篇主办方生态微信文章确认）；按既有 status/corrections 模式标记 entryStatus=closed 并保留记录，不删除。',
  }),
});

export default competitionRound6Corrections;
