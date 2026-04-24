export const onRequest: PagesFunction<{ NOTIFY_KV: KVNamespace }> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);

  // Handle preflight CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  // Handle email signup
  if (request.method === 'POST') {
    try {
      const data = await request.json() as { email: string };
      const email = data.email?.trim();

      // Validate email
      if (!email || !isValidEmail(email)) {
        return jsonResponse({ error: 'Invalid email' }, 400);
      }

      // Check if email already exists
      const existing = await env.NOTIFY_KV.get(email);
      if (existing) {
        return jsonResponse({ message: 'Email already registered' }, 200);
      }

      // Store email with timestamp
      const now = new Date().toISOString();
      await env.NOTIFY_KV.put(email, JSON.stringify({ email, timestamp: now }));

      return jsonResponse({ message: 'Thanks for signing up!' }, 200);
    } catch (error) {
      console.error('Error:', error);
      return jsonResponse({ error: 'Failed to process request' }, 500);
    }
  }

  return new Response('Method not allowed', { status: 405 });
};

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function jsonResponse(data: unknown, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
