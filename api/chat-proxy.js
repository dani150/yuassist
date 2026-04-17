/**
 * Vercel Serverless Function — /api/chat-proxy
 *
 * Acts as a secure proxy between the frontend chat widget and the n8n webhook.
 * - Attaches the secret header so the raw webhook URL and secret are never exposed to the browser.
 * - Forwards the request body (action, sessionId, chatInput) unchanged.
 *
 * Required environment variables (set in Vercel dashboard):
 *   N8N_WEBHOOK_URL    — Full n8n webhook URL  (e.g. https://n8n.srv1313035.hstgr.cloud/webhook/...)
 *   N8N_WEBHOOK_SECRET — Value for the X-Webhook-Secret header
 */

module.exports = async function handler(req, res) {
  // ──── CORS preflight ────
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ──── Only allow POST ────
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // ──── Validate environment variables ────
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  const webhookSecret = process.env.N8N_WEBHOOK_SECRET;

  if (!webhookUrl) {
    console.error('Missing N8N_WEBHOOK_URL environment variable');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  if (!webhookSecret) {
    console.error('Missing N8N_WEBHOOK_SECRET environment variable');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  // ──── Basic request body validation ────
  const { action, sessionId, chatInput, campus } = req.body || {};

  if (!chatInput || typeof chatInput !== 'string' || chatInput.trim().length === 0) {
    return res.status(400).json({ error: 'chatInput is required and must be a non-empty string.' });
  }

  if (chatInput.length > 2000) {
    return res.status(400).json({ error: 'chatInput exceeds maximum length of 2000 characters.' });
  }

  try {
    // ──── Forward to n8n webhook ────
    const n8nResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Webhook-Secret': webhookSecret,
      },
      body: JSON.stringify({
        action: action || 'sendMessage',
        sessionId: sessionId || 'anonymous',
        chatInput: chatInput.trim(),
        campus: campus || 'Wilf',
      }),
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text().catch(() => 'Unknown error');
      console.error(`n8n responded with ${n8nResponse.status}: ${errorText}`);
      return res.status(502).json({
        error: 'Upstream service error.',
        detail: `n8n returned ${n8nResponse.status}`,
        hint: errorText.substring(0, 200),
      });
    }

    // Try to parse as JSON first, fall back to text
    const contentType = n8nResponse.headers.get('content-type') || '';
    let data;
    if (contentType.includes('application/json')) {
      data = await n8nResponse.json();
    } else {
      const text = await n8nResponse.text();
      data = { output: text };
    }

    // ──── Return the n8n response to the frontend ────
    return res.status(200).json(data);

  } catch (error) {
    console.error('Proxy error:', error.message || error);
    return res.status(502).json({
      error: 'Failed to reach the chat service.',
      detail: error.message || String(error),
    });
  }
};
