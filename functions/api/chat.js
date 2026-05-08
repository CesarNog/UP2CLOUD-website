export async function onRequestPost(context) {
  const { request, env } = context;

  // Basic rate limiting by IP — 20 req/min
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const rateLimitKey = `chat_ratelimit_${ip}`;
  const cache = caches.default;
  const cacheUrl = new URL(`https://ratelimit.internal/${rateLimitKey}`);
  const cached = await cache.match(cacheUrl);
  if (cached) {
    const count = parseInt(await cached.text());
    if (count >= 20) {
      return new Response(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    await cache.put(cacheUrl, new Response(String(count + 1), {
      headers: { 'Cache-Control': 'max-age=60' },
    }));
  } else {
    await cache.put(cacheUrl, new Response('1', {
      headers: { 'Cache-Control': 'max-age=60' },
    }));
  }

  // Only accept requests from our own domain
  const origin = request.headers.get('Origin') || '';
  if (!origin.includes('up2cloud.tech') && !origin.includes('up2cloud-tech.pages.dev')) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: body.messages,
      max_tokens: 512,
      temperature: 0.7,
    }),
  });

  const data = await groqRes.json();

  return new Response(JSON.stringify(data), {
    status: groqRes.status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': origin,
    },
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
