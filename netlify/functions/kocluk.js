import Anthropic from '@anthropic-ai/sdk'

// Birinci tercih Opus 5. API aşırı yüklenmiş dönerse (529) ikinci modele
// geçiyoruz — sohbet yoğunluk yüzünden tamamen kesilmesin.
const MODELS = ['claude-opus-5', 'claude-sonnet-5']

// Bu Netlify projesinde 16 saniyelik yanıtlar sorunsuz döndü (sınır 26 sn).
// Koç yanıtı tipik olarak 10-16 saniye sürüyor, bütçeyi ona göre ayarlıyoruz.
const TOTAL_BUDGET_MS = Number(process.env.AI_BUDGET_MS || 22000)
const MIN_ATTEMPT_MS = 4000

// Yanıtı şemayla kısıtlıyoruz: düşünme kapalıyken modelin iç muhakemesini
// görünür metne sızdırma ihtimali kalmıyor, arayüz de her zaman tek bir
// düz metin alanı render ediyor.
const SCHEMA = {
  type: 'object',
  properties: {
    message: {
      type: 'string',
      description: 'Kullanıcıya gösterilecek yanıt. Türkçe, 2-5 cümle, markdown başlığı yok.',
    },
  },
  required: ['message'],
  additionalProperties: false,
}

function isRetryableElsewhere(err) {
  const status = err?.status
  // Zaman aşımı ve bağlantı hataları da sıradaki modeli denemeye değer.
  if (err?.name === 'APIConnectionTimeoutError' || err?.name === 'APIConnectionError') return true
  return status === 429 || (typeof status === 'number' && status >= 500)
}

const SYSTEM = `Sen Özge'nin kişisel beslenme, antrenman ve motivasyon koçusun. Türkçe konuşuyorsun ve enerjin yüksek: esprili, hafif sarkastik, laf sokan ama sevgi dolu bir arkadaş gibisin. Klişe motivasyon lafları etmezsin; bunun yerine takılır, dalga geçer, güldürerek motive edersin.

ÜSLUP:
- Espri ve hafif iğneleme serbest, ama iyilik dolu. Kırıcı, aşağılayıcı ya da beden utandıran şaka ASLA yok. Şaka Özge'yi güldürmek için, üzmek için değil.
- Emoji kullanabilirsin ama abartma (yanıt başına 1-2).
- Öz güvenli ve senli benli konuş; "canım", "kanka", "bak şimdi" gibi ifadeler serbest.
- Espriyi somut tavsiyeyle birleştir. Sadece komik olup boş konuşma — her yanıtta işe yarar bir şey olsun.

Özge'nin durumu:
- 26 yaşında, 162 cm. Bir dönem kullandığı antidepresanları bıraktıktan sonra hızla kilo verdi, şu an zayıf tarafta.
- Hedefi kilo VERMEK değil, kas ve sağlıklı doku kazanarak kilo ALMAK; özellikle kalça ve bacaklarda kaybettiği dolgunluğu geri kazanmak istiyor.
- İkincil olarak sivilcelenme sorunu var.

KAYITLARINI GÖREBİLİYORSUN — bunları kullan:
- Sana her mesajda güncel veriler geliyor: kilo, bugün ve son 7 günün kalori/protein toplamı, son 3 günün öğünleri (ne yazdığı dahil), ölçüler, ruh hâli.
- "Dün kahvaltıda ne yedim?" gibi sorulara BU KAYITLARA bakarak cevap ver. sonGunlerinOgunleri alanında hangi gün ne yediği yazıyor. Uydurma; kayıtta yoksa "o öğünü kaydetmemişsin galiba, gizli mi yedin?" gibi takıl.
- Rakamları kullan: "bugün 1200'de kalmışsın, hedefin 2080; bu gidişle kilo değil ancak sabır kazanırsın 😄" gibi.

İÇERİK KURALLARI (bunlar espriden önce gelir, taviz yok):
- Somut ol. "Daha çok protein ye" değil; "kahvaltıya 2 yumurta daha, öğleden sonra 250 ml süt + 1 kaşık tahin" gibi.
- Kas kazanımının merkezi: ılımlı kalori fazlası, kilo başına ~2,2 g protein, haftada 3-4 gün ağırlık (kalça için hip thrust, squat, RDL), yeterli uyku.
- ASLA kalori kısıtlama, öğün atlama, detoks, aralıklı oruç ya da kilo verdirecek öneri yok. Beden ölçüleriyle dalga geçme.
- Tartıdaki günlük oynamaları normalleştir; haftalık ortalamaya bakmasını hatırlat.
- Kısa yaz: 2-5 cümle. Liste gerekiyorsa en fazla 4 madde. Markdown başlığı yok.
- Tanı koyma, ilaç önerme, tahlil yorumlama. Hormonal sorun, inatçı sivilce, iştahsızlık, uzun süreli mutsuzluk ya da yemekle ilgili sıkıntı sezersen ŞAKAYI BIRAK, ciddileş ve nazikçe bir hekime/diyetisyene/psikoloğa danışmasını öner.
- Gerçekten kötü hissettiğini söylediği günlerde sarkazmı kapat: önce duyduğunu hissettir, sonra o gün için tek bir küçük adım öner.`

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

  const { messages, context = {} } = payload
  if (!Array.isArray(messages) || messages.length === 0) {
    return { statusCode: 400, body: JSON.stringify({ error: 'messages alanı gerekli' }) }
  }

  // Yalnızca geçerli rolleri ve son 16 mesajı gönder.
  const history = messages
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-16)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }))

  if (!history.length || history[0].role !== 'user') {
    history.unshift({ role: 'user', content: 'Merhaba' })
  }

  const contextNote = `[Güncel kayıtlar — yanıtını bunlara dayandır]\n${JSON.stringify(context)}`

  try {
    // Netlify eşzamanlı fonksiyonları 10 saniyede kesilir; zaman aşımını bunun
    // altında tutup kendi hata yanıtımızı dönüyoruz (arayüz yedek metne düşer).
    // Bütçeyi biz yönetiyoruz: SDK'nın yeniden denemesi kapalı, her model
    // denemesine kalan süre veriliyor.
    const client = new Anthropic({ apiKey, maxRetries: 0 })
    const startedAt = Date.now()

    let response
    let lastError
    const tried = []
    for (const model of MODELS) {
      const remaining = TOTAL_BUDGET_MS - (Date.now() - startedAt)
      if (remaining < MIN_ATTEMPT_MS) break
      const attemptStart = Date.now()
      try {
        response = await client.messages.create(
          {
            model,
            max_tokens: 2000,
            system: [
              { type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } },
              { type: 'text', text: contextNote },
            ],
            // Sohbet gecikmeye duyarlı ve yanıtlar kısa (2-5 cümle). Düşünme
            // açıkken yanıt 10 saniyelik Netlify bütçesine sığmıyordu; kapattık
            // ve güvenliği çıktı şemasıyla sağladık.
            thinking: { type: 'disabled' },
            output_config: {
              effort: 'low',
              format: { type: 'json_schema', schema: SCHEMA },
            },
            messages: history,
          },
          { timeout: remaining },
        )
        tried.push({ model, ms: Date.now() - attemptStart, ok: true })
        break
      } catch (err) {
        lastError = err
        tried.push({ model, ms: Date.now() - attemptStart, err: err?.status || err?.name })
        if (!isRetryableElsewhere(err)) throw err
        console.warn(`${model} yanıt veremedi (${err?.status || err?.name}), sıradaki model deneniyor`)
      }
    }
    if (!response) {
      return {
        statusCode: 502,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          error: 'Koça ulaşılamadı',
          detail: String(lastError?.message || lastError),
          tried,
        }),
      }
    }

    if (response.stop_reason === 'refusal') {
      return {
        statusCode: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          message: 'Bu konuda yardımcı olamıyorum. Sağlıkla ilgili bir endişen varsa bir hekimle konuşman en doğrusu.',
        }),
      }
    }

    const raw = response.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim()

    // Şema gereği JSON gelir; beklenmedik bir durumda ham metne düşüyoruz.
    let message = raw
    try {
      const parsed = JSON.parse(raw)
      if (typeof parsed?.message === 'string') message = parsed.message.trim()
    } catch {
      // ham metin kullanılacak
    }

    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ message: message || 'Bir şey ters gitti, tekrar sorar mısın?' }),
    }
  } catch (err) {
    console.error('kocluk hatası:', err)
    return { statusCode: 502, body: JSON.stringify({ error: 'Koça ulaşılamadı', detail: String(err?.message || err) }) }
  }
}
