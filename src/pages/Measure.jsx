import { useState } from 'react'
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useData } from '../context/contexts'
import { BODY_POINTS, bodyPointByKey } from '../lib/bodyPoints'
import { formatDay } from '../lib/dates'
import { measurementChanges, focusCmGained, latestMeasurement } from '../lib/stats'
import { PROFILE } from '../lib/config'
import BodyDiagram from '../components/BodyDiagram'

export default function Measure() {
  const { weights, measurements, saveMeasurement } = useData()
  const [tab, setTab] = useState('kilo')
  const [activeKey, setActiveKey] = useState('hips_cm')
  const [inputs, setInputs] = useState({})
  const [msg, setMsg] = useState('')

  const chartData = [...weights]
    .sort((a, b) => a.log_date.localeCompare(b.log_date))
    .map((w) => ({ date: formatDay(w.log_date), kg: w.weight_kg }))

  const changes = measurementChanges(measurements)
  const focusCm = focusCmGained(measurements)
  const last = latestMeasurement(measurements)
  const activePoint = bodyPointByKey(activeKey)
  const filledKeys = new Set(Object.keys(inputs).filter((k) => inputs[k]))

  async function submitMeasurement(e) {
    e.preventDefault()
    const values = {}
    for (const p of BODY_POINTS) {
      if (inputs[p.key]) values[p.key] = parseFloat(String(inputs[p.key]).replace(',', '.'))
    }
    if (!Object.keys(values).length) return
    await saveMeasurement(values)
    setInputs({})
    setMsg('Ölçüler kaydedildi 💗')
    setTimeout(() => setMsg(''), 2200)
  }

  return (
    <div className="flex flex-col gap-5 fade-up">
      <div>
        <h2 className="text-lg font-semibold">Kilo ve ölçüler</h2>
        <p className="text-sm text-[var(--text-dim)]">
          Tartı tek başına yanıltır. Asıl değişimi mezura gösterir.
        </p>
      </div>

      <div className="flex gap-2">
        {[
          { key: 'kilo', label: '⚖️ Kilo' },
          { key: 'olcu', label: '📏 Ölçü' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`btn flex-1 ${tab === t.key ? 'btn-primary' : 'btn-ghost'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {msg && <p className="text-center text-sm text-[var(--mint)]">{msg}</p>}

      {tab === 'kilo' && (
        <div className="card p-4">
          <h3 className="font-medium text-sm mb-2">Kilo grafiği</h3>
          {chartData.length === 0 ? (
            <p className="text-sm text-[var(--text-dim)]">
              Henüz kayıt yok. "Bugün" sayfasından kilonu girebilirsin.
            </p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" stroke="var(--text-dim)" fontSize={11} />
                  <YAxis stroke="var(--text-dim)" fontSize={11} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      color: 'var(--text)',
                    }}
                    formatter={(v) => [`${v} kg`, 'Kilo']}
                  />
                  <ReferenceLine
                    y={PROFILE.goalWeightKg}
                    stroke="var(--mint)"
                    strokeDasharray="4 4"
                    label={{ value: 'hedef', fill: 'var(--mint)', fontSize: 11, position: 'right' }}
                  />
                  <Line type="monotone" dataKey="kg" stroke="var(--pink)" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {tab === 'olcu' && (
        <>
          <form onSubmit={submitMeasurement} className="card p-4 flex flex-col items-center gap-4">
            <p className="text-xs text-[var(--text-dim)] text-center">
              Bir bölgeye dokun, mezura ölçünü gir. Sarı halkalı noktalar programın büyütmeyi hedeflediği yerler.
            </p>

            <BodyDiagram activeKey={activeKey} filledKeys={filledKeys} onSelect={setActiveKey} />

            <div className="flex flex-col items-center gap-2 w-full">
              <span className="text-sm font-medium text-[var(--pink-soft)]">{activePoint?.label}</span>
              <input
                type="number"
                step="0.1"
                inputMode="decimal"
                placeholder={last?.[activeKey] ? `son: ${last[activeKey]} cm` : 'cm'}
                value={inputs[activeKey] || ''}
                onChange={(e) => setInputs((m) => ({ ...m, [activeKey]: e.target.value }))}
                className="input w-40 text-center"
              />
            </div>

            <div className="flex flex-wrap justify-center gap-1.5">
              {BODY_POINTS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setActiveKey(p.key)}
                  className={`chip ${activeKey === p.key || filledKeys.has(p.key) ? 'chip-on' : ''}`}
                >
                  {p.short}
                  {filledKeys.has(p.key) ? ' ✓' : ''}
                </button>
              ))}
            </div>

            <button type="submit" className="btn btn-primary w-full">
              Ölçüleri kaydet
            </button>
          </form>

          {changes.length > 0 && (
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-sm">İlk ölçümden bu yana</h3>
                <span className="text-xs text-[var(--gold)]">
                  Kalça+bacak: {focusCm >= 0 ? '+' : ''}
                  {focusCm} cm
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {changes.map((c) => (
                  <div key={c.key} className="flex items-center gap-3 text-sm">
                    <span className={`flex-1 ${c.focus ? 'text-[var(--pink-soft)]' : ''}`}>
                      {c.label}
                      {c.focus ? ' ★' : ''}
                    </span>
                    <span className="text-[var(--text-dim)] text-xs">
                      {c.from} → {c.to} cm
                    </span>
                    <span
                      className="w-14 text-right font-medium"
                      style={{ color: c.delta > 0 ? 'var(--mint)' : c.delta < 0 ? 'var(--gold)' : 'var(--text-dim)' }}
                    >
                      {c.delta > 0 ? '+' : ''}
                      {c.delta}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-[var(--text-dim)] mt-3">
                ★ ile işaretli bölgelerde artış istiyoruz; bel ölçüsünün sabit kalması ise fazlanın kas olarak
                gittiğinin iyi bir göstergesi.
              </p>
            </div>
          )}

          {measurements.length > 0 && (
            <div className="card p-4">
              <h3 className="font-medium text-sm mb-3">Ölçüm geçmişi</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-[var(--text-dim)] text-left">
                      <th className="py-1 pr-2">Tarih</th>
                      {BODY_POINTS.map((p) => (
                        <th key={p.key} className="py-1 px-2 whitespace-nowrap">
                          {p.short}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...measurements]
                      .sort((a, b) => b.log_date.localeCompare(a.log_date))
                      .map((m) => (
                        <tr key={m.id} className="border-t border-[var(--border)]">
                          <td className="py-1.5 pr-2 whitespace-nowrap">{formatDay(m.log_date)}</td>
                          {BODY_POINTS.map((p) => (
                            <td key={p.key} className="py-1.5 px-2">
                              {m[p.key] ?? '—'}
                            </td>
                          ))}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
