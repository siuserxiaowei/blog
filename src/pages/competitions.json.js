import { competitions, RADAR_UPDATED_AT } from '../data/competitions.js';

export const prerender = true;

const MAX_REWARDS = 12;
const MAX_DEADLINES = 12;
const MAX_TIMELINE_ITEMS = 12;
const MAX_SOURCES = 6;

function publicCompetition(competition, site) {
  const primaryDeadline = competition.primaryDeadline && typeof competition.primaryDeadline === 'object'
    ? competition.primaryDeadline
    : {};
  const verification = competition.verification && typeof competition.verification === 'object'
    ? competition.verification
    : {};
  return {
    id: competition.id,
    name: competition.name,
    fullName: competition.fullName,
    organization: competition.org,
    category: competition.cat,
    tier: competition.tier,
    match: competition.match,
    location: competition.loc,
    dateLabel: competition.date,
    recordType: competition.recordType,
    seriesId: competition.seriesId,
    parentId: competition.parentId,
    deadlineDate: primaryDeadline.date ?? competition.deadlineISO,
    primaryDeadline: {
      type: primaryDeadline.type,
      date: primaryDeadline.date,
      certainty: primaryDeadline.certainty,
      timezone: primaryDeadline.timezone,
      label: primaryDeadline.label,
    },
    deadlines: (competition.deadlines ?? []).slice(0, MAX_DEADLINES).map((deadline) => ({
      type: deadline.type,
      date: deadline.date,
      certainty: deadline.certainty,
      timezone: deadline.timezone,
      label: deadline.label,
      primary: Boolean(deadline.primary),
    })),
    verification: {
      status: verification.status,
      checkedAt: verification.checkedAt,
      sourceKind: verification.sourceKind,
      linkHealth: verification.linkHealth,
      notes: verification.notes,
    },
    description: competition.desc,
    audience: competition.audience,
    rewards: competition.rewards.slice(0, MAX_REWARDS),
    timeline: competition.timeline.slice(0, MAX_TIMELINE_ITEMS).map((item) => ({
      event: item.event,
      date: item.date,
      critical: Boolean(item.critical),
    })),
    detailUrl: new URL(`/competitions/${encodeURIComponent(competition.id)}/`, site).toString(),
    actionUrl: competition.url,
    sources: (competition.sources ?? []).slice(0, MAX_SOURCES).map((source) => ({
      title: source.title,
      date: source.date,
      url: source.url,
    })),
  };
}

export function GET({ site }) {
  const body = {
    schemaVersion: '2.0',
    title: 'siuser小伟 · AI 产品赛事雷达',
    updatedAt: RADAR_UPDATED_AT,
    count: competitions.length,
    items: competitions.map((competition) => publicCompetition(competition, site)),
  };

  return new Response(`${JSON.stringify(body, null, 2)}\n`, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600',
      'Access-Control-Allow-Origin': '*',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
