export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://www.preiswise.de');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages' });
    }

    // Max 10 messages to limit costs
    const trimmed = messages.slice(-10);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        system: 'Du bist Foxy, ein freundlicher und witziger KI-Preishelfer fuer PreisWise.de, eine deutsche Preisvergleich-Website. Du hilfst Nutzern beim Preisvergleich und gibst Kauftipps. Antworte immer auf Deutsch, kurz und freundlich (max 2-3 Saetze). Benutze manchmal Emojis. PreisWise vergleicht 8 Shops: Amazon, eBay, MediaMarkt, Saturn, Otto, Idealo, Galaxus, Alternate. Du heisst Foxy und bist ein Fuchs. Wenn du etwas nicht weisst, sage dem Nutzer er soll das Kontaktformular nutzen.',
        messages: trimmed
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'API error' });
    }

    const reply = data.content?.[0]?.text || 'Ich bin kurz verwirrt! Versuch es nochmal 🦊';
    return res.status(200).json({ reply });

  } catch (err) {
    console.error('Foxy API error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
