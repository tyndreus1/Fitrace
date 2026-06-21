import { useAuth } from '../context/AuthContext'
import { useTrackerData } from '../lib/useTrackerData'
import { computeWaterStreak, weightLostKg, totalWaterMl, totalCmLost } from '../lib/stats'
import { bmiLost } from '../lib/bmi'

function RacerCard({ p, lost, bmiLostVal, cmLost, streak, water, isMe }) {
  return (
    <div className="card p-5 flex flex-col items-center gap-2" style={{ borderColor: isMe ? p.color : 'var(--border)' }}>
      <span className="text-4xl">{p.avatar}</span>
      <span className="font-medium" style={{ color: p.color }}>
        {p.display_name} {isMe && <span className="text-xs text-[var(--text-dim)]">(you)</span>}
      </span>
      <div className="text-center mt-2">
        <p className="text-2xl font-semibold">{lost.toFixed(1)} kg</p>
        <p className="text-xs text-[var(--text-dim)]">total lost</p>
      </div>
      <div className="flex gap-4 mt-2 text-sm">
        <div className="text-center">
          <p className="font-medium">{bmiLostVal.toFixed(1)}</p>
          <p className="text-xs text-[var(--text-dim)]">BMI lost</p>
        </div>
        <div className="text-center">
          <p className="font-medium">{cmLost.toFixed(1)} cm</p>
          <p className="text-xs text-[var(--text-dim)]">total lost</p>
        </div>
      </div>
      <div className="flex gap-4 mt-2 text-sm">
        <div className="text-center">
          <p className="font-medium">{streak}</p>
          <p className="text-xs text-[var(--text-dim)]">day streak</p>
        </div>
        <div className="text-center">
          <p className="font-medium">{(water / 1000).toFixed(1)}L</p>
          <p className="text-xs text-[var(--text-dim)]">total water</p>
        </div>
      </div>
    </div>
  )
}

export default function Race() {
  const { profile, opponent } = useAuth()
  const me = useTrackerData(profile.id)
  const them = useTrackerData(opponent?.id)

  if (!opponent) return <p className="text-[var(--text-dim)]">Opponent profile not found.</p>

  const myLost = weightLostKg(me.weightLogs)
  const theirLost = weightLostKg(them.weightLogs)
  const myBmiLost = bmiLost(myLost, profile.height_cm)
  const theirBmiLost = bmiLost(theirLost, opponent.height_cm)
  const myCmLost = totalCmLost(me.measurements)
  const theirCmLost = totalCmLost(them.measurements)
  const myStreak = computeWaterStreak(me.waterLogs, profile.water_goal_ml)
  const theirStreak = computeWaterStreak(them.waterLogs, opponent.water_goal_ml)
  const myWater = totalWaterMl(me.waterLogs)
  const theirWater = totalWaterMl(them.waterLogs)

  const total = myBmiLost + theirBmiLost
  const myPct = total > 0 ? Math.round((myBmiLost / total) * 100) : 50
  const leading = myBmiLost === theirBmiLost ? null : myBmiLost > theirBmiLost ? profile : opponent

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">🏁 Race</h2>
        <p className="text-[var(--text-dim)] text-sm">
          {leading ? `${leading.display_name} is currently leading!` : "It's a tie!"}
        </p>
      </div>

      <div className="card p-4">
        <p className="text-xs text-center text-[var(--text-dim)] mb-2">BMI Race</p>
        <div className="flex h-4 rounded-full overflow-hidden bg-[var(--bg-soft)]">
          <div style={{ width: `${myPct}%`, background: profile.color }} />
          <div style={{ width: `${100 - myPct}%`, background: opponent.color }} />
        </div>
        <div className="flex justify-between mt-2 text-xs text-[var(--text-dim)]">
          <span>{profile.display_name} {myPct}%</span>
          <span>{opponent.display_name} {100 - myPct}%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <RacerCard p={profile} lost={myLost} bmiLostVal={myBmiLost} cmLost={myCmLost} streak={myStreak} water={myWater} isMe />
        <RacerCard p={opponent} lost={theirLost} bmiLostVal={theirBmiLost} cmLost={theirCmLost} streak={theirStreak} water={theirWater} />
      </div>

      <div className="card p-4">
        <h3 className="font-medium mb-2">Today's Water Race</h3>
        {[
          { p: profile, ml: me.todaysWater, goal: profile.water_goal_ml },
          { p: opponent, ml: them.todaysWater, goal: opponent.water_goal_ml },
        ].map(({ p, ml, goal }) => (
          <div key={p.id} className="mb-2">
            <div className="flex justify-between text-xs mb-1">
              <span style={{ color: p.color }}>{p.avatar} {p.display_name}</span>
              <span className="text-[var(--text-dim)]">{ml} / {goal} ml</span>
            </div>
            <div className="h-2 rounded-full bg-[var(--bg-soft)] overflow-hidden">
              <div
                className="h-full"
                style={{ width: `${Math.min(100, (ml / goal) * 100)}%`, background: p.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
