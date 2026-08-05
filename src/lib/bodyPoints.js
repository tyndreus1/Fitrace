/**
 * Ölçüm noktaları — `public/ozge/olcum.png` şemasındaki etiketlerle birebir aynı.
 *
 * x / y değerleri görselin genişlik ve yüksekliğine oranla yüzdedir; şemanın
 * üzerindeki mavi hedef noktalarının merkezine denk gelir.
 */
export const BODY_POINTS = [
  { key: 'neck_cm', label: 'Boyun', short: 'Boyun', x: 49.2, y: 22.0 },
  { key: 'shoulders_cm', label: 'Omuzlar', short: 'Omuz', x: 63.6, y: 25.6 },
  { key: 'chest_cm', label: 'Göğüs', short: 'Göğüs', x: 49.0, y: 33.1 },
  { key: 'arm_cm', label: 'Pazı', short: 'Pazı', x: 34.6, y: 34.3 },
  { key: 'waist_cm', label: 'Bel', short: 'Bel', x: 49.0, y: 44.5 },
  { key: 'hips_cm', label: 'Kalça', short: 'Kalça', x: 48.7, y: 52.4, focus: true },
  { key: 'thigh_cm', label: 'Üst bacak', short: 'Üst bacak', x: 59.8, y: 65.0, focus: true },
  { key: 'calf_cm', label: 'Alt baldır', short: 'Baldır', x: 59.5, y: 80.6, focus: true },
]

// Şema görselinin en-boy oranı (genişlik / yükseklik)
export const DIAGRAM_RATIO = '1352 / 1985'

// Programın asıl büyütmeyi hedeflediği bölgeler
export const FOCUS_KEYS = BODY_POINTS.filter((p) => p.focus).map((p) => p.key)

export function bodyPointByKey(key) {
  return BODY_POINTS.find((p) => p.key === key)
}
