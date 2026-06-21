import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTrackerData } from '../lib/useTrackerData'
import { computeWaterStreak, weightLostKg, latestWeight } from '../lib/stats'
import { calcBmi } from '../lib/bmi'

export default function MotivationBanner() {
  const { profile, opponent } = useAuth()
  const me = useTrackerData(profile.id)
  const them = useTrackerData(opponent?.id)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(false)

  const meReady = !me.loading
  const themReady = !them.loading || !opponent

  useEffect(() => {
    if (!opponent || !meReady || !themReady) return

    const meStats = {
      name: profile.display_name,
      weightLostKg: weightLostKg(me.weightLogs),
      waterStreak: computeWaterStreak(me.waterLogs, profile.water_goal_ml),
      bmi: calcBmi(latestWeight(me.weightLogs), profile.height_cm),
    }
    const theirStats = {
      name: opponent.display_name,
      weightLostKg: weightLostKg(them.weightLogs),
      waterStreak: computeWaterStreak(them.waterLogs, opponent.water_goal_ml),
      bmi: calcBmi(latestWeight(them.weightLogs), opponent.height_cm),
    }

    let cancelled = false
    setMessage(null)
    setError(false)

    fetch('/.netlify/functions/motivate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ me: meStats, opponent: theirStats }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          if (data.message) setMessage(data.message)
          else setError(true)
        }
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.id, meReady, themReady])

  if (!opponent || error) return null

  return (
    <div className="card p-4 flex items-start gap-3" style={{ borderColor: profile.color }}>
      <span className="text-2xl">✨</span>
      {message ? (
        <p className="text-sm">{message}</p>
      ) : (
        <p className="text-sm text-[var(--text-dim)]">Thinking of something motivating to say…</p>
      )}
    </div>
  )
}
