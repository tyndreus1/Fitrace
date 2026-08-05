/**
 * Yapay zekâ istemcisi.
 *
 * Netlify fonksiyonlarına istek atar. Fonksiyon yoksa (yerel `vite dev`) ya da
 * API anahtarı tanımlı değilse hata fırlatmak yerine `ok: false` döner; çağıran
 * taraf çevrimdışı tahmine düşer.
 */
import { estimateFromText } from './foodDb'

const FN = '/.netlify/functions'

// Sunucu tarafındaki bütçe 22 saniye; tarayıcı ondan önce vazgeçerse yanıt
// gelse bile boşa gider. Biraz payla bekliyoruz.
const TIMEOUT_MS = 26000

async function callFunction(name, payload) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(`${FN}/${name}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      return { ok: false, error: `Sunucu ${res.status}`, detail }
    }
    const data = await res.json()
    return { ok: true, data }
  } catch (err) {
    return { ok: false, error: String(err) }
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Serbest metinden öğün analizi. Önce yapay zekâ denenir, olmazsa yerel
 * besin veritabanı kullanılır — her iki durumda da aynı biçimde sonuç döner.
 */
export async function analyzeMeal(text, context) {
  const result = await callFunction('analiz', { text, context })

  if (result.ok && Array.isArray(result.data?.items)) {
    const items = result.data.items.map((i) => ({
      name: i.name,
      amount: i.amount || '',
      kcal: Math.round(i.kcal || 0),
      protein: +(i.protein_g || 0).toFixed(1),
      carb: +(i.carb_g || 0).toFixed(1),
      fat: +(i.fat_g || 0).toFixed(1),
    }))
    return {
      source: 'yapay zeka',
      items,
      comment: result.data.comment || '',
      suggestion: result.data.suggestion || '',
    }
  }

  const local = estimateFromText(text)
  return {
    source: 'tahmin',
    items: local.items,
    comment: local.items.length
      ? 'Yapay zekâya ulaşılamadı, yerel besin tablosuyla tahmin ettim. Rakamlar yaklaşıktır.'
      : 'Yazdıklarını tanıyamadım. Daha basit yazmayı dene: "2 yumurta, 1 kase yoğurt, 1 muz".',
    suggestion: '',
    unmatched: local.unmatched,
  }
}

/** Koç sohbeti. history: [{role:'user'|'assistant', content}] */
export async function askCoach(messages, context) {
  const result = await callFunction('kocluk', { messages, context })
  if (result.ok && result.data?.message) {
    return { ok: true, message: result.data.message }
  }
  return {
    ok: false,
    message:
      'Şu an koça bağlanamadım — bağlantı ya da geçici bir yoğunluk olabilir, birazdan tekrar dene. ' +
      'Bu arada "Program" sekmesindeki beslenme ve antrenman rehberi hep burada — ' +
      've bugünün motivasyon notunu "Günce" sekmesinde bulabilirsin.',
  }
}
