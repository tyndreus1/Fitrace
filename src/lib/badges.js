export const BADGE_DEFS = [
  { key: 'first_log', label: 'İlk Adım', desc: 'İlk kilo kaydını ekledin', icon: '🌱' },
  { key: 'streak_3', label: 'Isınıyoruz', desc: '3 gün üst üste su hedefine ulaştın', icon: '🔥' },
  { key: 'streak_7', label: 'Bir Hafta Tam Gaz', desc: '7 gün üst üste su hedefine ulaştın', icon: '⚡' },
  { key: 'streak_30', label: 'Demir İrade', desc: '30 gün üst üste su hedefine ulaştın', icon: '🏆' },
  { key: 'water_100l', label: 'Su Perisi', desc: 'Toplam 100 litre su içtin', icon: '💧' },
  { key: 'weight_5', label: 'İlk 5', desc: '5 kg verdin', icon: '🎯' },
  { key: 'weight_10', label: 'Çift Hane', desc: '10 kg verdin', icon: '🥇' },
  { key: 'measure_5', label: 'Metre Ustası', desc: '5 ölçüm kaydı ekledin', icon: '📏' },
  { key: 'consistent_14', label: 'Tutarlılık', desc: '14 gün boyunca kilonu kaydettin', icon: '📅' },
  { key: 'race_lead', label: 'Liderlik', desc: 'Yarışta öne geçtin', icon: '👑' },
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
