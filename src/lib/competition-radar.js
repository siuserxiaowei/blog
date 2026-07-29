const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const CONFIRMED_STATES = new Set(['confirmed', 'verified', 'legacy']);

function firstText(...values) {
  return values.find((value) => typeof value === 'string' && value.trim())?.trim() || '';
}

export function normalizeDateOnly(value) {
  const match = DATE_ONLY_RE.exec(typeof value === 'string' ? value.trim() : '');
  if (!match) return '';

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const candidate = new Date(Date.UTC(year, month - 1, day));
  if (
    candidate.getUTCFullYear() !== year
    || candidate.getUTCMonth() !== month - 1
    || candidate.getUTCDate() !== day
  ) return '';

  return `${match[1]}-${match[2]}-${match[3]}`;
}

export function getCompetitionDeadlineInfo(competition = {}) {
  const primary = competition.primaryDeadline;
  const primaryObject = primary && typeof primary === 'object' ? primary : {};
  const verificationValue = competition.verification;
  const verification = verificationValue && typeof verificationValue === 'object'
    ? competition.verification
    : {};

  const date = normalizeDateOnly(firstText(
    typeof primary === 'string' ? primary : '',
    primaryObject.date,
    primaryObject.value,
    primaryObject.iso,
    primaryObject.isoDate,
    primaryObject.deadlineISO,
    competition.deadlineISO,
  ));

  const rawConfidence = firstText(
    primaryObject.certainty,
    primaryObject.confidence,
    primaryObject.status,
    typeof verificationValue === 'string' ? verificationValue : '',
    verification.status,
    verification.confidence,
    verification.kind,
    verification.level,
    primary ? 'confirmed' : 'legacy',
  ).toLowerCase();

  const confidence = rawConfidence === 'verified' ? 'confirmed' : rawConfidence;
  return {
    date,
    confidence: confidence || 'unverified',
    type: firstText(primaryObject.type, 'deadline'),
    label: firstText(primaryObject.label, '关键截止'),
    calendarEligible: Boolean(date && CONFIRMED_STATES.has(rawConfidence)),
  };
}

function addOneUtcDay(dateOnly) {
  const [year, month, day] = dateOnly.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + 1));
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
    String(date.getUTCDate()).padStart(2, '0'),
  ].join('-');
}

function compactDate(dateOnly) {
  return dateOnly.replaceAll('-', '');
}

function escapeIcsText(value) {
  return String(value ?? '')
    .replaceAll('\\', '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replaceAll(';', '\\;')
    .replaceAll(',', '\\,');
}

function foldIcsLine(line) {
  const encoder = new TextEncoder();
  const chunks = [];
  let chunk = '';

  for (const character of String(line)) {
    const candidate = chunk + character;
    if (chunk && encoder.encode(candidate).length > 73) {
      chunks.push(chunk);
      chunk = character;
    } else {
      chunk = candidate;
    }
  }
  if (chunk || !chunks.length) chunks.push(chunk);
  return chunks.join('\r\n ');
}

function utcStamp(value = new Date()) {
  return value.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

export function buildCompetitionDeadlineIcs(competition, options = {}) {
  const deadline = getCompetitionDeadlineInfo(competition);
  if (!deadline.calendarEligible) {
    throw new Error('Competition deadline is not confirmed for calendar export.');
  }

  const id = firstText(competition.id, 'competition').replace(/[^a-zA-Z0-9._-]/g, '-');
  const name = firstText(competition.fullName, competition.name, '赛事');
  const deadlineLabel = firstText(deadline.label, '关键截止');
  const siteOrigin = firstText(options.siteOrigin, 'https://siuserxiaowei.com').replace(/\/$/, '');
  const detailUrl = `${siteOrigin}/competitions/#${encodeURIComponent(firstText(competition.id, id))}`;
  const officialUrl = firstText(competition.url);
  const description = [
    firstText(competition.strategy),
    officialUrl ? `赛事页面：${officialUrl}` : '',
    `由赛事雷达人工整理，请在提交前复核主办方最新规则。`,
  ].filter(Boolean).join('\n');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//siuserxiaowei.com//Competition Radar//ZH-CN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:competition-${id}@siuserxiaowei.com`,
    `DTSTAMP:${utcStamp(options.now)}`,
    `DTSTART;VALUE=DATE:${compactDate(deadline.date)}`,
    `DTEND;VALUE=DATE:${compactDate(addOneUtcDay(deadline.date))}`,
    `SUMMARY:${escapeIcsText(`${deadlineLabel}｜${name}`)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    `URL:${escapeIcsText(officialUrl || detailUrl)}`,
    competition.loc ? `LOCATION:${escapeIcsText(competition.loc)}` : '',
    'STATUS:CONFIRMED',
    'TRANSP:TRANSPARENT',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).map(foldIcsLine);

  return `${lines.join('\r\n')}\r\n`;
}

export function competitionCalendarFilename(competition = {}) {
  const base = firstText(competition.name, competition.id, 'competition-deadline')
    .normalize('NFKC')
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
  return `${base || 'competition-deadline'}.ics`;
}
