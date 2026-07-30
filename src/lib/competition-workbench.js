const ABORT_KEY = '__competitionRadarWorkbenchAbort';
const FAVORITE_STORAGE_KEY = 'competition-radar:favorites:v1';
const FAVORITE_STORAGE_VERSION = 1;
const DAY_MS = 86400000;
const TIER_RANK = { S: 3, A: 2, B: 1 };
const STATUS_RANK = { urgent: 0, ongoing: 1, upcoming: 2, expired: 3, unknown: 4 };
const SOFTWARE_RANK = {
  'AI 软件': 0,
  '开源开发': 1,
  '数据算法': 2,
  '安全攻防': 3,
  '游戏创作': 4,
  '创意 AI': 5,
  '创业路演': 6,
  '学生限定': 8,
  '地区限定': 9,
};
const SOFTWARE_CATEGORIES = new Set([
  'AI 软件',
  '开源开发',
  '数据算法',
  '安全攻防',
  '游戏创作',
  '创意 AI',
  '创业路演',
]);
const VALID_SORTS = new Set(['software-first', 'urgent-first', 'match-desc', 'deadline-asc', 'tier-desc']);
const VALID_STATUSES = new Set(['全部', 'urgent', 'ongoing', 'upcoming', 'expired']);
const VALID_TIERS = new Set(['全部', 'S', 'A', 'B']);

function parseRecords() {
  const dataElement = document.getElementById('competition-data');
  if (!dataElement) return [];
  try {
    const value = JSON.parse(dataElement.textContent || '[]');
    return Array.isArray(value) ? value.filter(record => record && typeof record.id === 'string') : [];
  } catch (error) {
    console.error('赛事工作台数据无法解析。', error);
    return [];
  }
}

function statusForDeadline(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
  if (!match) return { kind: 'unknown', days: null, label: '日期待确认' };
  const deadline = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.ceil((deadline.getTime() - today.getTime()) / DAY_MS);
  if (days < 0) return { kind: 'expired', days, label: '已截止' };
  if (days <= 14) return { kind: 'urgent', days, label: days === 0 ? '今天截止' : `${days} 天后截止` };
  if (days <= 60) return { kind: 'ongoing', days, label: `${days} 天后截止` };
  return { kind: 'upcoming', days, label: `${days} 天后` };
}

function updateStatusDot(dot, kind) {
  if (!dot) return;
  dot.classList.remove('status-urgent', 'status-ongoing', 'status-upcoming', 'status-expired', 'status-unknown');
  dot.classList.add(`status-${STATUS_RANK[kind] === undefined ? 'unknown' : kind}`);
}

function getAddressId() {
  const params = new URLSearchParams(window.location.search);
  const queryId = params.get('competition') || params.get('event');
  let hashId = '';
  try {
    hashId = window.location.hash ? decodeURIComponent(window.location.hash.slice(1)) : '';
  } catch {
    hashId = window.location.hash.slice(1);
  }
  return queryId || hashId || '';
}

function readFavoriteIds(validIds) {
  try {
    const parsed = JSON.parse(localStorage.getItem(FAVORITE_STORAGE_KEY) || 'null');
    if (
      !parsed
      || parsed.version !== FAVORITE_STORAGE_VERSION
      || !Array.isArray(parsed.ids)
    ) {
      if (parsed !== null) localStorage.removeItem(FAVORITE_STORAGE_KEY);
      return new Set();
    }
    return new Set(parsed.ids.filter(id => typeof id === 'string' && validIds.has(id)));
  } catch {
    localStorage.removeItem(FAVORITE_STORAGE_KEY);
    return new Set();
  }
}

function writeFavoriteIds(ids) {
  try {
    localStorage.setItem(FAVORITE_STORAGE_KEY, JSON.stringify({
      version: FAVORITE_STORAGE_VERSION,
      ids: Array.from(ids).sort(),
    }));
  } catch {
    // Storage can be unavailable in private browsing. The in-memory set still works.
  }
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

function compactDate(value) {
  return value.replaceAll('-', '');
}

function nextDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + 1));
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
    String(date.getUTCDate()).padStart(2, '0'),
  ].join('-');
}

function safeHttpUrl(value, fallback = '') {
  try {
    const url = new URL(String(value || ''), window.location.origin);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : fallback;
  } catch {
    return fallback;
  }
}

function buildCalendar(record) {
  const deadline = record.deadline || '';
  if (record.calendarEligible !== true || !/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
    throw new Error('Competition deadline is not confirmed for calendar export.');
  }
  const id = (record.id || 'competition').replace(/[^a-zA-Z0-9._-]/g, '-');
  const name = record.fullName || record.name || '赛事';
  const officialUrl = safeHttpUrl(record.url, `${window.location.origin}/competitions/${encodeURIComponent(id)}/`);
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//siuserxiaowei.com//Competition Radar//ZH-CN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:competition-${id}@siuserxiaowei.com`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${compactDate(deadline)}`,
    `DTEND;VALUE=DATE:${compactDate(nextDate(deadline))}`,
    `SUMMARY:${escapeIcsText(`${record.deadlineLabel || '关键截止'}｜${name}`)}`,
    `DESCRIPTION:${escapeIcsText([
      record.strategy || '',
      `赛事页面：${officialUrl}`,
      '由赛事雷达人工整理，请在提交前复核主办方最新规则。',
    ].filter(Boolean).join('\n'))}`,
    `URL:${escapeIcsText(officialUrl)}`,
    record.loc ? `LOCATION:${escapeIcsText(record.loc)}` : '',
    'STATUS:CONFIRMED',
    'TRANSP:TRANSPARENT',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).map(foldIcsLine);
  return `${lines.join('\r\n')}\r\n`;
}

function createTextElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  element.textContent = String(text ?? '');
  return element;
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = String(value ?? '');
}

function replaceChips(id, values, className) {
  const container = document.getElementById(id);
  if (!container) return;
  container.replaceChildren(...(Array.isArray(values) ? values : []).map(value => (
    createTextElement('span', className, value)
  )));
}

function replacePoints(id, values, tone) {
  const container = document.getElementById(id);
  if (!container) return;
  container.replaceChildren(...(Array.isArray(values) ? values : []).map(value => {
    const item = document.createElement('li');
    item.className = `detail-point detail-point-${tone}`;
    const bullet = createTextElement('span', 'detail-point-bullet', '●');
    bullet.setAttribute('aria-hidden', 'true');
    item.append(bullet, createTextElement('span', '', value));
    return item;
  }));
}

function replaceTimeline(record) {
  const container = document.getElementById('detail-timeline');
  if (!container) return;
  const timeline = Array.isArray(record.timeline) && record.timeline.length
    ? record.timeline
    : [{ event: record.deadlineLabel || '关键截止', date: record.deadline || '', critical: true }];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  container.style.setProperty('--timeline-count', String(timeline.length));
  container.style.gridTemplateColumns = `repeat(${timeline.length}, minmax(0, 1fr))`;
  container.replaceChildren(...timeline.map(node => {
    const item = document.createElement('div');
    item.className = 'flex flex-col items-center text-center min-w-0 px-1';
    const nodeDate = /^\d{4}-\d{2}-\d{2}$/.test(node.date || '')
      ? new Date(`${node.date}T00:00:00`)
      : null;
    const dot = document.createElement('div');
    dot.className = `timeline-dot ${nodeDate && nodeDate < today ? 'past' : node.critical ? 'critical' : 'normal'}`;
    const event = createTextElement('p', 'mt-3 mb-1 text-[11px] font-medium leading-tight', node.event);
    event.style.color = node.critical && (!nodeDate || nodeDate >= today) ? 'var(--text)' : 'var(--text-secondary)';
    event.style.maxWidth = '100%';
    const date = createTextElement('small', 'text-[10px]', node.date);
    date.style.color = 'var(--text-secondary)';
    date.style.opacity = '0.6';
    date.style.fontFamily = 'var(--font-mono)';
    item.append(dot, event, date);
    return item;
  }));
}

function replaceSources(record) {
  const container = document.getElementById('detail-sources');
  if (!container) return;
  const label = createTextElement('span', 'section-kicker source-label', '// 参考来源');
  const links = (Array.isArray(record.sources) ? record.sources : []).flatMap(source => {
    const href = safeHttpUrl(source.url);
    if (!href) return [];
    const link = document.createElement('a');
    link.href = href;
    link.target = '_blank';
    link.rel = 'noopener';
    link.className = 'source-link';
    link.append(
      createTextElement('span', '', source.title || '参考来源'),
      createTextElement('small', '', source.date || ''),
    );
    return [link];
  });
  container.replaceChildren(label, ...links);
  container.hidden = links.length === 0;
}

function initCompetitionRadar() {
  window[ABORT_KEY]?.abort();
  const controller = new AbortController();
  window[ABORT_KEY] = controller;
  const { signal } = controller;

  const records = parseRecords();
  const list = document.getElementById('competition-list');
  const items = Array.from(document.querySelectorAll('.cp-list-item[data-id]'));
  if (!records.length || !list || !items.length) return;

  const itemById = new Map(items.map(item => [item.dataset.id || '', item]));
  const recordsById = new Map(records.map(record => [record.id, record]));
  const validIds = new Set(recordsById.keys());
  const categoryValues = new Set(['全部', ...records.map(record => record.cat).filter(Boolean)]);
  const favorites = readFavoriteIds(validIds);

  records.forEach(record => {
    record.status = statusForDeadline(record.deadline);
    record.searchText = [
      record.name,
      record.fullName,
      record.cat,
      record.tier,
      record.status.label,
      record.desc,
      record.strategy,
      record.org,
      record.loc,
      ...(Array.isArray(record.winning) ? record.winning : []),
      ...(Array.isArray(record.sources) ? record.sources.map(source => source.title) : []),
    ].filter(Boolean).join(' ').toLocaleLowerCase();
    const item = itemById.get(record.id);
    if (!item) return;
    item.dataset.status = record.status.kind;
    item.querySelector('[data-status-label]')?.replaceChildren(record.status.label);
    updateStatusDot(item.querySelector('.status-dot'), record.status.kind);
  });

  const countElement = document.getElementById('list-count');
  const searchElement = document.getElementById('radar-search');
  const statusElement = document.getElementById('radar-status');
  const sortElement = document.getElementById('radar-sort');
  const favoritesOnlyElement = document.getElementById('favorites-only');
  const clearFavoritesElement = document.getElementById('clear-favorites');
  const favoriteCountElement = document.getElementById('favorite-count');
  const clearFiltersElement = document.getElementById('clear-filters');
  const emptyElement = document.getElementById('competition-empty');
  const announcerElement = document.getElementById('radar-announcer');
  const detailSection = document.getElementById('competition-detail');
  const detailWorkbench = document.getElementById('detail-workbench');
  const detailPanel = document.getElementById('detail-panel');
  const detailFavorite = document.getElementById('detail-favorite');
  const detailExport = document.getElementById('detail-export-ics');
  const detailCopy = document.getElementById('detail-copy-summary');

  const params = new URLSearchParams(window.location.search);
  const defaultRecord = records.slice().sort((a, b) =>
    (a.status.kind === 'expired' ? 1 : 0) - (b.status.kind === 'expired' ? 1 : 0)
    || (SOFTWARE_RANK[a.cat] ?? 7) - (SOFTWARE_RANK[b.cat] ?? 7)
    || (STATUS_RANK[a.status.kind] ?? 9) - (STATUS_RANK[b.status.kind] ?? 9)
    || Date.parse(a.deadline || '9999-12-31') - Date.parse(b.deadline || '9999-12-31')
  )[0] || records[0];
  const initialId = getAddressId();
  const state = {
    cat: categoryValues.has(params.get('cat') || '') ? params.get('cat') : '全部',
    tier: VALID_TIERS.has(params.get('tier') || '') ? params.get('tier') : '全部',
    status: VALID_STATUSES.has(params.get('status') || '') ? params.get('status') : '全部',
    search: params.get('q') || '',
    sort: VALID_SORTS.has(params.get('sort') || '') ? params.get('sort') : 'software-first',
    favoritesOnly: params.get('saved') === '1',
    selectedId: validIds.has(initialId) ? initialId : defaultRecord.id,
  };

  function announce(message) {
    if (!announcerElement) return;
    announcerElement.textContent = '';
    window.requestAnimationFrame(() => {
      announcerElement.textContent = message;
    });
  }

  function writeAddress(mode = 'replace') {
    const url = new URL(window.location.href);
    const query = state.search.trim();
    if (query) url.searchParams.set('q', query);
    else url.searchParams.delete('q');
    if (state.cat !== '全部') url.searchParams.set('cat', state.cat);
    else url.searchParams.delete('cat');
    if (state.tier !== '全部') url.searchParams.set('tier', state.tier);
    else url.searchParams.delete('tier');
    if (state.status !== '全部') url.searchParams.set('status', state.status);
    else url.searchParams.delete('status');
    if (state.sort !== 'software-first') url.searchParams.set('sort', state.sort);
    else url.searchParams.delete('sort');
    if (state.favoritesOnly) url.searchParams.set('saved', '1');
    else url.searchParams.delete('saved');
    url.searchParams.delete('competition');
    url.searchParams.delete('event');
    url.hash = state.selectedId ? encodeURIComponent(state.selectedId) : '';
    window.history[mode === 'push' ? 'pushState' : 'replaceState']({}, '', url);
  }

  function setChipState(selector, dataName, value) {
    document.querySelectorAll(selector).forEach(button => {
      const active = button.dataset[dataName] === value;
      button.classList.toggle('is-on', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function syncControls() {
    if (searchElement) searchElement.value = state.search;
    if (statusElement) statusElement.value = state.status;
    if (sortElement) sortElement.value = state.sort;
    setChipState('.filter-cat', 'fcat', state.cat);
    setChipState('.filter-tier', 'ftier', state.tier);
    favoritesOnlyElement?.classList.toggle('is-on', state.favoritesOnly);
    favoritesOnlyElement?.setAttribute('aria-pressed', state.favoritesOnly ? 'true' : 'false');
  }

  function syncFavorites() {
    document.querySelectorAll('[data-favorite]').forEach(button => {
      const id = button.dataset.favorite || '';
      const isFavorite = favorites.has(id);
      button.setAttribute('aria-pressed', isFavorite ? 'true' : 'false');
      button.querySelector('[aria-hidden="true"]')?.replaceChildren(isFavorite ? '★' : '☆');
      button.querySelector('[data-favorite-label]')?.replaceChildren(isFavorite ? '已收藏' : '收藏');
      const record = recordsById.get(id);
      button.setAttribute('aria-label', `${isFavorite ? '取消收藏' : '收藏'} ${record?.fullName || record?.name || '赛事'}`);
    });
    if (favoriteCountElement) favoriteCountElement.textContent = String(favorites.size);
    if (clearFavoritesElement) clearFavoritesElement.disabled = favorites.size === 0;
  }

  function toggleFavorite(id) {
    if (!validIds.has(id)) return;
    if (favorites.has(id)) favorites.delete(id);
    else favorites.add(id);
    writeFavoriteIds(favorites);
    syncFavorites();
    if (state.favoritesOnly) applyFilter({ address: 'replace' });
    announce(`${recordsById.get(id)?.name || '赛事'}${favorites.has(id) ? '已收藏' : '已取消收藏'}，当前共 ${favorites.size} 条收藏。`);
  }

  function renderDetail(record) {
    if (!record) return;
    detailSection?.setAttribute('aria-busy', 'true');
    setText('detail-title', record.fullName || record.name);
    setText('detail-status', record.status.label);
    setText('detail-reliability', `来源等级 ${record.rel || '—'}`);
    setText('detail-category', record.cat || '未分类');
    setText('detail-location', record.loc || '—');
    setText('detail-date', record.date || record.deadline || '—');
    setText('detail-org', record.org || '—');
    setText('detail-match', Number(record.match || 0).toFixed(1));
    setText('detail-suit', record.suit || '—');
    setText('detail-description', record.desc || '');
    setText('detail-strategy', record.strategy || '');
    setText('detail-audience', record.audience || '');

    const tier = document.getElementById('detail-tier');
    if (tier) {
      tier.classList.remove('tier-S', 'tier-A', 'tier-B');
      tier.classList.add(`tier-${VALID_TIERS.has(record.tier) && record.tier !== '全部' ? record.tier : 'B'}`);
      tier.textContent = `${record.tier || '—'} 级`;
    }
    updateStatusDot(document.getElementById('detail-status-dot'), record.status.kind);
    replaceTimeline(record);
    replaceChips('detail-rewards', record.rewards, 'reward-chip');
    replaceChips('detail-winning', record.winning, 'winning-chip');
    replacePoints('detail-pros', record.pros, 'pro');
    replacePoints('detail-cons', record.cons, 'con');
    replaceSources(record);

    const permalink = document.getElementById('detail-permalink');
    if (permalink) permalink.href = `/competitions/${encodeURIComponent(record.id)}/`;
    const official = document.getElementById('detail-official-link');
    if (official) {
      const href = safeHttpUrl(record.url);
      official.href = href || `/competitions/${encodeURIComponent(record.id)}/`;
      official.textContent = href ? '查看赛事页面 →' : '查看独立详情页 →';
    }
    if (detailFavorite) detailFavorite.dataset.favorite = record.id;
    if (detailCopy) detailCopy.dataset.copySummary = record.id;
    if (detailExport) {
      detailExport.dataset.exportIcs = record.id;
      detailExport.disabled = record.calendarEligible !== true;
      detailExport.title = detailExport.disabled
        ? '日期尚未确认，暂不提供日历'
        : '下载关键截止日历';
    }
    syncFavorites();
    detailSection?.setAttribute('aria-busy', 'false');
  }

  function compareRecords(a, b) {
    const matchA = Number(a.match || 0);
    const matchB = Number(b.match || 0);
    const deadlineA = Date.parse(a.deadline || '9999-12-31');
    const deadlineB = Date.parse(b.deadline || '9999-12-31');
    if (state.sort === 'software-first') {
      return (a.status.kind === 'expired' ? 1 : 0) - (b.status.kind === 'expired' ? 1 : 0)
        || (SOFTWARE_RANK[a.cat] ?? 7) - (SOFTWARE_RANK[b.cat] ?? 7)
        || (STATUS_RANK[a.status.kind] ?? 9) - (STATUS_RANK[b.status.kind] ?? 9)
        || deadlineA - deadlineB
        || matchB - matchA;
    }
    if (state.sort === 'urgent-first') {
      return (STATUS_RANK[a.status.kind] ?? 9) - (STATUS_RANK[b.status.kind] ?? 9)
        || deadlineA - deadlineB
        || matchB - matchA;
    }
    if (state.sort === 'deadline-asc') return deadlineA - deadlineB || matchB - matchA;
    if (state.sort === 'tier-desc') {
      return (TIER_RANK[b.tier] ?? 0) - (TIER_RANK[a.tier] ?? 0) || matchB - matchA;
    }
    return matchB - matchA || deadlineA - deadlineB;
  }

  function applySelect(options = {}) {
    const record = recordsById.get(state.selectedId);
    items.forEach(item => {
      const active = item.dataset.id === state.selectedId;
      item.classList.toggle('is-active', active);
      item.querySelector('[data-select-competition]')?.setAttribute('aria-current', active ? 'true' : 'false');
    });
    detailWorkbench?.classList.toggle('hidden', !record);
    detailPanel?.classList.toggle('hidden', !record);
    if (!record) return;
    renderDetail(record);
    if (options.address) writeAddress(options.address);
    if (options.scroll) {
      detailSection?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start',
      });
    }
  }

  function applyFilter(options = {}) {
    const query = state.search.trim().toLocaleLowerCase();
    let visible = 0;
    records.forEach(record => {
      const matches =
        (state.cat === '全部' || record.cat === state.cat)
        && (state.tier === '全部' || record.tier === state.tier)
        && (state.status === '全部' || record.status.kind === state.status)
        && (!state.favoritesOnly || favorites.has(record.id))
        && (!query || record.searchText.includes(query));
      itemById.get(record.id)?.classList.toggle('hidden', !matches);
      if (matches) visible++;
    });
    const orderedRecords = records.slice().sort(compareRecords);
    orderedRecords.forEach(record => {
      const item = itemById.get(record.id);
      if (item) list.append(item);
    });
    if (countElement) countElement.textContent = `${visible} items`;
    emptyElement?.classList.toggle('hidden', visible !== 0);

    const currentItem = itemById.get(state.selectedId);
    if (!currentItem || currentItem.classList.contains('hidden')) {
      state.selectedId = orderedRecords.find(record => (
        !itemById.get(record.id)?.classList.contains('hidden')
      ))?.id || '';
      const address = options.preserveAddress ? 'replace' : (options.address || 'replace');
      applySelect({ address: state.selectedId ? address : '' });
      if (!state.selectedId) writeAddress(address);
    } else {
      applySelect({ address: options.preserveAddress ? '' : options.address, scroll: options.scroll });
    }
    announce(visible ? `已显示 ${visible} 条赛事。` : '没有符合当前条件的赛事。');
  }

  function resetFilters(options = {}) {
    state.cat = '全部';
    state.tier = '全部';
    state.status = '全部';
    state.search = '';
    state.sort = 'software-first';
    state.favoritesOnly = false;
    syncControls();
    applyFilter({ address: options.address || 'push' });
    searchElement?.focus({ preventScroll: true });
  }

  function syncStateFromAddress() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = getAddressId();
    state.search = urlParams.get('q') || '';
    state.cat = categoryValues.has(urlParams.get('cat') || '') ? urlParams.get('cat') : '全部';
    state.tier = VALID_TIERS.has(urlParams.get('tier') || '') ? urlParams.get('tier') : '全部';
    state.status = VALID_STATUSES.has(urlParams.get('status') || '') ? urlParams.get('status') : '全部';
    state.sort = VALID_SORTS.has(urlParams.get('sort') || '') ? urlParams.get('sort') : 'software-first';
    state.favoritesOnly = urlParams.get('saved') === '1';
    if (validIds.has(id)) state.selectedId = id;
    syncControls();
    applyFilter({ preserveAddress: true });
  }

  async function copySummary(id, button) {
    const record = recordsById.get(id) || recordsById.get(state.selectedId);
    if (!record) return;
    const summary = [
      `赛事：${record.fullName || record.name || ''}`,
      `截止时间：${record.deadline || ''}`,
      `参赛打法：${record.strategy || ''}`,
      `赛事页面：${safeHttpUrl(record.url) || ''}`,
      record.sources?.length
        ? `参考来源：${record.sources.map(source => `${source.title} ${source.date} ${safeHttpUrl(source.url)}`).join(' | ')}`
        : '',
      '说明：赛事雷达人工整理，请在提交前复核赛事页面的资格、日期与奖励。',
    ].filter(Boolean).join('\n');
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(summary);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = summary;
        textarea.readOnly = true;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.append(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      }
      button.textContent = '已复制';
      button.classList.add('is-copied');
      window.setTimeout(() => {
        if (signal.aborted) return;
        button.textContent = '复制参赛摘要';
        button.classList.remove('is-copied');
      }, 1400);
    } catch {
      button.textContent = '复制失败';
      window.setTimeout(() => {
        if (!signal.aborted) button.textContent = '复制参赛摘要';
      }, 1400);
    }
  }

  function downloadCalendar(id, button) {
    const record = recordsById.get(id);
    if (!record) return;
    try {
      const calendar = buildCalendar(record);
      const blobUrl = URL.createObjectURL(new Blob([calendar], { type: 'text/calendar;charset=utf-8' }));
      const link = document.createElement('a');
      const baseName = (record.name || id || 'competition-deadline')
        .normalize('NFKC')
        .replace(/[\\/:*?"<>|]+/g, '-')
        .replace(/\s+/g, '-')
        .slice(0, 80);
      link.href = blobUrl;
      link.download = `${baseName || 'competition-deadline'}.ics`;
      link.hidden = true;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 0);
      announce(`已下载 ${record.name || '赛事'} 的关键截止日历。`);
      button.textContent = '已下载';
      window.setTimeout(() => {
        if (!signal.aborted) button.textContent = '加入日历';
      }, 1400);
    } catch {
      announce('该赛事日期尚未确认，暂时不能导出日历。');
    }
  }

  function refreshSummary() {
    const urgent = records.filter(record => record.status.kind === 'urgent')
      .sort((a, b) => a.status.days - b.status.days);
    const active = records.filter(record => record.status.kind !== 'expired');
    setText('metric-urgent', urgent.length);
    setText('metric-active', active.length);
    setText('metric-software', active.filter(record => SOFTWARE_CATEGORIES.has(record.cat)).length);
    const urgentList = document.getElementById('urgent-list');
    const urgentEmpty = document.getElementById('urgent-empty');
    if (!urgentList) return;
    urgentList.replaceChildren(...urgent.map(record => {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.jump = record.id;
      button.className = 'urgent-chip group';
      button.setAttribute('aria-label', `查看 ${record.name || '赛事'}，${record.status.label}`);
      button.append(
        createTextElement('span', 'flex-1 text-sm font-medium truncate', record.name),
        createTextElement('span', 'urgent-badge', record.status.days === 0 ? '今天' : `${record.status.days}d`),
      );
      item.append(button);
      return item;
    }));
    urgentList.classList.toggle('hidden', urgent.length === 0);
    urgentEmpty?.classList.toggle('hidden', urgent.length > 0);
  }

  items.forEach(item => {
    item.querySelector('[data-select-competition]')?.addEventListener('click', event => {
      event.preventDefault();
      state.selectedId = item.dataset.id || '';
      applySelect({ address: 'push', scroll: window.innerWidth < 1024 });
    }, { signal });
  });

  document.querySelectorAll('.filter-cat').forEach(button => {
    button.addEventListener('click', () => {
      state.cat = button.dataset.fcat || '全部';
      setChipState('.filter-cat', 'fcat', state.cat);
      applyFilter({ address: 'push' });
    }, { signal });
  });
  document.querySelectorAll('.filter-tier').forEach(button => {
    button.addEventListener('click', () => {
      state.tier = button.dataset.ftier || '全部';
      setChipState('.filter-tier', 'ftier', state.tier);
      applyFilter({ address: 'push' });
    }, { signal });
  });
  document.querySelectorAll('[data-favorite]').forEach(button => {
    button.addEventListener('click', () => toggleFavorite(button.dataset.favorite || ''), { signal });
  });
  document.querySelector('[data-empty-reset]')?.addEventListener('click', () => resetFilters({ address: 'push' }), { signal });
  document.getElementById('urgent-list')?.addEventListener('click', event => {
    const button = event.target.closest('[data-jump]');
    if (!button) return;
    state.selectedId = button.dataset.jump || '';
    applySelect({ address: 'push', scroll: true });
  }, { signal });

  searchElement?.addEventListener('input', () => {
    state.search = searchElement.value;
    applyFilter({ address: 'replace' });
  }, { signal });
  statusElement?.addEventListener('change', () => {
    state.status = statusElement.value;
    applyFilter({ address: 'push' });
  }, { signal });
  sortElement?.addEventListener('change', () => {
    state.sort = sortElement.value;
    applyFilter({ address: 'push' });
  }, { signal });
  favoritesOnlyElement?.addEventListener('click', () => {
    state.favoritesOnly = !state.favoritesOnly;
    syncControls();
    applyFilter({ address: 'push' });
  }, { signal });
  clearFavoritesElement?.addEventListener('click', () => {
    if (!favorites.size || !window.confirm(`确定清空 ${favorites.size} 条收藏吗？`)) return;
    favorites.clear();
    writeFavoriteIds(favorites);
    syncFavorites();
    applyFilter({ address: 'replace' });
    announce('收藏已清空。');
  }, { signal });
  clearFiltersElement?.addEventListener('click', () => resetFilters({ address: 'push' }), { signal });
  detailCopy?.addEventListener('click', () => copySummary(detailCopy.dataset.copySummary || '', detailCopy), { signal });
  detailExport?.addEventListener('click', () => downloadCalendar(detailExport.dataset.exportIcs || '', detailExport), { signal });

  window.addEventListener('popstate', syncStateFromAddress, { signal });
  window.addEventListener('hashchange', syncStateFromAddress, { signal });
  window.addEventListener('storage', event => {
    if (event.key !== FAVORITE_STORAGE_KEY) return;
    favorites.clear();
    readFavoriteIds(validIds).forEach(id => favorites.add(id));
    syncFavorites();
    if (state.favoritesOnly) applyFilter({ preserveAddress: true });
  }, { signal });

  refreshSummary();
  syncControls();
  syncFavorites();
  applyFilter({ address: 'replace' });
  if (initialId && validIds.has(initialId)) {
    window.setTimeout(() => {
      if (signal.aborted) return;
      detailSection?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start',
      });
    }, 80);
  }
}

document.addEventListener('astro:page-load', initCompetitionRadar);
initCompetitionRadar();
