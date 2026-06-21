import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useAuth } from '../context/AuthContext'
import { useTrackerData } from '../lib/useTrackerData'
import { formatDay } from '../lib/dates'
import { computeWaterStreak, latestWeight, weightLostKg, todaysProgress } from '../lib/stats'

function StatCard({ label, value, sub, color }) {
  return (
    <div className="card p-4 flex flex-col gap-1">
      <span className="text-xs text-[var(--text-dim)]">{label}</span>
      <span className="text-2xl font-semibold" style={{ color }}>{value}</span>
      {sub && <span className="text-xs text-[var(--text-dim)]">{sub}</span>}
    </div>
  )
}

export default function Dashboard() {
  const { profile } = useAuth()
  const { weightLogs, waterLogs, measurements, loading } = useTrackerData(profile.id)

  const streak = computeWaterStreak(waterLogs, profile.water_goal_ml)
  const lost = weightLostKg(weightLogs)
  const current = latestWeight(weightLogs)
  const water = todaysProgress(waterLogs, profile.water_goal_ml)
  const chartData = weightLogs.map((w) => ({ date: formatDay(w.log_date), kg: w.weight_kg }))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">
          Merhaba, {profile.display_name} {profile.avatar}
        </h2>
        <p className="text-[var(--text-dim)] text-sm">İşte güncel durumun.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Güncel Kilo" value={current ? `${current} kg` : '—'} color={profile.color} />
        <StatCard label="Toplam Kayıp" value={`${lost.toFixed(1)} kg`} color="#22c55e" />
        <StatCard label="Su Serisi" value={`${streak} gün`} sub="hedefi tutturma" color="#0ea5e9" />
        <StatCard label="Bugün Su" value={`%${water.pct}`} sub={`${water.ml} / ${profile.water_goal_ml} ml`} color={profile.color} />
      </div>

      <div className="card p-4 h-64">
        <h3 className="font-medium mb-2">Kilo Trendi</h3>
        {loading ? (
          <p className="text-[var(--text-dim)] text-sm">Yükleniyor…</p>
        ) : chartData.length === 0 ? (
          <p className="text-[var(--text-dim)] text-sm">Henüz veri yok. Kilo & Ölçü sekmesinden ekleyebilirsin.</p>
        ) : (
          <ResponsiveContainer width="100%" height="85%">
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

      <div className="card p-4">
        <h3 className="font-medium mb-2">Özet</h3>
        <p className="text-sm text-[var(--text-dim)]">
          {weightLogs.length} kilo kaydı · {measurements.length} ölçüm kaydı · {waterLogs.length} su kaydı
        </p>
      </div>
    </div>
  )
}
