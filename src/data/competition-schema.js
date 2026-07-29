export const DEADLINE_CERTAINTIES = Object.freeze([
  'confirmed',
  'estimated',
  'rolling',
  'unknown',
]);

export const VERIFICATION_STATUSES = Object.freeze([
  'verified',
  'partially-verified',
  'unverified',
  'stale',
]);

export const RECORD_TYPES = Object.freeze([
  'competition',
  'series',
  'track',
  'program',
]);

const ACTIONABLE_DEADLINE_TYPES = new Set([
  'application',
  'entry',
  'intent',
  'registration',
  'submission',
]);

function isDateOnly(value) {
  if (typeof value !== 'string') return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return date.getFullYear() === Number(match[1])
    && date.getMonth() === Number(match[2]) - 1
    && date.getDate() === Number(match[3]);
}

function normalizedSource(source, fallbackUrl, updatedAt) {
  const url = source?.url ?? fallbackUrl;
  if (!url) return null;
  return {
    title: source?.title || '赛事页面',
    date: source?.date || updatedAt || null,
    url,
    kind: source?.kind || 'reported',
  };
}

export function normalizeDeadline(deadline, fallback = {}) {
  if (typeof deadline === 'string') {
    return {
      type: fallback.type || 'submission',
      date: deadline,
      certainty: fallback.certainty || 'confirmed',
      timezone: fallback.timezone || null,
      label: fallback.label || '截止日期',
      primary: Boolean(fallback.primary),
      sourceUrl: fallback.sourceUrl || null,
    };
  }

  const value = deadline && typeof deadline === 'object' ? deadline : {};
  return {
    type: value.type || fallback.type || 'submission',
    date: value.date ?? fallback.date ?? null,
    certainty: value.certainty || fallback.certainty || (value.date ? 'confirmed' : 'unknown'),
    timezone: value.timezone ?? fallback.timezone ?? null,
    label: value.label || fallback.label || '截止日期',
    primary: Boolean(value.primary ?? fallback.primary),
    sourceUrl: value.sourceUrl ?? fallback.sourceUrl ?? null,
  };
}

export function getPrimaryDeadline(record) {
  if (!record || typeof record !== 'object') return null;

  if (record.primaryDeadline) {
    return normalizeDeadline(record.primaryDeadline, {
      sourceUrl: record.url,
      timezone: record.deadlineTimezone,
    });
  }

  const deadlines = Array.isArray(record.deadlines)
    ? record.deadlines.map((deadline) => normalizeDeadline(deadline, {
      sourceUrl: record.url,
      timezone: record.deadlineTimezone,
    }))
    : [];

  const explicitlyPrimary = deadlines.find((deadline) => deadline.primary);
  if (explicitlyPrimary) return explicitlyPrimary;

  const confirmedActionable = deadlines
    .filter((deadline) => deadline.certainty === 'confirmed'
      && ACTIONABLE_DEADLINE_TYPES.has(deadline.type)
      && isDateOnly(deadline.date))
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  if (confirmedActionable) return confirmedActionable;

  if (deadlines.length > 0) return deadlines[0];

  if (record.deadlineISO) {
    return normalizeDeadline(record.deadlineISO, {
      type: 'submission',
      certainty: 'confirmed',
      label: '截止日期（旧版字段）',
      sourceUrl: record.url,
      timezone: record.deadlineTimezone,
    });
  }

  return normalizeDeadline(null, {
    type: 'submission',
    certainty: 'unknown',
    label: '日期待确认',
    sourceUrl: record.url,
  });
}

export function normalizeCompetitionRecord(record, override = {}, options = {}) {
  const merged = { ...record, ...override };
  const updatedAt = options.updatedAt ?? null;
  const sourceInput = override.sources ?? record.sources ?? (
    merged.url ? [{ title: `赛事页面｜${merged.name || merged.id}`, date: updatedAt, url: merged.url }] : []
  );
  const sources = sourceInput
    .map((source) => normalizedSource(source, merged.url, updatedAt))
    .filter(Boolean);

  let deadlines;
  if (Array.isArray(override.deadlines)) {
    deadlines = override.deadlines.map((deadline) => normalizeDeadline(deadline, {
      sourceUrl: merged.url,
      timezone: merged.deadlineTimezone,
    }));
  } else if (Array.isArray(record.deadlines)) {
    deadlines = record.deadlines.map((deadline) => normalizeDeadline(deadline, {
      sourceUrl: merged.url,
      timezone: merged.deadlineTimezone,
    }));
  } else {
    deadlines = [normalizeDeadline(merged.deadlineISO, {
      type: 'submission',
      certainty: 'confirmed',
      label: '截止日期（旧版字段）',
      sourceUrl: merged.url,
      timezone: merged.deadlineTimezone,
    })];
  }

  const verification = {
    status: 'unverified',
    checkedAt: updatedAt,
    sourceKind: sources.some((source) => source.kind === 'official') ? 'official' : 'reported',
    linkHealth: 'unchecked',
    notes: null,
    ...(record.verification ?? {}),
    ...(override.verification ?? {}),
  };

  const primaryDeadline = normalizeDeadline(
    override.primaryDeadline
      ?? record.primaryDeadline
      ?? deadlines.find((deadline) => deadline.primary)
      ?? getPrimaryDeadline({ ...merged, deadlines, primaryDeadline: null }),
    {
      sourceUrl: merged.url,
      timezone: merged.deadlineTimezone,
    },
  );

  return {
    ...merged,
    sources,
    deadlines,
    primaryDeadline,
    verification,
    recordType: merged.recordType || 'competition',
    seriesId: merged.seriesId ?? null,
    parentId: merged.parentId ?? null,
  };
}

export function normalizeCompetitionCollection(source, overrides = {}, options = {}) {
  return source.map((record) => normalizeCompetitionRecord(
    record,
    overrides instanceof Map ? overrides.get(record.id) : overrides[record.id],
    options,
  ));
}

export function selectCompetitionRecords(source, filters = {}) {
  const {
    recordType,
    seriesId,
    parentId,
    verificationStatus,
    deadlineCertainty,
  } = filters;

  return source.filter((record) => {
    if (recordType && record.recordType !== recordType) return false;
    if (seriesId && record.seriesId !== seriesId) return false;
    if (parentId && record.parentId !== parentId) return false;
    if (verificationStatus && record.verification?.status !== verificationStatus) return false;
    if (deadlineCertainty && getPrimaryDeadline(record)?.certainty !== deadlineCertainty) return false;
    return true;
  });
}

export function validateCompetitionV2(record, index = 0) {
  const errors = [];
  const warnings = [];
  const label = record?.id ? `competition:${record.id}` : `competition[${index}]`;
  const addError = (field, message) => errors.push({ id: record?.id, index, field, message: `${label} ${message}` });
  const addWarning = (field, message) => warnings.push({ id: record?.id, index, field, message: `${label} ${message}` });

  if (!record?.id) addError('id', 'is missing id');
  if (!RECORD_TYPES.includes(record?.recordType)) {
    addError('recordType', `has unsupported recordType "${record?.recordType}"`);
  }
  if (record?.parentId !== null && record?.parentId !== undefined && typeof record.parentId !== 'string') {
    addError('parentId', 'parentId must be a string or null');
  }
  if (record?.seriesId !== null && record?.seriesId !== undefined && typeof record.seriesId !== 'string') {
    addError('seriesId', 'seriesId must be a string or null');
  }
  if (!Array.isArray(record?.deadlines) || record.deadlines.length === 0) {
    addError('deadlines', 'must contain at least one normalized deadline');
  } else {
    record.deadlines.forEach((deadline, deadlineIndex) => {
      if (!DEADLINE_CERTAINTIES.includes(deadline?.certainty)) {
        addError(`deadlines[${deadlineIndex}].certainty`, `has unsupported certainty "${deadline?.certainty}"`);
      }
      if (deadline?.certainty === 'confirmed' && !isDateOnly(deadline?.date)) {
        addError(`deadlines[${deadlineIndex}].date`, 'confirmed deadline must use YYYY-MM-DD');
      }
      if (deadline?.date && !isDateOnly(deadline.date)) {
        addError(`deadlines[${deadlineIndex}].date`, 'deadline date must use YYYY-MM-DD');
      }
      if (deadline?.certainty !== 'confirmed' && deadline?.date) {
        addWarning(`deadlines[${deadlineIndex}].date`, `${deadline.certainty} date must not be used for urgent countdowns`);
      }
    });
  }

  const primary = getPrimaryDeadline(record);
  if (!primary) {
    addError('primaryDeadline', 'is missing primaryDeadline');
  } else if (!DEADLINE_CERTAINTIES.includes(primary.certainty)) {
    addError('primaryDeadline.certainty', `has unsupported certainty "${primary.certainty}"`);
  } else if (primary.certainty === 'confirmed' && !isDateOnly(primary.date)) {
    addError('primaryDeadline.date', 'confirmed primary deadline must use YYYY-MM-DD');
  }

  if (!VERIFICATION_STATUSES.includes(record?.verification?.status)) {
    addError('verification.status', `has unsupported verification status "${record?.verification?.status}"`);
  }
  if (!Array.isArray(record?.sources) || record.sources.length === 0) {
    addError('sources', 'must contain at least one source');
  } else {
    record.sources.forEach((source, sourceIndex) => {
      try {
        const url = new URL(source?.url);
        if (!['http:', 'https:'].includes(url.protocol)) throw new Error('unsupported protocol');
      } catch {
        addError(`sources[${sourceIndex}].url`, 'must be an HTTP(S) URL');
      }
    });
  }

  if (record?.verification?.status === 'verified'
    && record?.verification?.sourceKind !== 'official') {
    addWarning('verification.sourceKind', 'is verified without an official source');
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function validateCompetitionCollectionV2(source) {
  const errors = [];
  const warnings = [];
  const ids = new Set();

  source.forEach((record, index) => {
    const result = validateCompetitionV2(record, index);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
    if (record?.id) {
      if (ids.has(record.id)) {
        errors.push({
          id: record.id,
          index,
          field: 'id',
          message: `competition:${record.id} duplicates an earlier id`,
        });
      }
      ids.add(record.id);
    }
  });

  source.forEach((record, index) => {
    if (record?.parentId && !ids.has(record.parentId)) {
      errors.push({
        id: record.id,
        index,
        field: 'parentId',
        message: `competition:${record.id} references missing parentId "${record.parentId}"`,
      });
    }
  });

  return { valid: errors.length === 0, errors, warnings };
}
