import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useAuth } from '../context/AuthContext'
import { useTrackerData } from '../lib/useTrackerData'
import { formatDay } from '../lib/dates'

const FIELDS = [
  { key: 'waist_cm', label: 'Waist' },
  { key: 'chest_cm', label: 'Chest' },
  { key: 'hips_cm', label: 'Hips' },
  { key: 'arm_cm', label: 'Arm' },
  { key: 'thigh_cm', label: 'Thigh' },
  { key: 'neck_cm', label: 'Neck' },
  { key: 'body_fat_pct', label: 'Body fat %' },
]

export default function Weight() {
  const { profile } = useAuth()
  const { weightLogs, measurements, addWeight, addMeasurement, loading } = useTrackerData(profile.id)
  const [weightInput, setWeightInput] = useState('')
  const [measureInputs, setMeasureInputs] = useState({})
  const [tab, setTab] = useState('weight')
  const [msg, setMsg] = useState('')

  const chartData = weightLogs.map((w) => ({ date: formatDay(w.log_date), kg: w.weight_kg }))

  async function submitWeight(e) {
    e.preventDefault()
    const n = parseFloat(weightInput)
    if (!n) return
    await addWeight(n)
    setWeightInput('')
    setMsg('Weight saved ✓')
    setTimeout(() => setMsg(''), 2000)
  }

  async function submitMeasurement(e) {
    e.preventDefault()
    const values = {}
    for (const f of FIELDS) {
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
          <form onSubmit={submitMeasurement} className="card p-5 grid grid-cols-2 gap-3">
            {FIELDS.map((f) => (
              <input
                key={f.key}
                type="number"
                step="0.1"
                placeholder={f.label + ' (cm)'}
                value={measureInputs[f.key] || ''}
                onChange={(e) => setMeasureInputs((m) => ({ ...m, [f.key]: e.target.value }))}
                className="rounded-lg bg-[var(--bg-soft)] border border-[var(--border)] px-3 py-2 outline-none"
              />
            ))}
            <button
              type="submit"
              className="col-span-2 rounded-lg py-2 font-medium text-white"
              style={{ background: profile.color }}
            >
              Save Measurements
            </button>
          </form>

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
                      {FIELDS.map((f) => (
                        <th key={f.key} className="py-1 px-2">{f.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...measurements].reverse().map((m) => (
                      <tr key={m.id} className="border-t border-[var(--border)]">
                        <td className="py-1">{formatDay(m.log_date)}</td>
                        {FIELDS.map((f) => (
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
    </div>
  )
}
