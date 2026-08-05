// Vücut görselinin üzerindeki ölçüm noktaları (512x1536 kaynak görsele göre %).
export const BODY_POINTS = [
  { key: 'neck_cm', label: 'Boyun', short: 'Boyun', x: 50, y: 27.3 },
  { key: 'chest_cm', label: 'Göğüs', short: 'Göğüs', x: 50, y: 34.5 },
  { key: 'under_chest_cm', label: 'Göğüs altı', short: 'Göğüs altı', x: 50, y: 38.7 },
  { key: 'waist_cm', label: 'Bel (en ince)', short: 'Bel', x: 50, y: 42 },
  { key: 'belly_cm', label: 'Karın (göbek)', short: 'Karın', x: 50, y: 44.6 },
  { key: 'hips_cm', label: 'Kalça (en geniş)', short: 'Kalça', x: 50, y: 54, focus: true },
  { key: 'arm_cm', label: 'Kol (pazu)', short: 'Kol', x: 13.7, y: 30.6 },
  { key: 'wrist_cm', label: 'Bilek', short: 'Bilek', x: 9.8, y: 48.8 },
  { key: 'thigh_cm', label: 'Uyluk (üst bacak)', short: 'Uyluk', x: 37, y: 65.4, focus: true },
  { key: 'calf_cm', label: 'Baldır', short: 'Baldır', x: 37, y: 78.5, focus: true },
]

// Programın asıl büyütmeyi hedeflediği bölgeler
export const FOCUS_KEYS = BODY_POINTS.filter((p) => p.focus).map((p) => p.key)

export function bodyPointByKey(key) {
  return BODY_POINTS.find((p) => p.key === key)
}
