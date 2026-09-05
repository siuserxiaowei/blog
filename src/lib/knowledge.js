/** @param {{ data: { draft?: boolean, publish?: boolean, visibility?: string } }} entry */
export function isPublishedKnowledge(entry) {
  return !entry.data.draft && entry.data.publish !== false &&
    (entry.data.visibility === undefined || entry.data.visibility === 'public');
}

/** @param {string} id */
export function knowledgeHref(id) {
  return `/knowledge/${id.split('/').map(encodeURIComponent).join('/')}/`;
}

/** @param {Date} date */
export function formatKnowledgeDate(date) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC',
  }).format(date).replaceAll('/', '.');
}

/** Plain text only: never insert a search excerpt as HTML. @param {string} markdown */
export function knowledgePlainText(markdown = '') {
  return markdown
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/!?\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, target, label) => label || target)
    .replace(/^\s*(```|~~~)[^\n]*$/gm, ' ')
    .replace(/^\s{0,3}(?:#{1,6}\s+|>\s*|[-*+]\s+|\d+\.\s+)/gm, '')
    .replace(/[*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Prevent a note's text from terminating an inline JSON script. @param {unknown} value */
export function serializeKnowledgeIndex(value) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
