export const BADGE_DEFS = [
  { key: 'first_log', label: 'İlk Adım', desc: 'İlk kilo kaydını girdin', icon: '🌱' },
  { key: 'first_meal', label: 'Deftere Yazıldı', desc: 'İlk öğününü kaydettin', icon: '📝' },
  { key: 'streak_3', label: 'Isınma Turu', desc: '3 gün üst üste öğün kaydı', icon: '🔥' },
  { key: 'streak_7', label: 'Tam Bir Hafta', desc: '7 gün üst üste öğün kaydı', icon: '⚡' },
  { key: 'streak_30', label: 'Demir İrade', desc: '30 gün üst üste öğün kaydı', icon: '🏆' },
  { key: 'protein_7', label: 'Protein Avcısı', desc: '7 gün protein hedefini tutturdun', icon: '🥚' },
  { key: 'protein_30', label: 'Protein Ustası', desc: '30 gün protein hedefini tutturdun', icon: '🍗' },
  { key: 'water_7', label: 'Su Perisi', desc: '7 gün üst üste su hedefi', icon: '💧' },
  { key: 'gain_1', label: 'İlk Kilo', desc: '1 kg aldın', icon: '🎯' },
  { key: 'gain_3', label: 'Üç Kilo', desc: '3 kg aldın', icon: '🥈' },
  { key: 'gain_6', label: 'Hedefe Vardın', desc: '6 kg aldın', icon: '🥇' },
  { key: 'measure_5', label: 'Mezura Dostu', desc: '5 kez ölçü kaydı girdin', icon: '📏' },
  { key: 'curves_2', label: 'Form Geliyor', desc: 'Kalça/bacakta toplam 2 cm kazandın', icon: '🍑' },
  { key: 'curves_5', label: 'Belirgin Değişim', desc: 'Kalça/bacakta toplam 5 cm kazandın', icon: '💃' },
  { key: 'journal_7', label: 'Kendini Dinle', desc: '7 gün ruh hâli kaydı girdin', icon: '💗' },
]

export function badgeByKey(key) {
  return BADGE_DEFS.find((b) => b.key === key)
}

/**
 * Rozetler kayıtlardan türetilir; ayrı bir tabloya ihtiyaç yok.
 * progress: { weights, meals, measurements, journal, streak, waterStreak,
 *             proteinDays, gained, focusCm }
 */
export function computeEarnedKeys(p) {
  const earned = new Set()
  if (p.weights?.length) earned.add('first_log')
  if (p.meals?.length) earned.add('first_meal')
  if (p.streak >= 3) earned.add('streak_3')
  if (p.streak >= 7) earned.add('streak_7')
  if (p.streak >= 30) earned.add('streak_30')
  if (p.proteinDays >= 7) earned.add('protein_7')
  if (p.proteinDays >= 30) earned.add('protein_30')
  if (p.waterStreak >= 7) earned.add('water_7')
  if (p.gained >= 1) earned.add('gain_1')
  if (p.gained >= 3) earned.add('gain_3')
  if (p.gained >= 6) earned.add('gain_6')
  if (p.measurements?.length >= 5) earned.add('measure_5')
  if (p.focusCm >= 2) earned.add('curves_2')
  if (p.focusCm >= 5) earned.add('curves_5')
  if (p.journal?.length >= 7) earned.add('journal_7')
  return earned
}
