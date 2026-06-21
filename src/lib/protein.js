// Daily protein target to help preserve muscle during a calorie deficit.
// Uses Devine ideal body weight (height + gender) and, for higher body
// weights, an adjusted body weight so the target doesn't overshoot.
export function idealBodyWeightKg(heightCm, gender) {
  const heightIn = heightCm / 2.54
  const base = gender === 'male' ? 50 : 45.5
  return Math.max(base + 2.3 * (heightIn - 60), 30)
}

export function dailyProteinG(weightKg, heightCm, gender) {
  if (!weightKg || !heightCm) return null
  const ibw = idealBodyWeightKg(heightCm, gender)
  const referenceWeight = weightKg > ibw * 1.2 ? ibw + 0.4 * (weightKg - ibw) : weightKg
  const perKg = gender === 'male' ? 1.7 : 1.5
  return Math.round(referenceWeight * perKg)
}
