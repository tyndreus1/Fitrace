import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../context/contexts'
import { PROFILE } from '../lib/config'
import { greeting } from '../lib/dates'
import { affirmationOfTheDay, challengeOfTheWeek } from '../lib/motivation'
import { calcBmi, bmiLabel, goalProgressPct, weeksToGoal } from '../lib/nutrition'
import { weeklyTrendKg, weightGainedKg, loggingStreak } from '../lib/stats'
import { todaysPlan } from '../lib/mealPlan'
import { todaysWorkout } from '../lib/workout'
import Ring from '../components/Ring'
import Photo from '../components/Photo'

function Stat({ label, value, sub, tone = 'var(--pink-soft)' }) {
  return (
    <div className="card p-3.5 flex flex-col gap-0.5">
      <span className="text-[11px] text-[var(--text-dim)]">{label}</span>
      <span className="text-xl font-semibold" style={{ color: tone }}>
        {value}
      </span>
      {sub && <span className="text-[11px] text-[var(--text-dim)]">{sub}</span>}
    </div>
  )
}

export default function Dashboard() {
  const {
    currentWeight,
    targets,
    todaysTotals,
    todaysWater,
    weights,
    meals,
    saveWeight,
    addWater,
  } = useData()

  const hasWeightLog = (weights?.length || 0) > 0

  const [weightInput, setWeightInput] = useState('')
  const [saved, setSaved] = useState('')

  const bmi = calcBmi(currentWeight)
  const bmiInfo = bmiLabel(bmi)
  const gained = weightGainedKg(weights)
  const trend = weeklyTrendKg(weights)
  const streak = loggingStreak(meals)
  const pct = goalProgressPct(currentWeight)
  const weeks = weeksToGoal(currentWeight)
  const { plan } = todaysPlan()
  const { workout } = todaysWorkout()

  async function submitWeight(e) {
    e.preventDefault()
    const n = parseFloat(weightInput.replace(',', '.'))
    if (!n || n < 30 || n > 200) return
    await saveWeight(n)
    setWeightInput('')
    setSaved('Kaydedildi 💗')
    setTimeout(() => setSaved(''), 2000)
  }

  return (
    <div className="flex flex-col gap-5 fade-up">
      {/* Karşılama */}
      <div className="card card-glow p-4 flex items-center gap-3 overflow-hidden">
        <div className="flex-1">
          <p className="text-xs text-[var(--text-dim)]">{greeting()},</p>
          <h2 className="text-2xl font-semibold pearl-text">{PROFILE.name}</h2>
          <p className="text-xs text-[var(--text-dim)] mt-1">
            {hasWeightLog
              ? `Hedefe ${Math.max(0, +(PROFILE.goalWeightKg - currentWeight).toFixed(1))} kg kaldı`
              : 'Başlamak için bugünkü kilonu gir'}
          </p>
        </div>
        <Photo name="yuruyus" fit="contain" className="h-28 w-auto shrink-0" rounded="" />
      </div>

      {/* Günün notu */}
      <div className="card p-4 flex gap-3 items-start card-glow">
        <span className="text-xl">💌</span>
        <div>
          <p className="text-sm leading-relaxed">{affirmationOfTheDay()}</p>
          <p className="text-[11px] text-[var(--text-dim)] mt-1.5">Günün notu</p>
        </div>
      </div>

      {/* Bugünün hedef halkaları */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-sm">Bugünün hedefleri</h3>
          <Link to="/yemek" className="text-xs text-[var(--pink-soft)]">
            Öğün ekle →
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Ring value={todaysTotals.kcal} max={targets.kcal} label="Kalori" color="var(--pink)" />
          <Ring value={todaysTotals.protein} max={targets.protein} label="Protein (g)" color="var(--mint)" />
          <Ring value={todaysWater} max={targets.waterMl} label="Su (ml)" color="#60a5fa" />
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Photo name="su" fit="contain" className="h-16 w-auto shrink-0" rounded="" hideOnError eager />
          <div className="flex gap-2 flex-1">
            {[200, 330, 500].map((ml) => (
              <button key={ml} onClick={() => addWater(ml)} className="btn btn-ghost flex-1 text-xs py-2">
                +{ml} ml
              </button>
            ))}
          </div>
        </div>
        <p className="text-[11px] text-[var(--text-dim)] mt-3">
          Karbonhidrat {Math.round(todaysTotals.carb)} / {targets.carb} g · Yağ {Math.round(todaysTotals.fat)} /{' '}
          {targets.fat} g
        </p>
      </div>

      {/* Kilo girişi */}
      <form onSubmit={submitWeight} className="card p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm">Bugünkü kilon</h3>
          {saved && <span className="text-xs text-[var(--mint)]">{saved}</span>}
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            step="0.1"
            inputMode="decimal"
            placeholder={`örn. ${currentWeight}`}
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
            className="input flex-1"
          />
          <button type="submit" className="btn btn-primary px-5">
            Kaydet
          </button>
        </div>
        <p className="text-[11px] text-[var(--text-dim)]">
          En doğru sonuç için sabah, aç karnına ve tuvaletten sonra tart. Günlük oynamalar normaldir.
        </p>
      </form>

      {/* İstatistikler */}
      <div className="grid grid-cols-2 gap-3">
        <Stat
          label="Şu anki kilo"
          value={hasWeightLog ? `${currentWeight} kg` : '—'}
          sub={`Hedef ${PROFILE.goalWeightKg} kg`}
        />
        <Stat
          label="Toplam değişim"
          value={`${gained >= 0 ? '+' : ''}${gained} kg`}
          sub={`Başlangıç ${PROFILE.startWeightKg} kg`}
          tone={gained >= 0 ? 'var(--mint)' : 'var(--gold)'}
        />
        <Stat
          label="Vücut kitle indeksi"
          value={bmi ? bmi.toFixed(1) : '—'}
          sub={bmiInfo.text}
          tone={bmiInfo.tone === 'good' ? 'var(--mint)' : 'var(--gold)'}
        />
        <Stat
          label="Haftalık eğilim"
          value={trend == null ? '—' : `${trend > 0 ? '+' : ''}${trend} kg`}
          sub={trend == null ? 'iki hafta kayıt gerek' : 'son 7 gün ortalaması'}
          tone={trend == null ? 'var(--text-dim)' : trend > 0 ? 'var(--mint)' : 'var(--gold)'}
        />
      </div>

      {/* Hedefe ilerleme */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-sm">Hedefe ilerleme</h3>
          <span className="text-xs text-[var(--pink-soft)]">%{pct}</span>
        </div>
        <div className="h-3 rounded-full bg-[var(--bg-soft)] overflow-hidden">
          <div
            className="h-full pink-grad rounded-full"
            style={{ width: `${pct}%`, transition: 'width 0.6s ease' }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-[var(--text-dim)] mt-2">
          <span>{PROFILE.startWeightKg} kg</span>
          <span>
            {weeks === 0
              ? 'Hedefe ulaştın! 🎉'
              : weeks
                ? `Bu hızla ~${weeks} hafta kaldı`
                : 'Kayıt girdikçe hesaplanır'}
          </span>
          <span>{PROFILE.goalWeightKg} kg</span>
        </div>
      </div>

      {/* Bugünün planı */}
      <div className="grid sm:grid-cols-2 gap-3">
        <Link to="/program" className="card p-4 flex flex-col gap-1.5">
          <span className="text-lg">🍽️</span>
          <h3 className="font-medium text-sm">Bugünün menüsü</h3>
          <p className="text-xs text-[var(--text-dim)]">
            {plan.name} · {plan.theme}
          </p>
          <p className="text-xs text-[var(--pink-soft)] mt-1">
            {plan.meals[0].title}: {plan.meals[0].items[0]}
          </p>
        </Link>
        <Link to="/program?sekme=antrenman" className="card p-4 flex flex-col gap-1.5">
          <span className="text-lg">{workout.icon}</span>
          <h3 className="font-medium text-sm">Bugünün antrenmanı</h3>
          <p className="text-xs text-[var(--text-dim)]">{workout.focus}</p>
          <p className="text-xs text-[var(--pink-soft)] mt-1">{workout.exercises[0].name}</p>
        </Link>
      </div>

      {/* Haftanın görevi + seri */}
      <div className="card p-4 flex items-center gap-3">
        <span className="text-2xl">{challengeOfTheWeek().icon}</span>
        <div className="flex-1">
          <p className="text-sm font-medium">{challengeOfTheWeek().title}</p>
          <p className="text-xs text-[var(--text-dim)]">{challengeOfTheWeek().desc}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-[var(--gold)]">{streak}</p>
          <p className="text-[10px] text-[var(--text-dim)]">günlük seri</p>
        </div>
      </div>

      <p className="text-[11px] text-[var(--text-dim)] leading-relaxed text-center px-2">
        Bu uygulama kişisel takip içindir, tıbbi tavsiye yerine geçmez. Hızlı kilo kaybı sonrası kilo alma
        sürecinde bir hekim ya da diyetisyen takibi işini çok kolaylaştırır.
      </p>
    </div>
  )
}
