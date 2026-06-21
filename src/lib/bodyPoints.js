// Hotspot positions as percentages over the body illustration (512x1536 source images).
export const BODY_POINTS = [
  { key: 'neck_cm', label: 'Neck', x: 50, y: 27.3 },
  { key: 'chest_cm', label: 'Chest', x: 50, y: 34.5 },
  { key: 'under_chest_cm', label: 'Under Chest', x: 50, y: 38.7 },
  { key: 'belly_cm', label: 'Belly (widest)', x: 50, y: 44.6 },
  { key: 'waist_cm', label: 'Waist (belt)', x: 50, y: 42 },
  { key: 'hips_cm', label: 'Hips', x: 50, y: 54 },
  { key: 'arm_cm', label: 'Upper Arm', x: 13.7, y: 30.6 },
  { key: 'wrist_cm', label: 'Wrist', x: 9.8, y: 48.8 },
  { key: 'thigh_cm', label: 'Upper Thigh', x: 37, y: 65.4 },
  { key: 'calf_cm', label: 'Lower Leg', x: 37, y: 78.5 },
]

export function bodyPointByKey(key) {
  return BODY_POINTS.find((p) => p.key === key)
}
