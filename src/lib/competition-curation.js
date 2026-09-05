export const LOW_PRIORITY_MEDIA_FORMATS = Object.freeze(['video', 'music']);

const LOW_PRIORITY_MEDIA_FORMAT_SET = new Set(LOW_PRIORITY_MEDIA_FORMATS);
const ACCESSIBLE_REWARD_LEVELS = new Set(['high']);
const LEGACY_VIDEO_TITLE_PATTERN = /(?:视频|影像|电影|影片|短片|短剧|微短剧|动漫|动画|MV).{0,10}(?:创作|征集|大赛|竞赛|比赛|节)|(?:AI|AIGC).{0,10}(?:电影|影片|短片|短剧|微短剧|MV)|(?:film|cinema|animation).{0,16}(?:contest|competition|festival)|video.{0,8}(?:creation|creator).{0,12}(?:contest|competition|challenge)/i;
const LEGACY_MUSIC_TITLE_PATTERN = /(?:音乐|歌曲|声音|音效|配乐).{0,10}(?:创作|征集|大赛|竞赛|比赛|设计赛|赛)|(?:music|sound design|audio creation).{0,16}(?:contest|competition|challenge)/i;

function inferLegacyPrimaryFormats(competition) {
  const title = [competition?.name, competition?.fullName].filter(Boolean).join(' · ');
  const formats = [];
  if (LEGACY_VIDEO_TITLE_PATTERN.test(title)) formats.push('video');
  if (LEGACY_MUSIC_TITLE_PATTERN.test(title)) formats.push('music');
  return formats;
}

/**
 * Evaluate whether a newly discovered competition fits the radar's editorial
 * intake policy. Existing historical records are kept for reference; this is
 * the gate for future additions and recommendations.
 */
export function evaluateCompetitionIntake(competition) {
  const curation = competition?.curation ?? {};
  const explicitPrimaryFormats = Array.isArray(curation.primaryFormats)
    ? curation.primaryFormats.filter(Boolean)
    : [];
  const primaryFormats = explicitPrimaryFormats.length > 0
    ? explicitPrimaryFormats
    : inferLegacyPrimaryFormats(competition);
  const isMediaOnly = primaryFormats.length > 0
    && primaryFormats.every((format) => LOW_PRIORITY_MEDIA_FORMAT_SET.has(format));

  if (!isMediaOnly) {
    return {
      decision: 'include',
      reasonCode: 'preferred-format',
      reason: '赛事主要交付物不是纯视频或纯音乐作品。',
    };
  }

  const hasAccessibleRewardEvidence = ACCESSIBLE_REWARD_LEVELS.has(curation.rewardAccessibility)
    && typeof curation.rewardEvidence === 'string'
    && curation.rewardEvidence.trim().length > 0;

  if (hasAccessibleRewardEvidence) {
    return {
      decision: 'include',
      reasonCode: 'accessible-reward-exception',
      reason: '虽为视频/音乐类，但官方证据表明奖励覆盖面高、获取门槛相对友好。',
    };
  }

  return {
    decision: 'exclude',
    reasonCode: 'low-priority-media-format',
    reason: '纯视频/纯音乐赛事默认不收录；大奖池或单个高额冠军奖不等于奖励好拿。',
  };
}
