/**
 * Veri katmanı.
 *
 * Supabase ortam değişkenleri tanımlıysa kayıtlar buluta yazılır (telefon +
 * bilgisayar senkron olur). Tanımlı değilse aynı API tarayıcının
 * localStorage'ını kullanır — yani uygulama hiçbir kurulum yapmadan da çalışır.
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
  } catch (err) {
    console.warn('Kayıt tarayıcıya yazılamadı:', err)
  }
}

// ---- Genel CRUD ----

async function list(table, { orderBy = 'log_date', ascending = true } = {}) {
  if (!hasRemote) {
    const rows = lsRead(table)
    return [...rows].sort((a, b) => {
      const av = a[orderBy] ?? ''
      const bv = b[orderBy] ?? ''
      return ascending ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
    })
  }
  let query = supabase.from(table).select('*').eq('profile_id', PROFILE.id)
  if (orderBy === 'log_date') query = query.gte('log_date', daysAgoStr(HISTORY_DAYS))
  const { data, error } = await query.order(orderBy, { ascending })
  if (error) {
    console.warn(`${table} okunamadı:`, error.message)
    return []
  }
  return data || []
}

async function insert(table, row) {
  const record = { ...row, profile_id: PROFILE.id }
  if (!hasRemote) {
    const rows = lsRead(table)
    const withId = { id: newId(), created_at: new Date().toISOString(), ...record }
    lsWrite(table, [...rows, withId])
    return { data: withId, error: null }
  }
  const { data, error } = await supabase.from(table).insert(record).select().single()
  if (error) console.warn(`${table} yazılamadı:`, error.message)
  return { data, error }
}

/** Aynı güne ait kaydı günceller, yoksa oluşturur. */
async function upsertByDate(table, row) {
  const record = { ...row, profile_id: PROFILE.id }
  if (!hasRemote) {
    const rows = lsRead(table)
    const idx = rows.findIndex((r) => r.log_date === record.log_date)
    if (idx >= 0) {
      rows[idx] = { ...rows[idx], ...record }
    } else {
      rows.push({ id: newId(), created_at: new Date().toISOString(), ...record })
    }
    lsWrite(table, rows)
    return { error: null }
  }
  const { error } = await supabase.from(table).upsert(record, { onConflict: 'profile_id,log_date' })
  if (error) console.warn(`${table} güncellenemedi:`, error.message)
  return { error }
}

async function remove(table, id) {
  if (!hasRemote) {
    lsWrite(
      table,
      lsRead(table).filter((r) => r.id !== id),
    )
    return { error: null }
  }
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) console.warn(`${table} silinemedi:`, error.message)
  return { error }
}

// ---- Alan bazlı API ----

export const store = {
  loadAll: async () => {
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
    if (!hasRemote) {
      lsWrite('chat_messages', [])
      return { error: null }
    }
    const { error } = await supabase.from('chat_messages').delete().eq('profile_id', PROFILE.id)
    return { error }
  },
}
