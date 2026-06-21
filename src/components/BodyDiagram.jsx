import { BODY_POINTS } from '../lib/bodyPoints'

export default function BodyDiagram({ gender, activeKey, filledKeys, onSelect, color }) {
  const img = gender === 'male' ? '/body/male.png' : '/body/female.png'

  return (
    <div className="relative mx-auto" style={{ width: 220, aspectRatio: '512 / 1536' }}>
      <img src={img} alt="" className="absolute inset-0 w-full h-full pointer-events-none select-none" draggable={false} />
      {BODY_POINTS.map((p) => {
        const isActive = activeKey === p.key
        const isFilled = filledKeys?.has(p.key)
        return (
          <button
            key={p.key}
            type="button"
            onClick={() => onSelect(p.key)}
            title={p.label}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-all"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: isActive ? 22 : 14,
              height: isActive ? 22 : 14,
              background: isActive ? color : isFilled ? color : 'rgba(255,255,255,0.35)',
              boxShadow: isActive
                ? `0 0 0 6px ${color}55, 0 0 16px 4px ${color}`
                : isFilled
                  ? `0 0 0 3px ${color}33`
                  : 'none',
              border: '2px solid rgba(255,255,255,0.8)',
            }}
          />
        )
      })}
    </div>
  )
}
