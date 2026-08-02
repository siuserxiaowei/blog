export const COMPETITION_ENTRY_STATUSES = Object.freeze([
  'not-open-yet',
  'open-to-new',
  'registered-only',
  'closed',
  'unknown',
]);

const ENTRY_GATE_TYPES = new Set([
  'registration',
  'application',
  'entry',
  'intent',
]);

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const IANA_TIMEZONE_PATTERN = /[A-Za-z0-9_+-]+(?:\/[A-Za-z0-9_+-]+)+/g;
const TOP_LEVEL_DEADLINE_TYPES = Object.freeze([
  'registration',
  'application',
  'entry',
  'intent',
  'submission',
]);

function isDateOnly(value) {
  if (typeof value !== 'string') return false;
  const match = DATE_ONLY_PATTERN.exec(value);
  if (!match) return false;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return date.getUTCFullYear() === Number(match[1])
    && date.getUTCMonth() === Number(match[2]) - 1
    && date.getUTCDate() === Number(match[3]);
}

function isSupportedTimeZone(value) {
  try {
    new Intl.DateTimeFormat('en', { timeZone: value }).format(0);
    return true;
  } catch {
    return false;
  }
}

function resolveTimeZone(value) {
  if (typeof value !== 'string' || value.trim() === '') return 'UTC';
  const trimmed = value.trim();
  if (isSupportedTimeZone(trimmed)) return trimmed;

  for (const candidate of trimmed.match(IANA_TIMEZONE_PATTERN) ?? []) {
    if (isSupportedTimeZone(candidate)) return candidate;
  }
  return 'UTC';
}

function todayDateKey(today, timezone) {
  if (typeof today === 'string' && isDateOnly(today)) return today;

  const instant = today instanceof Date ? today : new Date(today);
  if (Number.isNaN(instant.getTime())) return null;

  const parts = new Intl.DateTimeFormat('en', {
    timeZone: resolveTimeZone(timezone),
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(instant);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function normalizeLifecycleDeadline(value, type, fallbackTimezone) {
  if (typeof value === 'string') {
    return isDateOnly(value)
      ? { type, date: value, certainty: 'confirmed', timezone: fallbackTimezone ?? null }
      : null;
  }
  if (!value || typeof value !== 'object') return null;

  const date = value.date ?? null;
  const certainty = value.certainty ?? (date ? 'confirmed' : 'unknown');
  if (certainty !== 'confirmed' || !isDateOnly(date)) return null;
  return {
    type: value.type ?? type,
    date,
    certainty,
    timezone: value.timezone ?? fallbackTimezone ?? null,
  };
}

function collectLifecycleDeadlines(record) {
  const fallbackTimezone = record?.deadlineTimezone ?? record?.primaryDeadline?.timezone ?? null;
  const deadlines = [];

  for (const value of Array.isArray(record?.deadlines) ? record.deadlines : []) {
    const normalized = normalizeLifecycleDeadline(value, value?.type, fallbackTimezone);
    if (normalized) deadlines.push(normalized);
  }

  const primary = normalizeLifecycleDeadline(
    record?.primaryDeadline,
    record?.primaryDeadline?.type,
    fallbackTimezone,
  );
  if (primary) deadlines.push(primary);

  for (const type of TOP_LEVEL_DEADLINE_TYPES) {
    const normalized = normalizeLifecycleDeadline(record?.[type], type, fallbackTimezone);
    if (normalized) deadlines.push(normalized);
  }

  const seen = new Set();
  return deadlines.filter((deadline) => {
    const key = [deadline.type, deadline.date, deadline.timezone ?? ''].join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function relationToToday(deadline, today) {
  const todayKey = todayDateKey(today, deadline.timezone);
  if (!todayKey) return null;
  return todayKey.localeCompare(deadline.date);
}

export function getCompetitionEntryStatus(record, today) {
  if (COMPETITION_ENTRY_STATUSES.includes(record?.entryStatus)) return record.entryStatus;
  if (!record || todayDateKey(today, 'UTC') === null) return 'unknown';

  const fallbackTimezone = record.deadlineTimezone ?? record.primaryDeadline?.timezone ?? null;
  const explicitOpening = normalizeLifecycleDeadline(record.opensAt, 'opening', fallbackTimezone);
  const deadlines = collectLifecycleDeadlines(record);
  const openings = [
    ...(explicitOpening ? [explicitOpening] : []),
    ...deadlines.filter((deadline) => deadline.type === 'opening'),
  ];
  const gates = deadlines.filter((deadline) => ENTRY_GATE_TYPES.has(deadline.type));
  const submissions = deadlines.filter((deadline) => deadline.type === 'submission');

  const openingRelations = openings.map((deadline) => relationToToday(deadline, today));
  if (openingRelations.includes(null)) return 'unknown';
  if (openingRelations.some((relation) => relation < 0)) return 'not-open-yet';
  const openingHasStarted = openings.length > 0;

  const gateRelations = gates.map((deadline) => relationToToday(deadline, today));
  const submissionRelations = submissions.map((deadline) => relationToToday(deadline, today));
  if (gateRelations.includes(null) || submissionRelations.includes(null)) return 'unknown';

  if (gates.length > 0) {
    if (gateRelations.every((relation) => relation <= 0)) return 'open-to-new';
    if (submissions.length === 0) return 'closed';
    if (submissionRelations.some((relation) => relation <= 0)) return 'registered-only';
    return 'closed';
  }

  if (submissions.length > 0) {
    if (submissionRelations.every((relation) => relation > 0)) return 'closed';
    return openingHasStarted ? 'open-to-new' : 'unknown';
  }

  return openingHasStarted ? 'open-to-new' : 'unknown';
}
