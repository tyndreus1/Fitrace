/**
 * Veri katmanı — "önce cihaz, bulut ayna".
 *
 * Tasarım kuralı: HER kayıt önce cihaza yazılır. Supabase yapılandırılmışsa
 * aynı kayıt ayrıca buluta da yazılır (en iyi çaba). Okurken ikisi birleştirilir.
 *
 * Neden böyle: daha önce kayıt yalnızca buluta gidiyordu; bulut o tabloyu
 * reddettiğinde kayıt cihaza düşüyor, ama sonraki açılışta bulut okuması
 * "başarılı ama boş" döndüğü için cihazdaki kaydın üstünü örtüyordu. Yani
 * kullanıcı kaydettiği şeyi bir daha göremiyordu. Artık bulut okuması cihazdaki
 * kaydı hiçbir koşulda gizleyemez.
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
const DELETED_KEY = LS_PREFIX + 'silinenler'

/**
 * Tabloların birleştirme anahtarı.
 * 'log_date' → günde tek kayıt (üstüne yazılır)
 * 'id'       → biriken kayıt (yan yana durur)
 */
const TABLE_KEY = {
  weight_logs: 'log_date',
  measurements: 'log_date',
  journal: 'log_date',
  meals: 'id',
  water_logs: 'id',
  chat_messages: 'id',
  tesekkur: 'id',
}

const TABLES = Object.keys(TABLE_KEY)

// Yerel kayda düşme kararı sayfa yenilenince UNUTULMAMALI.
const OFF_KEY = LS_PREFIX + 'bulut_kapali'

function safeGet(k) {
  try {
    return localStorage.getItem(k) || ''
  } catch {
    return ''
  }
}

const offReason = hasRemote ? safeGet(OFF_KEY) : ''

/**
 * 'yerel' → yalnızca cihaz; 'bulut' → cihaz + bulut aynası
 */
export const remoteState = {
  mode: hasRemote && !offReason ? 'bulut' : 'yerel',
  reason: hasRemote ? offReason : 'Supabase yapılandırılmamış; kayıtlar bu cihazda tutuluyor.',
  checked: !hasRemote || Boolean(offReason),
}

/**
 * @param persist Kalıcı mı? Veritabanının kesin reddettiği durumlar (eksik
 *   tablo/sütun, yetki) kalıcıdır. Geçici ağ kopukluğu değildir — yoksa bir kez
 *   bağlantı kesilince bulut eşitlemesi temelli kapanırdı.
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
  console.warn('Bulut eşitlemesi kapatıldı:', reason)
}

/** PostgREST hatalarının kodu olur; ağ hatalarının olmaz. */
function isDefinite(error) {
  return Boolean(error?.code)
}

/** Şema düzeltildikten sonra bulut eşitlemesini yeniden denemek için. */
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

function remoteActive() {
  return hasRemote && remoteState.mode === 'bulut'
}

// Bulut çağrıları hiçbir zaman kullanıcıyı bekletmemeli: ulaşılamayan ama
// yapılandırılmış bir bulut, zaman aşımı olmadan sonsuza kadar askıda kalabilir.
const CLOUD_OP_TIMEOUT_MS = 6000

function withTimeout(promise, ms = CLOUD_OP_TIMEOUT_MS) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('zaman aşımı')), ms)),
  ])
}

// ---- localStorage ----

function lsRead(table) {
  try {
    const raw = localStorage.getItem(LS_PREFIX + table)
    const rows = raw ? JSON.parse(raw) : []
    return Array.isArray(rows) ? rows : []
  } catch {
    return []
  }
}

function lsWrite(table, rows) {
  try {
    localStorage.setItem(LS_PREFIX + table, JSON.stringify(rows))
    return { error: null }
  } catch (err) {
    console.error('Kayıt cihaza yazılamadı:', err)
    return { error: 'Kayıt saklanamadı. Tarayıcı depolaması dolu olabilir.' }
  }
}

function deletedIds() {
  try {
    const raw = localStorage.getItem(DELETED_KEY)
    const ids = raw ? JSON.parse(raw) : []
    return new Set(Array.isArray(ids) ? ids : [])
  } catch {
    return new Set()
  }
}

function markDeleted(id) {
  const ids = deletedIds()
  ids.add(id)
  try {
    localStorage.setItem(DELETED_KEY, JSON.stringify([...ids]))
  } catch {
    // yoksay
  }
}

/** Cihaza yaz: aynı anahtardaki kaydın üstüne yazar, yoksa ekler. */
function lsUpsert(table, record) {
  const keyField = TABLE_KEY[table]
  const rows = lsRead(table)
  const idx = rows.findIndex((r) => String(r[keyField]) === String(record[keyField]))
  if (idx >= 0) rows[idx] = { ...rows[idx], ...record }
  else rows.push(record)
  return lsWrite(table, rows)
}

/**
 * Bulut ve cihaz kayıtlarını birleştirir. Aynı anahtardan iki kayıt varsa
 * daha yeni yazılan kazanır; diğerinin fazladan alanları da korunur.
 */
export function mergeRows(remote, local, keyField) {
  const stamp = (r) => new Date(r?.saved_at || r?.created_at || r?.logged_at || 0).getTime()
  const map = new Map()

  for (const r of remote || []) map.set(String(r[keyField]), r)

  for (const l of local || []) {
    const k = String(l[keyField])
    const existing = map.get(k)
    if (!existing) {
      map.set(k, l)
      continue
    }
    map.set(k, stamp(l) >= stamp(existing) ? { ...existing, ...l } : { ...l, ...existing })
  }

  const gone = deletedIds()
  return [...map.values()].filter((r) => !gone.has(r.id))
}

// ---- Bulut yoklaması ----

const PROBE_TIMEOUT_MS = 5000
let probePromise = null
let onReady = null

/** Yoklama bitince (bulut durumu kesinleşince) bir kez çağrılır. */
export function setOnRemoteReady(fn) {
  onReady = fn
}

/**
 * Yoklamayı ARKA PLANDA başlatır ve BEKLEMEDEN döner. Böylece açılışta okuma
 * yoklamayı beklemez; cihaz verisi anında gelir, yoklama bitince onReady ile
 * bir tazeleme tetiklenir.
 */
function kickProbe() {
  if (!hasRemote || remoteState.checked || probePromise) return
  probePromise = runProbe()
}

async function runProbe() {
  const probe = Promise.all(TABLES.map((t) => supabase.from(t).select('id').limit(1)))
  const timeout = new Promise((resolve) => setTimeout(() => resolve('zaman-asimi'), PROBE_TIMEOUT_MS))

  try {
    const results = await Promise.race([probe, timeout])

    if (results === 'zaman-asimi') {
      fallbackToLocal('Buluta zamanında ulaşılamadı; kayıtlar şimdilik bu cihazda.', { persist: false })
      return
    }

    const broken = results.map((r, i) => (r.error ? TABLES[i] : null)).filter(Boolean)
    if (broken.length) {
      fallbackToLocal(
        `Buluttaki şu tablolara ulaşılamadı: ${broken.join(', ')}. ` +
          'supabase/migration.sql çalıştırılınca bulut eşitlemesi kendiliğinden açılır.',
        { persist: results.some((r) => isDefinite(r.error)) },
      )
    }
  } catch (err) {
    fallbackToLocal(`Buluta bağlanılamadı (${String(err?.message || err)}).`, { persist: false })
  } finally {
    remoteState.checked = true
    // Bulut durumu netleşti; arayüz bir kez tazelensin (varsa cloud verisi
    // gelsin, uyarı şeridi güncellensin).
    if (onReady) {
      try {
        onReady()
      } catch {
        // yoksay
      }
    }
  }
}

// ---- Okuma / yazma ----

/**
 * Cihazda kalmış ama bulutta olmayan kayıtları buluta taşır.
 * Bulut sonradan açıldığında (ör. veritabanı uyandırıldığında) eski kayıtlar
 * da yukarı çıksın diye. En iyi çaba: başarısız olursa kimseyi bekletmez.
 */
function pushPending(table, rows) {
  const payload = rows.map((r) => { const c = { ...r }; delete c.saved_at; return c })
  Promise.resolve()
    .then(() => supabase.from(table).upsert(payload))
    .then(({ error }) => {
      if (error) console.warn(`"${table}" buluta taşınamadı:`, error.message)
      else console.info(`"${table}": ${payload.length} kayıt buluta taşındı`)
    })
    .catch((err) => console.warn(`"${table}" buluta taşınamadı:`, err?.message || err))
}

async function list(table, { orderBy = 'log_date', ascending = true } = {}) {
  const local = lsRead(table)
  let remote = []

  // Yoklama bitmeden buluta gitme: cihaz verisini anında döndür. Yoklama
  // bitince onReady zaten bir tazeleme tetikleyecek.
  if (remoteState.checked && remoteActive()) {
    let query = supabase.from(table).select('*').eq('profile_id', PROFILE.id)
    if (orderBy === 'log_date') query = query.gte('log_date', daysAgoStr(HISTORY_DAYS))
    try {
      const { data, error } = await withTimeout(query.order(orderBy, { ascending }))
      if (error) fallbackToLocal(`"${table}" okunamadı: ${error.message}`, { persist: isDefinite(error) })
      else remote = data || []
    } catch (err) {
      // Zaman aşımı/askıda kalma: geçici say, cihaz verisiyle devam et.
      fallbackToLocal(`"${table}" okunamadı: ${String(err?.message || err)}`, { persist: false })
    }
  }

  // Yalnızca cihazda kalmış kayıtları buluta taşı (bulut sonradan açıldıysa).
  if (remoteState.checked && remoteActive() && local.length) {
    const keyField = TABLE_KEY[table]
    const inCloud = new Set(remote.map((r) => String(r[keyField])))
    const pending = local.filter((r) => !inCloud.has(String(r[keyField])))
    if (pending.length) pushPending(table, pending)
  }

  // Bulut boş dönse bile cihazdaki kayıtlar asla gizlenmez.
  return mergeRows(remote, local, TABLE_KEY[table]).sort((a, b) => {
    const av = String(a[orderBy] ?? '')
    const bv = String(b[orderBy] ?? '')
    return ascending ? av.localeCompare(bv) : bv.localeCompare(av)
  })
}

/**
 * Önce cihaza yazar (bu asla atlanmaz), sonra buluta aynalar.
 * Bulut yazması başarısız olsa bile kayıt cihazda durduğu için kaybolmaz.
 */
async function save(table, row) {
  const keyField = TABLE_KEY[table]
  const record = {
    id: row.id || newId(),
    profile_id: PROFILE.id,
    created_at: row.created_at || new Date().toISOString(),
    ...row,
  }
  record.saved_at = new Date().toISOString()

  // Cihaz yazması kullanıcının beklediği tek şey. Bunu döndürüyoruz.
  const localResult = lsUpsert(table, record)

  // Bulut aynası arka planda, kullanıcıyı bekletmeden.
  if (remoteActive()) {
    const cloudRow = { ...record }
    delete cloudRow.saved_at
    const op =
      keyField === 'log_date'
        ? supabase.from(table).upsert(cloudRow, { onConflict: 'profile_id,log_date' })
        : supabase.from(table).insert(cloudRow)
    withTimeout(op)
      .then(({ error } = {}) => {
        if (error) fallbackToLocal(`"${table}" buluta yazılamadı: ${error.message}`, { persist: isDefinite(error) })
      })
      .catch((err) => fallbackToLocal(`"${table}" buluta yazılamadı: ${String(err?.message || err)}`, { persist: false }))
  }

  return localResult
}

async function remove(table, id) {
  markDeleted(id)
  const localResult = lsWrite(
    table,
    lsRead(table).filter((r) => r.id !== id),
  )

  if (remoteActive()) {
    withTimeout(supabase.from(table).delete().eq('id', id))
      .then(({ error } = {}) => {
        if (error) fallbackToLocal(`"${table}" silinemedi: ${error.message}`, { persist: isDefinite(error) })
      })
      .catch((err) => fallbackToLocal(`"${table}" silinemedi: ${String(err?.message || err)}`, { persist: false }))
  }

  return localResult
}

// ---- Alan bazlı API ----

export const store = {
  /** Cihazdaki kayıtları beklemeden döndürür (açılışta boş ekran olmasın). */
  loadLocal: () => {
    const gone = deletedIds()
    const pick = (t) => lsRead(t).filter((r) => !gone.has(r.id))
    return {
      weights: pick('weight_logs'),
      measurements: pick('measurements'),
      meals: pick('meals'),
      water: pick('water_logs'),
      journal: pick('journal'),
      chat: pick('chat_messages'),
    }
  },

  loadAll: async () => {
    // Yoklamayı arka planda başlat ama BEKLEME: okuma her zaman anında döner.
    kickProbe()
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

  saveWeight: (weightKg, date = todayStr()) => save('weight_logs', { log_date: date, weight_kg: weightKg }),

  saveMeasurement: (values, date = todayStr()) => save('measurements', { log_date: date, ...values }),

  addMeal: (meal) =>
    save('meals', {
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
    save('water_logs', { log_date: date, amount_ml: amountMl, logged_at: new Date().toISOString() }),

  deleteWater: (id) => remove('water_logs', id),

  saveJournal: (values, date = todayStr()) => save('journal', { log_date: date, ...values }),

  addChatMessage: (role, content) => save('chat_messages', { role, content }),

  addThanks: (content) => save('tesekkur', { content }),

  /** Gizli sayfa için: yaratıcıya bırakılan tüm teşekkür mesajları. */
  loadThanks: async () => {
    let remote = []
    if (remoteActive()) {
      try {
        const { data } = await withTimeout(
          supabase.from('tesekkur').select('*').eq('profile_id', PROFILE.id).order('created_at', { ascending: false }),
        )
        remote = data || []
      } catch {
        // yoksay
      }
    }
    return mergeRows(remote, lsRead('tesekkur'), 'id').sort((a, b) =>
      String(b.created_at).localeCompare(String(a.created_at)),
    )
  },

  clearChat: async () => {
    for (const row of lsRead('chat_messages')) markDeleted(row.id)
    const localResult = lsWrite('chat_messages', [])
    if (remoteActive()) {
      withTimeout(supabase.from('chat_messages').delete().eq('profile_id', PROFILE.id))
        .then(({ error } = {}) => {
          if (error) fallbackToLocal(`Sohbet silinemedi: ${error.message}`, { persist: isDefinite(error) })
        })
        .catch((err) => fallbackToLocal(`Sohbet silinemedi: ${String(err?.message || err)}`, { persist: false }))
    }
    return localResult
  },

  /** Tüm kayıtları tek bir nesne olarak verir (yedekleme için). */
  exportAll: () => ({
    surum: 1,
    tarih: new Date().toISOString(),
    profil: PROFILE.id,
    veriler: Object.fromEntries(TABLES.map((t) => [t, lsRead(t)])),
  }),

  /** Yedeği geri yükler; mevcut kayıtlarla birleştirir, üstüne yazmaz. */
  importAll: (dump) => {
    if (!dump || typeof dump !== 'object' || !dump.veriler) {
      return { error: 'Dosya tanınmadı. Bu uygulamadan alınmış bir yedek dosyası seç.' }
    }
    let eklenen = 0
    for (const table of TABLES) {
      const incoming = dump.veriler[table]
      if (!Array.isArray(incoming)) continue
      const merged = mergeRows(lsRead(table), incoming, TABLE_KEY[table])
      eklenen += Math.max(0, merged.length - lsRead(table).length)
      lsWrite(table, merged)
    }
    return { error: null, eklenen }
  },

  status: () => ({ ...remoteState }),
}
