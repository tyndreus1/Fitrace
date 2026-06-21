import { daysAgoStr, todayStr } from './dates'
import { BODY_POINTS } from './bodyPoints'

export function waterByDay(waterLogs) {
  const map = {}
  for (const w of waterLogs) {
    map[w.log_date] = (map[w.log_date] || 0) + w.amount_ml
  }
  return map
}

export function computeWaterStreak(waterLogs, goalMl) {
  const byDay = waterByDay(waterLogs)
  let streak = 0
  for (let i = 0; i < 365; i++) {
    const day = daysAgoStr(i)
    if ((byDay[day] || 0) >= goalMl) streak++
    else break
  }
  return streak
}

export function computeWeightLogStreak(weightLogs) {
  const days = new Set(weightLogs.map((w) => w.log_date))
  let streak = 0
  for (let i = 0; i < 365; i++) {
    const day = daysAgoStr(i)
    if (days.has(day)) streak++
    else if (i === 0) continue // allow today to be unlogged yet
    else break
  }
  return streak
}

export function weightLostKg(weightLogs) {
  if (weightLogs.length < 2) return 0
  const sorted = [...weightLogs].sort((a, b) => a.log_date.localeCompare(b.log_date))
  const first = sorted[0].weight_kg
  const last = sorted[sorted.length - 1].weight_kg
  return Math.max(0, first - last)
}

export function totalWaterMl(waterLogs) {
  return waterLogs.reduce((sum, w) => sum + w.amount_ml, 0)
}

export function latestWeight(weightLogs) {
  if (!weightLogs.length) return null
  const sorted = [...weightLogs].sort((a, b) => b.log_date.localeCompare(a.log_date))
  return sorted[0].weight_kg
}

export function todaysProgress(waterLogs, goalMl) {
  const today = todayStr()
  const ml = waterLogs.filter((w) => w.log_date === today).reduce((s, w) => s + w.amount_ml, 0)
  return { ml, pct: Math.min(100, Math.round((ml / goalMl) * 100)) }
}

export function totalCmLost(measurements) {
  if (measurements.length < 2) return 0
  const sorted = [...measurements].sort((a, b) => a.log_date.localeCompare(b.log_date))
  const first = sorted[0]
  const last = sorted[sorted.length - 1]
  let total = 0
  for (const p of BODY_POINTS) {
    if (first[p.key] != null && last[p.key] != null) {
      total += first[p.key] - last[p.key]
    }
  }
  return total
}
