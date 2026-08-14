import { PROFILE } from './config'

// Mifflin-St Jeor bazal metabolizma hızı
export function bmr(weightKg, heightCm = PROFILE.heightCm, age = PROFILE.age, gender = PROFILE.gender) {
  if (!weightKg) return null
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  return gender === 'male' ? base + 5 : base - 161
}

// Haftada 3-4 gün ağırlık + normal günlük hareket
export const ACTIVITY_FACTOR = 1.45

export function tdee(weightKg) {
  const b = bmr(weightKg)
  return b ? Math.round(b * ACTIVITY_FACTOR) : null
}

// Kas ve sağlıklı doku kazanımı için ılımlı kalori fazlası.
export const SURPLUS_KCAL = 350

/**
 * Günlük hedefler. Kilo arttıkça hedefler de kendiliğinden yukarı kayar.
 * protein: 2.2 g/kg — yağ değil kas kazanmak için yüksek tutuluyor
 * yağ:     toplam kalorinin %30'u — hormonal denge ve cilt için önemli
 * karbonhidrat: kalanı — antrenman performansı ve iştah için
 */
export function dailyTargets(weightKg) {
  const w = weightKg || PROFILE.startWeightKg
  const maintenance = tdee(w)
  const kcal = Math.round((maintenance + SURPLUS_KCAL) / 10) * 10
  const protein = Math.round(w * 2.2)
  const fat = Math.round((kcal * 0.3) / 9)
  const carb = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4))
  return {
    maintenance,
    kcal,
    protein,
    fat,
    carb,
    waterMl: PROFILE.waterGoalMl,
  }
}

export function calcBmi(weightKg, heightCm = PROFILE.heightCm) {
  if (!weightKg || !heightCm) return null
  const m = heightCm / 100
  return weightKg / (m * m)
}

export function bmiLabel(bmi) {
  if (bmi == null) return { text: '—', tone: 'dim' }
  if (bmi < 18.5) return { text: 'Zayıf aralık', tone: 'warn' }
  if (bmi < 25) return { text: 'Sağlıklı aralık', tone: 'good' }
  return { text: 'Kilolu aralık', tone: 'warn' }
}

// Hedefe kalan tahmini süre (hafta)
export function weeksToGoal(currentKg, goalKg = PROFILE.goalWeightKg) {
  if (!currentKg) return null
  const remaining = goalKg - currentKg
  if (remaining <= 0) return 0
  return Math.ceil(remaining / PROFILE.weeklyGainKg)
}

export function goalProgressPct(currentKg) {
  if (!currentKg) return 0
  const total = PROFILE.goalWeightKg - PROFILE.startWeightKg
  if (total <= 0) return 100
  const done = currentKg - PROFILE.startWeightKg
  return Math.max(0, Math.min(100, Math.round((done / total) * 100)))
}
