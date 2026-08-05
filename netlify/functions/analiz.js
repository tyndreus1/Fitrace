import Anthropic from '@anthropic-ai/sdk'

// Birinci tercih Opus 5. API aşırı yüklenmiş dönerse (529) ikinci modele
// geçiyoruz — kullanıcı yoğunluk yüzünden analizsiz kalmasın.
const MODELS = ['claude-opus-5', 'claude-sonnet-5']

function isRetryableElsewhere(err) {
  const status = err?.status
  return status === 429 || (typeof status === 'number' && status >= 500)
}

const SCHEMA = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Besinin Türkçe adı' },
          amount: { type: 'string', description: 'Miktar, örn. "2 adet", "150 g"' },
          kcal: { type: 'number' },
          protein_g: { type: 'number' },
          carb_g: { type: 'number' },
          fat_g: { type: 'number' },
        },
        required: ['name', 'amount', 'kcal', 'protein_g', 'carb_g', 'fat_g'],
        additionalProperties: false,
      },
    },
    comment: { type: 'string', description: 'Öğün hakkında bir cümlelik sıcak yorum' },
    suggestion: { type: 'string', description: 'Günün kalan hedefine göre bir cümlelik öneri' },
  },
  required: ['items', 'comment', 'suggestion'],
  additionalProperties: false,
}

const SYSTEM = `Sen Türkçe konuşan bir beslenme asistanısın. Kullanıcının serbest metinle yazdığı öğünü besin kalemlerine ayırıp kalori ve makro besin tahmini yapıyorsun.

Kurallar:
- Türk mutfağına hakim ol (menemen, mercimek çorbası, bulgur pilavı, simit, döner, lahmacun, ayran, tahin-pekmez gibi).
- Miktar belirtilmemişse Türkiye'deki normal porsiyonu varsay ve bunu "amount" alanında açıkça yaz.
- Sayılar gerçekçi olsun; emin değilsen ortalama bir değer ver, kalemi atlama.
- Yazılanı anlamadıysan items dizisini boş bırak ve comment alanında ne şekilde yazması gerektiğini kibarca söyle.
- Kullanıcı kilo ALMAYA çalışıyor. Asla porsiyon küçültme, öğün atlama veya kalori kısıtlama önerme; "fazla kalori aldın" gibi suçlayıcı ifadeler kullanma.
- suggestion alanında, günün kalan kalori ve protein hedefine bakarak somut ve kolay bir ekleme öner (örn. "Akşama 1 bardak süt + 1 kaşık tahin eklersen protein hedefini yakalarsın").
- comment ve suggestion kısa olsun: en fazla birer cümle, sıcak ve destekleyici bir ton.`

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Yalnızca POST' }) }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'ANTHROPIC_API_KEY tanımlı değil' }) }
  }

  let payload
  try {
    payload = JSON.parse(event.body || '{}')
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Geçersiz JSON' }) }
  }

  const { text, context = {} } = payload
  if (!text || typeof text !== 'string') {
    return { statusCode: 400, body: JSON.stringify({ error: 'text alanı gerekli' }) }
  }

  const hedef = context.targets || {}
  const alinan = context.consumedToday || {}
  const prompt = `Öğün (${context.slot || 'öğün'}): ${text.slice(0, 800)}

Bugünkü durum — hedef: ${hedef.kcal ?? '?'} kcal / ${hedef.protein ?? '?'} g protein. Şu ana kadar alınan: ${
    alinan.kcal ?? 0
  } kcal / ${alinan.protein ?? 0} g protein.`

  try {
    // Netlify eşzamanlı fonksiyonları 10 saniyede kesilir. Kendi zaman aşımımızı
    // bunun altında tutuyoruz ki düzgün bir JSON hatası dönebilelim; arayüz de
    // bunu görüp yerel besin tablosuna düşsün.
    const client = new Anthropic({ apiKey, maxRetries: 1, timeout: 6500 })

    let response
    let lastError
    for (const model of MODELS) {
      try {
        response = await client.messages.create({
          model,
          max_tokens: 4000,
          system: SYSTEM,
          // Kısa ve iyi tanımlı bir görev; düşük efor hem hızlı hem yeterli.
          output_config: {
            effort: 'low',
            format: { type: 'json_schema', schema: SCHEMA },
          },
          messages: [{ role: 'user', content: prompt }],
        })
        break
      } catch (err) {
        lastError = err
        if (!isRetryableElsewhere(err)) throw err
        console.warn(`${model} yanıt veremedi (${err?.status}), sıradaki model deneniyor`)
      }
    }
    if (!response) throw lastError

    if (response.stop_reason === 'refusal') {
      return {
        statusCode: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ items: [], comment: 'Bu isteği yanıtlayamadım, farklı yazmayı dener misin?', suggestion: '' }),
      }
    }

    const textBlock = response.content.find((b) => b.type === 'text')
    if (!textBlock) {
      return { statusCode: 502, body: JSON.stringify({ error: 'Boş yanıt' }) }
    }

    const parsed = JSON.parse(textBlock.text)
    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(parsed),
    }
  } catch (err) {
    console.error('analiz hatası:', err)
    return { statusCode: 502, body: JSON.stringify({ error: 'Analiz yapılamadı', detail: String(err?.message || err) }) }
  }
}
