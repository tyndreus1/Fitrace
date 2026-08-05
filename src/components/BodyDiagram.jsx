import { BODY_POINTS } from '../lib/bodyPoints'

export default function BodyDiagram({ activeKey, filledKeys, onSelect, color = 'var(--pink)' }) {
  return (
    <div className="relative mx-auto" style={{ width: 200, aspectRatio: '512 / 1536' }}>
      <img
        src="/body/female.png"
        alt=""
        className="absolute inset-0 w-full h-full pointer-events-none select-none"
        draggable={false}
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
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-all"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: isActive ? 22 : 14,
              height: isActive ? 22 : 14,
              background: isActive || isFilled ? color : 'rgba(255,255,255,0.35)',
              boxShadow: isActive
                ? `0 0 0 6px ${'rgba(236,72,153,0.30)'}, 0 0 16px 4px ${color}`
                : isFilled
                  ? '0 0 0 3px rgba(236,72,153,0.25)'
                  : p.focus
                    ? '0 0 0 3px rgba(245,185,66,0.30)'
                    : 'none',
              border: '2px solid rgba(255,255,255,0.85)',
            }}
          />
        )
      })}
    </div>
  )
}
