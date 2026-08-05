/**
 * Görsel kataloğu.
 *
 * Dosyalar `public/ozge/` klasörüne konur ve buradaki isimlerle eşleşir.
 * Bir dosya yoksa uygulama kırılmaz; `Photo` bileşeni onun yerine
 * yedek (emoji + degrade) gösterir. Yani görselleri istediğin zaman,
 * istediğin sırayla ekleyebilirsin.
 */
export const PHOTOS = {
  login: { src: '/ozge/login.jpg', fallback: '🌸', alt: 'Giriş görseli' },
  avatar: { src: '/ozge/avatar.jpg', fallback: '💗', alt: 'Özge' },
  hero: { src: '/ozge/hero.jpg', fallback: '✨', alt: 'Kapak görseli' },
  goal: { src: '/ozge/hedef.jpg', fallback: '🎯', alt: 'Hedef görseli' },
  food: { src: '/ozge/yemek.jpg', fallback: '🍽️', alt: 'Beslenme görseli' },
  workout: { src: '/ozge/antrenman.jpg', fallback: '🏋️‍♀️', alt: 'Antrenman görseli' },
  skin: { src: '/ozge/cilt.jpg', fallback: '🧴', alt: 'Cilt bakımı görseli' },
}

// Motivasyon galerisi: public/ozge/galeri-1.jpg ... galeri-8.jpg
export const GALLERY = Array.from({ length: 8 }, (_, i) => ({
  src: `/ozge/galeri-${i + 1}.jpg`,
  alt: `Motivasyon görseli ${i + 1}`,
}))

export function photo(name) {
  return PHOTOS[name] || { src: '', fallback: '✨', alt: '' }
}
