import { useState } from 'react'
import { photo } from '../lib/media'

/**
 * public/ozge/ içindeki görselleri gösterir. Dosya yoksa çökmez;
 * yerine yumuşak bir degrade + emoji koyar.
 */
export default function Photo({
  name,
  src,
  alt,
  fallback = '✨',
  className = '',
  rounded = 'rounded-2xl',
  onFail,
  hideOnError = false,
  // Sayfanın altındaki görsellerde tembel yükleme, dosya yoksa hata olayının
  // hiç tetiklenmemesine yol açıyor; yedek içeriği göstermek için eager gerekir.
  eager = false,
}) {
  const meta = name ? photo(name) : { src, alt, fallback }
  const [failed, setFailed] = useState(false)

  if (!meta.src || failed) {
    if (hideOnError) return null
    return (
      <div
        className={`flex items-center justify-center ${rounded} ${className}`}
        style={{
          background:
            'linear-gradient(135deg, rgba(236,72,153,0.35), rgba(245,185,66,0.18) 60%, rgba(52,211,153,0.12))',
        }}
        aria-hidden="true"
      >
        <span className="text-3xl opacity-80">{meta.fallback || fallback}</span>
      </div>
    )
  }

  return (
    <img
      src={meta.src}
      alt={meta.alt || alt || ''}
      onError={() => {
        setFailed(true)
        onFail?.(meta.src)
      }}
      loading={eager ? 'eager' : 'lazy'}
      className={`object-cover ${rounded} ${className}`}
    />
  )
}
