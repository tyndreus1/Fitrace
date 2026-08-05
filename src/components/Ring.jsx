/** Hedefe ne kadar yaklaşıldığını gösteren halka. */
export default function Ring({ value, max, label, unit = '', color = 'var(--pink)', size = 96 }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  const stroke = 8
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (pct / 100) * c

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={c}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-base font-semibold leading-none">{Math.round(value)}</span>
          <span className="text-[10px] text-[var(--text-dim)] mt-0.5">/ {Math.round(max)}{unit}</span>
        </div>
      </div>
      <span className="text-xs text-[var(--text-dim)]">{label}</span>
    </div>
  )
}
