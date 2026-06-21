export const BADGE_DEFS = [
  { key: 'first_log', label: 'First Step', desc: 'Logged your first weight entry', icon: '🌱' },
  { key: 'streak_3', label: 'Warming Up', desc: 'Hit your water goal 3 days in a row', icon: '🔥' },
  { key: 'streak_7', label: 'Full Week', desc: 'Hit your water goal 7 days in a row', icon: '⚡' },
  { key: 'streak_30', label: 'Iron Will', desc: 'Hit your water goal 30 days in a row', icon: '🏆' },
  { key: 'water_100l', label: 'Water Sprite', desc: 'Drank 100 liters of water in total', icon: '💧' },
  { key: 'weight_5', label: 'First 5', desc: 'Lost 5 kg', icon: '🎯' },
  { key: 'weight_10', label: 'Double Digits', desc: 'Lost 10 kg', icon: '🥇' },
  { key: 'measure_5', label: 'Measure Master', desc: 'Logged 5 measurement entries', icon: '📏' },
  { key: 'consistent_14', label: 'Consistency', desc: 'Logged your weight for 14 days', icon: '📅' },
  { key: 'race_lead', label: 'Leadership', desc: 'Took the lead in the race', icon: '👑' },
]

export function badgeByKey(key) {
  return BADGE_DEFS.find((b) => b.key === key)
}

// progress: { weightLogs, waterLogs, measurements, totalWaterMl, weightLostKg, waterStreak, weightLogStreak }
export function computeEarnedKeys(progress) {
  const earned = new Set()
  if (progress.weightLogs.length >= 1) earned.add('first_log')
  if (progress.waterStreak >= 3) earned.add('streak_3')
  if (progress.waterStreak >= 7) earned.add('streak_7')
  if (progress.waterStreak >= 30) earned.add('streak_30')
  if (progress.totalWaterMl >= 100000) earned.add('water_100l')
  if (progress.weightLostKg >= 5) earned.add('weight_5')
  if (progress.weightLostKg >= 10) earned.add('weight_10')
  if (progress.measurements.length >= 5) earned.add('measure_5')
  if (progress.weightLogStreak >= 14) earned.add('consistent_14')
  return earned
}
