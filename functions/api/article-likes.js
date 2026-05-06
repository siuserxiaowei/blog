const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

const JSON_HEADERS = {
  ...CORS_HEADERS,
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
};

const MAX_SLUG_LENGTH = 160;
const LIKE_KEY_PREFIX = 'article-likes:';

export function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const slugResult = normalizeSlug(url.searchParams.get('slug'));

  if (!slugResult.ok) {
    return json({ error: slugResult.error }, 400);
  }

  const kv = getLikesKv(context.env);
  if (!kv) {
    return missingKvResponse(slugResult.slug);
  }

  try {
    const likes = await readLikes(kv, slugResult.slug);
    return json({ slug: slugResult.slug, likes });
  } catch {
    return json({ error: 'Failed to read article likes' }, 500);
  }
}

export async function onRequestPost(context) {
  const body = await readRequestBody(context.request);
  if (!body) {
    return json({ error: 'Expected JSON or form data body' }, 400);
  }

  const slugResult = normalizeSlug(body.slug);
  if (!slugResult.ok) {
    return json({ error: slugResult.error }, 400);
  }

  const deltaResult = normalizeDelta(body.delta);
  if (!deltaResult.ok) {
    return json({ error: deltaResult.error }, 400);
  }

  const kv = getLikesKv(context.env);
  if (!kv) {
    return missingKvResponse(slugResult.slug);
  }

  try {
    const current = await readLikes(kv, slugResult.slug);
    const likes = current + deltaResult.delta;
    await kv.put(keyForSlug(slugResult.slug), String(likes));
    return json({ slug: slugResult.slug, likes });
  } catch {
    return json({ error: 'Failed to update article likes' }, 500);
  }
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: JSON_HEADERS,
  });
}

function missingKvResponse(slug) {
  return json({
    error: 'ARTICLE_LIKES_KV or LIKES_KV binding is not configured',
    slug,
    likes: 0,
  }, 501);
}

function getLikesKv(env = {}) {
  const kv = env.ARTICLE_LIKES_KV || env.LIKES_KV;
  if (!kv || typeof kv.get !== 'function' || typeof kv.put !== 'function') {
    return null;
  }
  return kv;
}

function normalizeSlug(value) {
  if (typeof value !== 'string') {
    return { ok: false, error: 'Missing slug' };
  }

  const slug = value.trim();
  if (!slug) {
    return { ok: false, error: 'Missing slug' };
  }

  if (slug.length > MAX_SLUG_LENGTH) {
    return { ok: false, error: 'Slug is too long' };
  }

  if (
    !/^[A-Za-z0-9][A-Za-z0-9_/-]*$/.test(slug) ||
    slug.endsWith('/') ||
    slug.includes('//') ||
    slug.includes('..')
  ) {
    return { ok: false, error: 'Invalid slug' };
  }

  return { ok: true, slug };
}

function normalizeDelta(value) {
  const deltaText = String(value ?? '').trim();
  const delta = typeof value === 'number' ? value : Number(deltaText);

  if (
    (typeof value !== 'number' && !/^\d+$/.test(deltaText)) ||
    !Number.isInteger(delta) ||
    delta < 1 ||
    delta > 20
  ) {
    return { ok: false, error: 'Delta must be an integer from 1 to 20' };
  }

  return { ok: true, delta };
}

async function readRequestBody(request) {
  const contentType = request.headers.get('content-type') || '';

  try {
    if (contentType.includes('application/json')) {
      return await request.json();
    }

    if (
      contentType.includes('application/x-www-form-urlencoded') ||
      contentType.includes('multipart/form-data')
    ) {
      return formDataToObject(await request.formData());
    }

    const text = await request.text();
    if (!text.trim()) {
      return null;
    }

    try {
      return JSON.parse(text);
    } catch {
      return Object.fromEntries(new URLSearchParams(text));
    }
  } catch {
    return null;
  }
}

function formDataToObject(formData) {
  const body = {};
  formData.forEach((value, key) => {
    body[key] = String(value);
  });
  return body;
}

async function readLikes(kv, slug) {
  const rawLikes = await kv.get(keyForSlug(slug));
  const likes = Number.parseInt(rawLikes || '0', 10);
  return Number.isFinite(likes) && likes > 0 ? likes : 0;
}

function keyForSlug(slug) {
  return `${LIKE_KEY_PREFIX}${slug}`;
}
