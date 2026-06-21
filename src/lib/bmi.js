export function calcBmi(weightKg, heightCm) {
  if (!weightKg || !heightCm) return null
  const heightM = heightCm / 100
  return weightKg / (heightM * heightM)
}

export function bmiLost(weightLostKg, heightCm) {
  if (!heightCm) return 0
  const heightM = heightCm / 100
  return weightLostKg / (heightM * heightM)
}
