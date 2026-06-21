const MODEL = 'claude-haiku-4-5-20251001'

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }) }
  }

  let payload
  try {
    payload = JSON.parse(event.body || '{}')
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  const { me, opponent } = payload
  if (!me || !opponent) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing me/opponent stats' }) }
  }

  const prompt = `You are a fun, upbeat fitness coach writing a short motivational message for a friendly weight-loss competition between two people. Be warm and playful, never mean or shaming, and keep it under 45 words, no markdown, 1-2 sentences.

${me.name}: ${me.weightLostKg.toFixed(1)} kg lost, ${me.waterStreak}-day water streak, BMI ${me.bmi ? me.bmi.toFixed(1) : 'unknown'}.
${opponent.name}: ${opponent.weightLostKg.toFixed(1)} kg lost, ${opponent.waterStreak}-day water streak, BMI ${opponent.bmi ? opponent.bmi.toFixed(1) : 'unknown'}.

Write the message addressed directly to ${me.name}, comparing them to ${opponent.name} in a lighthearted competitive way, and motivate them to keep going today.`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 120,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      return { statusCode: 502, body: JSON.stringify({ error: 'Upstream error', detail: text }) }
    }

    const data = await res.json()
    const message = data.content?.[0]?.text?.trim() || "Keep going — every drop of water and every step counts!"

    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ message }),
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) }
  }
}
