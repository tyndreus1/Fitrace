import { useState } from 'react'
import { BODY_POINTS, DIAGRAM_RATIO } from '../lib/bodyPoints'
import { photo } from '../lib/media'

/**
 * Ölçüm şeması. Zemin görseli (`public/ozge/olcum.png`) noktaları ve
 * etiketleri zaten üzerinde taşıyor; buradaki katman yalnızca seçili noktayı
 * parlatıp doldurulmuş olanları işaretliyor.
 *
 * Görsel yoksa şema yerine sade bir düğme listesi gösteriliyor — sayfa her
 * hâlükârda kullanılabilir kalıyor.
 */
export default function BodyDiagram({ activeKey, filledKeys, onSelect }) {
  const meta = photo('olcum')
  const [failed, setFailed] = useState(false)

  if (failed) return null

  return (
    // Şema görselinin zemini beyaz (siyah etiket yazıları için gerekli), o yüzden
    // koyu temanın içinde bilinçli bir "beyaz kart" gibi sunuluyor.
    <div
      className="relative mx-auto w-full rounded-2xl overflow-hidden bg-white"
      style={{
        maxWidth: 300,
        aspectRatio: DIAGRAM_RATIO,
        boxShadow: '0 8px 26px -14px rgba(236,72,153,0.75)',
      }}
    >
      <img
        src={meta.src}
        alt={meta.alt}
        onError={() => setFailed(true)}
        draggable={false}
        className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
      />
      {BODY_POINTS.map((p) => {
        const isActive = activeKey === p.key
        const isFilled = filledKeys?.has(p.key)
        return (
          <button
            key={p.key}
            type="button"
            onClick={() => onSelect(p.key)}
            title={p.label}
            aria-label={p.label}
            aria-pressed={isActive}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-all"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              // Dokunma alanı, altındaki basılı noktadan geniş
              width: 34,
              height: 34,
              background: isActive
                ? 'rgba(236,72,153,0.30)'
                : isFilled
                  ? 'rgba(52,211,153,0.22)'
                  : 'transparent',
              boxShadow: isActive
                ? '0 0 0 3px var(--pink), 0 0 18px 4px rgba(236,72,153,0.55)'
                : isFilled
                  ? '0 0 0 2px var(--mint)'
                  : 'none',
            }}
          />
        )
      })}
    </div>
  )
}
