/** Search is progressively enhanced; the complete note list remains readable without JavaScript. */
export function initKnowledgeSearch() {
  const library = document.querySelector('[data-knowledge-library]');
  const form = document.getElementById('knowledge-search-form');
  const input = document.getElementById('knowledge-search');
  const topic = document.getElementById('knowledge-topic');
  const type = document.getElementById('knowledge-type');
  const source = document.getElementById('knowledge-index');
  if (!library || !(form instanceof HTMLFormElement) || !(input instanceof HTMLInputElement) ||
    !(topic instanceof HTMLSelectElement) || !(type instanceof HTMLSelectElement) || !source) return;

  let notes;
  try { notes = JSON.parse(source.textContent || '[]'); } catch { return; }
  if (!Array.isArray(notes)) return;
  const controller = new AbortController();
  const { signal } = controller;
  const count = document.getElementById('knowledge-result-count');
  const heading = document.getElementById('knowledge-results-heading');
  const empty = document.getElementById('knowledge-no-results');
  const reset = document.getElementById('knowledge-reset');
  const items = new Map(Array.from(library.querySelectorAll('[data-knowledge-id]')).map((element) => [element.getAttribute('data-knowledge-id'), element]));
  const records = notes.map((note) => ({
    ...note,
    searchable: [note.title, note.description, note.topic, note.type, ...note.tags, note.text].join(' ').toLocaleLowerCase('zh-CN'),
  }));

  const readURL = () => {
    const params = new URLSearchParams(window.location.search);
    input.value = params.get('q') || '';
    topic.value = params.get('topic') || '';
    type.value = params.get('type') || '';
  };

  const updateURL = () => {
    const url = new URL(window.location.href);
    for (const [key, value] of [['q', input.value.trim()], ['topic', topic.value], ['type', type.value]]) {
      if (value) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    }
    // Keep Astro's existing history state so browser back/forward navigation remains intact.
    history.replaceState(history.state, '', url);
  };

  /** @param {Element} element @param {string} text @param {string[]} terms */
  const showExcerpt = (element, text, terms) => {
    element.replaceChildren();
    if (!terms.length) { element.textContent = text; return; }
    const lower = text.toLocaleLowerCase('zh-CN');
    let offset = 0;
    while (offset < text.length) {
      let next = text.length;
      let length = 0;
      for (const term of terms) {
        const found = lower.indexOf(term, offset);
        if (found >= 0 && (found < next || (found === next && term.length > length))) {
          next = found;
          length = term.length;
        }
      }
      element.append(document.createTextNode(text.slice(offset, next)));
      if (!length) break;
      const mark = document.createElement('mark');
      mark.textContent = text.slice(next, next + length);
      element.append(mark);
      offset = next + length;
    }
  };

  const filter = (writeURL = true) => {
    const terms = input.value.trim().toLocaleLowerCase('zh-CN').split(/\s+/).filter(Boolean);
    let visibleCount = 0;
    for (const note of records) {
      const item = items.get(note.id);
      if (!(item instanceof HTMLElement)) continue;
      const visible = (!topic.value || note.topic === topic.value) && (!type.value || note.type === type.value) && terms.every((term) => note.searchable.includes(term));
      item.hidden = !visible;
      if (!visible) continue;
      visibleCount += 1;
      const excerpt = item.querySelector('[data-knowledge-excerpt]');
      if (!excerpt) continue;
      let text = note.description || note.text.slice(0, 140);
      if (terms.length && !terms.some((term) => text.toLocaleLowerCase('zh-CN').includes(term))) {
        const lower = note.text.toLocaleLowerCase('zh-CN');
        const matches = terms.map((term) => lower.indexOf(term)).filter((position) => position >= 0);
        if (matches.length) {
          const start = Math.max(0, Math.min(...matches) - 36);
          const end = Math.min(note.text.length, start + 155);
          text = `${start ? '…' : ''}${note.text.slice(start, end)}${end < note.text.length ? '…' : ''}`;
        }
      }
      showExcerpt(excerpt, text, terms);
    }
    const filtering = terms.length > 0 || Boolean(topic.value || type.value);
    if (heading) heading.textContent = filtering ? '查找结果' : '最近收录';
    if (count) count.textContent = filtering ? `找到 ${visibleCount} 篇 / 共 ${notes.length} 篇` : `共 ${notes.length} 篇 · 按时间排列`;
    if (empty instanceof HTMLElement) empty.hidden = visibleCount > 0;
    if (writeURL) updateURL();
  };

  form.hidden = false;
  readURL();
  filter(false);
  input.addEventListener('input', () => filter(), { signal });
  topic.addEventListener('change', () => filter(), { signal });
  type.addEventListener('change', () => filter(), { signal });
  form.addEventListener('submit', (event) => { event.preventDefault(); filter(); }, { signal });
  reset?.addEventListener('click', () => {
    input.value = ''; topic.value = ''; type.value = '';
    filter(); input.focus();
  }, { signal });
  window.addEventListener('popstate', () => { readURL(); filter(false); }, { signal });
  return () => controller.abort();
}
