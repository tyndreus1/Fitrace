/**
 * Görsel kataloğu.
 *
 * Dosyalar `public/ozge/` klasörüne konur ve buradaki isimlerle eşleşir.
 * Hepsi şeffaf zeminli çizim (PNG) olduğu için kırpılmadan, yumuşak bir
 * zeminin üstünde "figür" gibi gösterilirler.
 *
 * Bir dosya yoksa uygulama kırılmaz; `Photo` bileşeni yerine yedek
 * (degrade + emoji) koyar.
 */
export const PHOTOS = {
  // Ölçüm noktalarının işaretli olduğu tam boy şema
  olcum: { src: '/ozge/olcum.png', fallback: '📏', alt: 'Ölçü alma noktaları' },
  // Su içerken
  su: { src: '/ozge/su.png', fallback: '💧', alt: 'Su içen Özge' },
  // Yürüyüş / antrenman
  yuruyus: { src: '/ozge/yuruyus.png', fallback: '🚶‍♀️', alt: 'Yürüyüş yapan Özge' },
  // Duygu durumu bölümü için
  meditasyon: { src: '/ozge/meditasyon.png', fallback: '🧘‍♀️', alt: 'Meditasyon yapan Özge' },
  // Yemek günlüğü
  yemek: { src: '/ozge/yemek.png', fallback: '🍽️', alt: 'Yemek yiyen Özge' },
  // Uyku
  uyku: { src: '/ozge/uyku.png', fallback: '😴', alt: 'Uyuyan Özge' },
}

// Motivasyon galerisi: public/ozge/galeri-1.png ... galeri-8.png
export const GALLERY = Array.from({ length: 8 }, (_, i) => ({
  src: `/ozge/galeri-${i + 1}.png`,
  alt: `Motivasyon görseli ${i + 1}`,
}))

export function photo(name) {
  return PHOTOS[name] || { src: '', fallback: '✨', alt: '' }
}
