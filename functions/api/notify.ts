interface NotifyPayload {
  email: string;
  message?: string;
  source?: string;
  company?: string;
  role?: string;
}

export const onRequest: PagesFunction<{ NOTIFY_KV: KVNamespace }> = async (context) => {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const data = (await request.json()) as NotifyPayload;
    const email = data.email?.trim();

    if (!email || !isValidEmail(email)) {
      return jsonResponse({ error: 'Invalid email' }, 400);
    }

    const existing = await env.NOTIFY_KV.get(email);
    if (existing) {
      return jsonResponse({ message: "You're already on the list — thanks!" }, 200);
    }

    const record = {
      email,
      message: data.message?.trim() || null,
      source: data.source?.trim() || 'waitlist',
      company: data.company?.trim() || null,
      role: data.role?.trim() || null,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || null,
    };

    await env.NOTIFY_KV.put(email, JSON.stringify(record));

    return jsonResponse({ message: "You're on the list. We'll be in touch." }, 200);
  } catch (error) {
    console.error('notify error', error);
    return jsonResponse({ error: 'Failed to process request' }, 500);
  }
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
