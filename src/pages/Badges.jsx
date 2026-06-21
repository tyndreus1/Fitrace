import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTrackerData } from '../lib/useTrackerData'
import { BADGE_DEFS, computeEarnedKeys } from '../lib/badges'
import { computeWaterStreak, computeWeightLogStreak, weightLostKg, totalWaterMl } from '../lib/stats'
import { supabase } from '../lib/supabase'

export default function Badges() {
  const { profile } = useAuth()
  const { weightLogs, waterLogs, measurements, loading } = useTrackerData(profile.id)
  const [savedKeys, setSavedKeys] = useState(new Set())

  const progress = {
    weightLogs,
    waterLogs,
    measurements,
    totalWaterMl: totalWaterMl(waterLogs),
    weightLostKg: weightLostKg(weightLogs),
    waterStreak: computeWaterStreak(waterLogs, profile.water_goal_ml),
    weightLogStreak: computeWeightLogStreak(weightLogs),
  }
  const earnedKeys = computeEarnedKeys(progress)

  useEffect(() => {
    persistNewBadges()
  }, [loading])

  async function persistNewBadges() {
    if (loading) return
    const { data } = await supabase.from('badges_earned').select('badge_key').eq('profile_id', profile.id)
    const existing = new Set((data || []).map((d) => d.badge_key))
    setSavedKeys(existing)
    const toInsert = [...earnedKeys].filter((k) => !existing.has(k))
    if (toInsert.length) {
      await supabase
        .from('badges_earned')
        .insert(toInsert.map((badge_key) => ({ profile_id: profile.id, badge_key })))
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">🎖️ Badges</h2>
        <p className="text-[var(--text-dim)] text-sm">{earnedKeys.size} / {BADGE_DEFS.length} earned</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {BADGE_DEFS.map((b) => {
          const earned = earnedKeys.has(b.key)
          return (
            <div
              key={b.key}
              className={`card p-4 flex flex-col items-center gap-1 text-center ${earned ? '' : 'opacity-40'}`}
              style={{ borderColor: earned ? profile.color : 'var(--border)' }}
            >
              <span className="text-3xl">{b.icon}</span>
              <span className="font-medium text-sm">{b.label}</span>
              <span className="text-xs text-[var(--text-dim)]">{b.desc}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
