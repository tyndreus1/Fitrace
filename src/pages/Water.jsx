import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTrackerData } from '../lib/useTrackerData'
import { todayStr } from '../lib/dates'

const QUICK_AMOUNTS = [200, 250, 330, 500]

export default function Water() {
  const { profile } = useAuth()
  const { waterLogs, todaysWater, addWater, removeWaterLog, loading } = useTrackerData(profile.id)
  const [custom, setCustom] = useState('')
  const goal = profile.water_goal_ml
  const pct = Math.min(100, Math.round((todaysWater / goal) * 100))

  const todaysLogs = waterLogs
    .filter((w) => w.log_date === todayStr())
    .sort((a, b) => new Date(b.logged_at) - new Date(a.logged_at))

  async function addCustom() {
    const n = parseInt(custom, 10)
    if (!n || n <= 0) return
    await addWater(n)
    setCustom('')
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="card p-6 flex flex-col items-center gap-4">
        <div
          className="relative w-40 h-40 rounded-full flex items-center justify-center"
          style={{
            background: `conic-gradient(${profile.color} ${pct * 3.6}deg, var(--bg-soft) 0deg)`,
          }}
        >
          <div className="w-32 h-32 rounded-full bg-[var(--card)] flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold">{(todaysWater / 1000).toFixed(2)} L</span>
            <span className="text-xs text-[var(--text-dim)]">/ {(goal / 1000).toFixed(1)} L goal</span>
          </div>
        </div>
        <p className="text-sm text-[var(--text-dim)]">{pct}% complete</p>

        <div className="grid grid-cols-4 gap-2 w-full">
          {QUICK_AMOUNTS.map((ml) => (
            <button
              key={ml}
              onClick={() => addWater(ml)}
              className="rounded-xl py-3 text-sm font-medium border border-[var(--border)] hover:border-[var(--text-dim)]"
            >
              +{ml} ml
            </button>
          ))}
        </div>

        <div className="flex gap-2 w-full">
          <input
            type="number"
            placeholder="custom ml"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            className="flex-1 rounded-lg bg-[var(--bg-soft)] border border-[var(--border)] px-3 py-2 outline-none"
          />
          <button
            onClick={addCustom}
            className="rounded-lg px-4 py-2 font-medium text-white"
            style={{ background: profile.color }}
          >
            Add
          </button>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="font-medium mb-3">Today's entries</h3>
        {loading && <p className="text-[var(--text-dim)] text-sm">Loading…</p>}
        {!loading && todaysLogs.length === 0 && (
          <p className="text-[var(--text-dim)] text-sm">No entries yet.</p>
        )}
        <ul className="flex flex-col gap-2">
          {todaysLogs.map((w) => (
            <li
              key={w.id}
              className="flex items-center justify-between text-sm border-b border-[var(--border)] last:border-0 pb-2 last:pb-0"
            >
              <span>💧 {w.amount_ml} ml</span>
              <span className="text-[var(--text-dim)]">
                {new Date(w.logged_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <button onClick={() => removeWaterLog(w.id)} className="text-[var(--text-dim)] hover:text-red-400">
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
