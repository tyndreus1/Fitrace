/**
 * Veri katmanı.
 *
 * Supabase ortam değişkenleri tanımlıysa kayıtlar buluta yazılır (telefon +
 * bilgisayar senkron olur). Tanımlı değilse — ya da buluttaki şema uyumsuzsa —
 * aynı API tarayıcının localStorage'ını kullanır.
 *
 * ÖNEMLİ: Yazma hataları asla sessizce yutulmaz. Bulut yazamazsa kayıt yerel
 * olarak saklanır ve `remoteState` "yerel"e döner; arayüz bunu kullanıcıya
 * gösterir. Yani veri hiçbir koşulda kaybolmaz.
 */
import { createClient } from '@supabase/supabase-js'
import { PROFILE } from './config'
import { daysAgoStr, todayStr } from './dates'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const hasRemote = Boolean(url && key)
export const supabase = hasRemote ? createClient(url, key) : null

const HISTORY_DAYS = 365
const LS_PREFIX = 'ozge_'

// Uygulamanın ihtiyaç duyduğu tablolar
const TABLES = ['weight_logs', 'measurements', 'meals', 'water_logs', 'journal', 'chat_messages']

// Yerel kayda düşme kararı sayfa yenilenince UNUTULMAMALI: yoksa uygulama
// yeniden buluttan okumaya çalışır ve cihazda duran kayıtlar görünmez olur.
const OFF_KEY = LS_PREFIX + 'bulut_kapali'

function readOffFlag() {
  try {
    return localStorage.getItem(OFF_KEY) || ''
  } catch {
    return ''
  }
}

const offReason = hasRemote ? readOffFlag() : ''

/**
 * 'yerel'  → Supabase yapılandırılmamış ya da kullanılamıyor, kayıtlar cihazda
 * 'bulut'  → Supabase çalışıyor
 */
export const remoteState = {
  mode: hasRemote && !offReason ? 'bulut' : 'yerel',
  reason: hasRemote
    ? offReason
    : 'Supabase yapılandırılmamış; kayıtlar bu cihazda tutuluyor.',
  checked: !hasRemote || Boolean(offReason),
}

/**
 * @param persist Kalıcı mı? Veritabanının kesin reddettiği durumlar (eksik
 *   tablo/sütun, yetki) kalıcıdır. Geçici ağ kopukluğu değildir — yoksa metroda
 *   bir kez bağlantı kesilince bulut eşitlemesi temelli kapanırdı.
 */
function fallbackToLocal(reason, { persist = true } = {}) {
  if (remoteState.mode === 'yerel') return
  remoteState.mode = 'yerel'
  remoteState.reason = reason
  if (persist) {
    try {
      localStorage.setItem(OFF_KEY, reason)
    } catch {
      // bayrak yazılamazsa da oturum boyunca yerel kayıt sürer
    }
  }
  console.warn('Bulut kaydı kapatıldı, yerel kayda geçildi:', reason)
}

/** PostgREST hatalarının kodu olur; ağ hatalarının olmaz. */
function isDefinite(error) {
  return Boolean(error?.code)
}

/** Şema düzeltildikten sonra bulut kaydını yeniden denemek için. */
export function retryRemote() {
  try {
    localStorage.removeItem(OFF_KEY)
  } catch {
    // yoksay
  }
}

function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

// ---- localStorage yardımcıları ----

function lsRead(table) {
  try {
    const raw = localStorage.getItem(LS_PREFIX + table)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function lsWrite(table, rows) {
  try {
    localStorage.setItem(LS_PREFIX + table, JSON.stringify(rows))
    return { error: null }
  } catch (err) {
    console.error('Kayıt tarayıcıya da yazılamadı:', err)
    return { error: 'Kayıt saklanamadı. Tarayıcı depolaması dolu olabilir.' }
  }
}

function remoteActive() {
  return hasRemote && remoteState.mode === 'bulut'
}

/**
 * Buluttaki şemanın uygulamayla uyumlu olduğunu bir kez doğrular.
 * Eksik tablo / erişilemeyen veritabanı varsa tümüyle yerel kayda geçilir —
 * yarısı bulutta yarısı cihazda dağınık veri oluşmasın diye.
 */
const PROBE_TIMEOUT_MS = 5000

async function ensureRemoteReady() {
  if (remoteState.checked || !hasRemote) return
  remoteState.checked = true

  const probe = Promise.all(TABLES.map((t) => supabase.from(t).select('id').limit(1)))
  const timeout = new Promise((resolve) => setTimeout(() => resolve('zaman-asimi'), PROBE_TIMEOUT_MS))

  try {
    const results = await Promise.race([probe, timeout])

    // Bulut yanıt vermiyor: geçici olabilir, kalıcı olarak kapatma.
    if (results === 'zaman-asimi') {
      fallbackToLocal('Buluta zamanında ulaşılamadı; kayıtlar şimdilik bu cihazda.', {
        persist: false,
      })
      return
    }

    const broken = results.map((r, i) => (r.error ? TABLES[i] : null)).filter(Boolean)
    if (broken.length) {
      const definite = results.some((r) => isDefinite(r.error))
      fallbackToLocal(
        `Buluttaki şu tablolara ulaşılamadı: ${broken.join(', ')}. ` +
          'supabase/migration.sql çalıştırılınca bulut kaydı kendiliğinden açılır.',
        { persist: definite },
      )
    }
  } catch (err) {
    fallbackToLocal(`Buluta bağlanılamadı (${String(err?.message || err)}).`, { persist: false })
  }
}

// ---- Genel CRUD ----

async function list(table, { orderBy = 'log_date', ascending = true } = {}) {
  if (remoteActive()) {
    let query = supabase.from(table).select('*').eq('profile_id', PROFILE.id)
    if (orderBy === 'log_date') query = query.gte('log_date', daysAgoStr(HISTORY_DAYS))
    const { data, error } = await query.order(orderBy, { ascending })
    if (!error) return data || []
    fallbackToLocal(`"${table}" okunamadı: ${error.message}`, { persist: isDefinite(error) })
  }

  const rows = lsRead(table)
  return [...rows].sort((a, b) => {
    const av = String(a[orderBy] ?? '')
    const bv = String(b[orderBy] ?? '')
    return ascending ? av.localeCompare(bv) : bv.localeCompare(av)
  })
}

async function insert(table, row) {
  const record = { ...row, profile_id: PROFILE.id }

  if (remoteActive()) {
    const { error } = await supabase.from(table).insert(record)
    if (!error) return { error: null }
    fallbackToLocal(`"${table}" kaydedilemedi: ${error.message}`, { persist: isDefinite(error) })
  }

  const rows = lsRead(table)
  const withId = { id: newId(), created_at: new Date().toISOString(), ...record }
  return lsWrite(table, [...rows, withId])
}

/** Aynı güne ait kaydı günceller, yoksa oluşturur. */
async function upsertByDate(table, row) {
  const record = { ...row, profile_id: PROFILE.id }

  if (remoteActive()) {
    const { error } = await supabase.from(table).upsert(record, { onConflict: 'profile_id,log_date' })
    if (!error) return { error: null }
    fallbackToLocal(`"${table}" güncellenemedi: ${error.message}`, { persist: isDefinite(error) })
  }

  const rows = lsRead(table)
  const idx = rows.findIndex((r) => r.log_date === record.log_date)
  if (idx >= 0) rows[idx] = { ...rows[idx], ...record }
  else rows.push({ id: newId(), created_at: new Date().toISOString(), ...record })
  return lsWrite(table, rows)
}

async function remove(table, id) {
  if (remoteActive()) {
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (!error) return { error: null }
    fallbackToLocal(`"${table}" silinemedi: ${error.message}`, { persist: isDefinite(error) })
  }
  return lsWrite(
    table,
    lsRead(table).filter((r) => r.id !== id),
  )
}

// ---- Alan bazlı API ----

export const store = {
  /**
   * Cihazdaki kayıtları anında (beklemeden) döndürür. Bulut yoklaması birkaç
   * saniye sürebildiği için açılışta önce bu gösterilir — kullanıcı asla boş
   * bir ekranla karşılaşmaz.
   */
  loadLocal: () => ({
    weights: lsRead('weight_logs'),
    measurements: lsRead('measurements'),
    meals: lsRead('meals'),
    water: lsRead('water_logs'),
    journal: lsRead('journal'),
    chat: lsRead('chat_messages'),
  }),

  loadAll: async () => {
    await ensureRemoteReady()
    const [weights, measurements, meals, water, journal, chat] = await Promise.all([
      list('weight_logs'),
      list('measurements'),
      list('meals'),
      list('water_logs'),
      list('journal'),
      list('chat_messages', { orderBy: 'created_at' }),
    ])
    return { weights, measurements, meals, water, journal, chat }
  },

  saveWeight: (weightKg, date = todayStr()) =>
    upsertByDate('weight_logs', { log_date: date, weight_kg: weightKg }),

  saveMeasurement: (values, date = todayStr()) =>
    upsertByDate('measurements', { log_date: date, ...values }),

  addMeal: (meal) =>
    insert('meals', {
      log_date: meal.log_date || todayStr(),
      meal_slot: meal.meal_slot || 'Öğün',
      note: meal.note || '',
      kcal: Math.round(meal.kcal || 0),
      protein_g: meal.protein || 0,
      carb_g: meal.carb || 0,
      fat_g: meal.fat || 0,
      items: meal.items || [],
      source: meal.source || 'manuel',
    }),

  deleteMeal: (id) => remove('meals', id),

  addWater: (amountMl, date = todayStr()) =>
    insert('water_logs', { log_date: date, amount_ml: amountMl, logged_at: new Date().toISOString() }),

  deleteWater: (id) => remove('water_logs', id),

  saveJournal: (values, date = todayStr()) => upsertByDate('journal', { log_date: date, ...values }),

  addChatMessage: (role, content) =>
    insert('chat_messages', { role, content, created_at: new Date().toISOString() }),

  clearChat: async () => {
    if (remoteActive()) {
      const { error } = await supabase.from('chat_messages').delete().eq('profile_id', PROFILE.id)
      if (!error) return { error: null }
      fallbackToLocal(`Sohbet silinemedi: ${error.message}`, { persist: isDefinite(error) })
    }
    return lsWrite('chat_messages', [])
  },

  status: () => ({ ...remoteState }),
}
