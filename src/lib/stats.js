import { daysAgoStr, todayStr } from './dates'
import { BODY_POINTS, FOCUS_KEYS } from './bodyPoints'
import { emptyTotal } from './foodDb'

export function latestWeight(weightLogs) {
  if (!weightLogs?.length) return null
  const sorted = [...weightLogs].sort((a, b) => b.log_date.localeCompare(a.log_date))
  return sorted[0].weight_kg
}

export function firstWeight(weightLogs) {
  if (!weightLogs?.length) return null
  const sorted = [...weightLogs].sort((a, b) => a.log_date.localeCompare(b.log_date))
  return sorted[0].weight_kg
}

/** Kilo alma programı olduğu için "kazanılan" kiloyu takip ediyoruz. */
export function weightGainedKg(weightLogs) {
  const first = firstWeight(weightLogs)
  const last = latestWeight(weightLogs)
  if (first == null || last == null) return 0
  return +(last - first).toFixed(1)
}

/** Son 7 günün ortalaması ile ondan önceki 7 günün ortalaması arasındaki fark. */
export function weeklyTrendKg(weightLogs) {
  if (!weightLogs?.length) return null
  const recent = weightLogs.filter((w) => w.log_date >= daysAgoStr(6))
  const previous = weightLogs.filter((w) => w.log_date < daysAgoStr(6) && w.log_date >= daysAgoStr(13))
  if (!recent.length || !previous.length) return null
  const avg = (arr) => arr.reduce((s, w) => s + w.weight_kg, 0) / arr.length
  return +(avg(recent) - avg(previous)).toFixed(2)
}

export function mealsOn(meals, date = todayStr()) {
  return (meals || []).filter((m) => m.log_date === date)
}

export function totalsFor(meals) {
  return (meals || []).reduce(
    (acc, m) => ({
      kcal: acc.kcal + (m.kcal || 0),
      protein: +(acc.protein + (m.protein_g || 0)).toFixed(1),
      carb: +(acc.carb + (m.carb_g || 0)).toFixed(1),
      fat: +(acc.fat + (m.fat_g || 0)).toFixed(1),
    }),
    emptyTotal(),
  )
}

export function waterOn(waterLogs, date = todayStr()) {
  return (waterLogs || []).filter((w) => w.log_date === date).reduce((s, w) => s + w.amount_ml, 0)
}

/** Ard arda kaç gün en az bir öğün kaydı girilmiş? */
export function loggingStreak(meals) {
  const days = new Set((meals || []).map((m) => m.log_date))
  let streak = 0
  for (let i = 0; i < 365; i++) {
    const day = daysAgoStr(i)
    if (days.has(day)) streak++
    else if (i === 0) continue // bugün henüz girilmemiş olabilir
    else break
  }
  return streak
}

export function waterStreak(waterLogs, goalMl) {
  const byDay = {}
  for (const w of waterLogs || []) byDay[w.log_date] = (byDay[w.log_date] || 0) + w.amount_ml
  let streak = 0
  for (let i = 0; i < 365; i++) {
    const day = daysAgoStr(i)
    if ((byDay[day] || 0) >= goalMl) streak++
    else if (i === 0) continue
    else break
  }
  return streak
}

/** Protein hedefinin tutturulduğu gün sayısı. */
export function proteinHitDays(meals, targetG) {
  const byDay = {}
  for (const m of meals || []) byDay[m.log_date] = (byDay[m.log_date] || 0) + (m.protein_g || 0)
  return Object.values(byDay).filter((v) => v >= targetG).length
}

function sortedMeasurements(measurements) {
  return [...(measurements || [])].sort((a, b) => a.log_date.localeCompare(b.log_date))
}

/** Her bölge için ilk ve son ölçüm arasındaki değişim (cm). */
export function measurementChanges(measurements) {
  const sorted = sortedMeasurements(measurements)
  if (sorted.length < 2) return []
  return BODY_POINTS.map((p) => {
    const firstRow = sorted.find((m) => m[p.key] != null)
    const lastRow = [...sorted].reverse().find((m) => m[p.key] != null)
    if (!firstRow || !lastRow || firstRow === lastRow) return null
    return {
      key: p.key,
      label: p.label,
      from: firstRow[p.key],
      to: lastRow[p.key],
      delta: +(lastRow[p.key] - firstRow[p.key]).toFixed(1),
      focus: Boolean(p.focus),
    }
  }).filter(Boolean)
}

/** Kalça + uyluk + baldırda toplam kaç cm kazanılmış? */
export function focusCmGained(measurements) {
  return +measurementChanges(measurements)
    .filter((c) => FOCUS_KEYS.includes(c.key))
    .reduce((sum, c) => sum + c.delta, 0)
    .toFixed(1)
}

export function latestMeasurement(measurements) {
  const sorted = sortedMeasurements(measurements)
  return sorted.length ? sorted[sorted.length - 1] : null
}

export function journalOn(journal, date = todayStr()) {
  return (journal || []).find((j) => j.log_date === date) || null
}
