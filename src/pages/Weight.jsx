import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useAuth } from '../context/AuthContext'
import { useTrackerData } from '../lib/useTrackerData'
import { formatDay } from '../lib/dates'
import { BODY_POINTS, bodyPointByKey } from '../lib/bodyPoints'
import BodyDiagram from '../components/BodyDiagram'

const GENDER_BY_PROFILE = { witch: 'female', polar_bear: 'male' }

export default function Weight() {
  const { profile, updateHeight } = useAuth()
  const { weightLogs, measurements, addWeight, addMeasurement } = useTrackerData(profile.id)
  const [weightInput, setWeightInput] = useState('')
  const [heightInput, setHeightInput] = useState('')
  const [measureInputs, setMeasureInputs] = useState({})
  const [activeKey, setActiveKey] = useState(BODY_POINTS[0].key)
  const [tab, setTab] = useState('weight')
  const [msg, setMsg] = useState('')

  const chartData = weightLogs.map((w) => ({ date: formatDay(w.log_date), kg: w.weight_kg }))
  const gender = GENDER_BY_PROFILE[profile.id] || 'female'
  const filledKeys = new Set(Object.keys(measureInputs).filter((k) => measureInputs[k]))
  const activePoint = bodyPointByKey(activeKey)

  async function submitWeight(e) {
    e.preventDefault()
    const n = parseFloat(weightInput)
    if (!n) return
    await addWeight(n)
    setWeightInput('')
    setMsg('Weight saved ✓')
    setTimeout(() => setMsg(''), 2000)
  }

  async function submitHeight(e) {
    e.preventDefault()
    const n = parseFloat(heightInput)
    if (!n) return
    await updateHeight(n)
    setHeightInput('')
  }

  async function submitMeasurement(e) {
    e.preventDefault()
    const values = {}
    for (const f of BODY_POINTS) {
      if (measureInputs[f.key]) values[f.key] = parseFloat(measureInputs[f.key])
    }
    if (Object.keys(values).length === 0) return
    await addMeasurement(values)
    setMeasureInputs({})
    setMsg('Measurements saved ✓')
    setTimeout(() => setMsg(''), 2000)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2">
        <button
          onClick={() => setTab('weight')}
          className={`flex-1 py-2 rounded-lg border ${tab === 'weight' ? 'border-[var(--text)]' : 'border-[var(--border)] text-[var(--text-dim)]'}`}
        >
          ⚖️ Weight
        </button>
        <button
          onClick={() => setTab('measure')}
          className={`flex-1 py-2 rounded-lg border ${tab === 'measure' ? 'border-[var(--text)]' : 'border-[var(--border)] text-[var(--text-dim)]'}`}
        >
          📏 Measurements
        </button>
      </div>

      {msg && <p className="text-center text-sm text-green-400">{msg}</p>}

      {tab === 'weight' && (
        <>
          <form onSubmit={submitWeight} className="card p-5 flex gap-2">
            <input
              type="number"
              step="0.1"
              placeholder="Today's weight (kg)"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              className="flex-1 rounded-lg bg-[var(--bg-soft)] border border-[var(--border)] px-3 py-2 outline-none"
            />
            <button type="submit" className="rounded-lg px-4 py-2 font-medium text-white" style={{ background: profile.color }}>
              Save
            </button>
          </form>

          <div className="card p-4 h-72">
            <h3 className="font-medium mb-2">Weight Chart (90 days)</h3>
            {chartData.length === 0 ? (
              <p className="text-[var(--text-dim)] text-sm">No data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="90%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" stroke="var(--text-dim)" fontSize={11} />
                  <YAxis stroke="var(--text-dim)" fontSize={11} domain={['auto', 'auto']} />
                  <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)' }} />
                  <Line type="monotone" dataKey="kg" stroke={profile.color} strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}

      {tab === 'measure' && (
        <>
          {!profile.height_cm ? (
            <form onSubmit={submitHeight} className="card p-6 flex flex-col items-center gap-3">
              <span className="text-2xl">📏</span>
              <h3 className="font-medium">What's your height?</h3>
              <p className="text-xs text-[var(--text-dim)] text-center">
                We need this once to calculate your BMI and protein target.
              </p>
              <div className="flex gap-2 w-full max-w-xs">
                <input
                  type="number"
                  step="0.1"
                  autoFocus
                  placeholder="Height (cm)"
                  value={heightInput}
                  onChange={(e) => setHeightInput(e.target.value)}
                  className="flex-1 rounded-lg bg-[var(--bg-soft)] border border-[var(--border)] px-3 py-2 outline-none"
                />
                <button type="submit" className="rounded-lg px-4 py-2 font-medium text-white" style={{ background: profile.color }}>
                  Save
                </button>
              </div>
            </form>
          ) : (
            <>
              <form onSubmit={submitMeasurement} className="card p-5 flex flex-col items-center gap-4">
                <BodyDiagram
                  gender={gender}
                  activeKey={activeKey}
                  filledKeys={filledKeys}
                  onSelect={setActiveKey}
                  color={profile.color}
                />

                <div className="w-full flex flex-col items-center gap-2">
                  <span className="text-sm font-medium" style={{ color: profile.color }}>
                    {activePoint?.label}
                  </span>
                  <input
                    type="number"
                    step="0.1"
                    autoFocus
                    placeholder={`${activePoint?.label} (cm)`}
                    value={measureInputs[activeKey] || ''}
                    onChange={(e) => setMeasureInputs((m) => ({ ...m, [activeKey]: e.target.value }))}
                    className="w-48 text-center rounded-lg bg-[var(--bg-soft)] border border-[var(--border)] px-3 py-2 outline-none"
                  />
                </div>

                <div className="flex flex-wrap justify-center gap-1.5">
                  {BODY_POINTS.map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setActiveKey(p.key)}
                      className="text-xs rounded-full px-2.5 py-1 border"
                      style={{
                        borderColor: filledKeys.has(p.key) ? profile.color : 'var(--border)',
                        color: activeKey === p.key ? profile.color : 'var(--text-dim)',
                      }}
                    >
                      {p.label}
                      {filledKeys.has(p.key) ? ' ✓' : ''}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  className="rounded-lg px-6 py-2 font-medium text-white"
                  style={{ background: profile.color }}
                >
                  Save Measurements
                </button>
              </form>

              <p className="text-xs text-center text-[var(--text-dim)]">
                Height: {profile.height_cm} cm ·{' '}
                <button
                  type="button"
                  onClick={() => updateHeight(null)}
                  className="underline hover:text-[var(--text)]"
                >
                  change
                </button>
              </p>

              <div className="card p-4">
                <h3 className="font-medium mb-3">Measurement History</h3>
                {measurements.length === 0 ? (
                  <p className="text-[var(--text-dim)] text-sm">No data yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-[var(--text-dim)] text-left">
                          <th className="py-1">Date</th>
                          {BODY_POINTS.map((f) => (
                            <th key={f.key} className="py-1 px-2">{f.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[...measurements].reverse().map((m) => (
                          <tr key={m.id} className="border-t border-[var(--border)]">
                            <td className="py-1">{formatDay(m.log_date)}</td>
                            {BODY_POINTS.map((f) => (
                              <td key={f.key} className="py-1 px-2">{m[f.key] ?? '—'}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
