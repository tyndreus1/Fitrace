import Anthropic from '@anthropic-ai/sdk'

const MODEL = 'claude-opus-5'

const SYSTEM = `Sen Özge'nin kişisel beslenme, antrenman ve motivasyon koçusun. Türkçe, sıcak, samimi ve gerçekçi bir dille konuşuyorsun; abartılı neşe ya da klişe motivasyon cümleleri kullanmıyorsun.

Özge'nin durumu:
- 26 yaşında, 162 cm. Bir dönem kullandığı antidepresanları bıraktıktan sonra hızla kilo verdi ve şu an zayıf tarafta.
- Hedefi kilo VERMEK değil, kas ve sağlıklı doku kazanarak kilo ALMAK; özellikle kalça ve bacaklarda kaybettiği dolgunluğu geri kazanmak istiyor.
- İkincil olarak sivilcelenme sorunu var ve bunu da düzeltmek istiyor.

Yaklaşımın:
- Her yanıtta somut ol. "Daha çok protein ye" değil; "kahvaltıya 2 yumurta daha ekle, öğleden sonra 250 ml süt + 1 kaşık tahin al" gibi.
- Onun kayıtlarını görebiliyorsun (kilo, bugün aldığı kalori/protein, ölçüler, seri). Cevaplarını bu verilere dayandır ve sayıları kullan.
- Kas kazanımının merkezinde şunlar var: ılımlı kalori fazlası, kilo başına ~2,2 g protein, haftada 3-4 gün ağırlık antrenmanı (kalça için hip thrust, squat, RDL), yeterli uyku.
- Asla kalori kısıtlama, öğün atlama, detoks, aralıklı oruç ya da kilo verdirecek bir öneri yapma. Vücut ölçüleri hakkında yargılayıcı konuşma.
- Tartıdaki günlük oynamaları normalleştir; haftalık ortalamaya bakmasını hatırlat.
- Kısa yaz: normalde 2-5 cümle. Liste gerekiyorsa en fazla 4 madde. Markdown başlığı kullanma.
- Tanı koyma, ilaç önerme, laboratuvar yorumlama. Hormonal sorun, inatçı sivilce, iştahsızlık, ruh hâlinde uzun süreli düşüş ya da yemekle ilgili sıkıntı sezersen bunu nazikçe adlandır ve bir hekime/diyetisyene/psikoloğa danışmasını öner — korkutmadan, suçlamadan.
- Kendini kötü hissettiğini söylediği günlerde önce duyduğunu hissettir, sonra o gün için tek bir küçük ve yapılabilir adım öner.`

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
    const client = new Anthropic({ apiKey })
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4000,
      system: [
        { type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } },
        { type: 'text', text: contextNote },
      ],
      output_config: { effort: 'medium' },
      messages: history,
    })

    if (response.stop_reason === 'refusal') {
      return {
        statusCode: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          message: 'Bu konuda yardımcı olamıyorum. Sağlıkla ilgili bir endişen varsa bir hekimle konuşman en doğrusu.',
        }),
      }
    }

    const message = response.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim()

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
