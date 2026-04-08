// Cloudflare Pages Function: proxy WeChat articles with proper UA
// This bypasses CORS and WeChat's UA-based content gating
export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const target = url.searchParams.get('url');

  // Only allow WeChat URLs
  if (!target || (!target.includes('mp.weixin.qq.com') && !target.includes('weixin.qq.com'))) {
    return new Response(JSON.stringify({ error: 'Only WeChat article URLs allowed' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const resp = await fetch(target, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
      redirect: 'follow',
    });

    const html = await resp.text();

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}
