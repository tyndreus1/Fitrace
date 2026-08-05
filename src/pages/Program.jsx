import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MEAL_PLAN, NUTRITION_RULES, SHOPPING_LIST, planDayTotals, todaysPlan } from '../lib/mealPlan'
import { TRAINING_RULES, WORKOUT_WEEK, todaysWorkout } from '../lib/workout'
import { useData } from '../context/contexts'
import Photo from '../components/Photo'

function Tabs({ value, onChange }) {
  const tabs = [
    { key: 'beslenme', label: '🍽️ Beslenme' },
    { key: 'antrenman', label: '🏋️‍♀️ Antrenman' },
    { key: 'market', label: '🛒 Market' },
  ]
  return (
    <div className="flex gap-2">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`btn flex-1 text-xs sm:text-sm ${value === t.key ? 'btn-primary' : 'btn-ghost'}`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

function Rules({ rules }) {
  return (
    <div className="flex flex-col gap-2.5">
      {rules.map((r) => (
        <div key={r.title} className="card p-3.5 flex gap-3">
          <span className="text-lg">{r.icon}</span>
          <div>
            <p className="text-sm font-medium">{r.title}</p>
            <p className="text-xs text-[var(--text-dim)] leading-relaxed mt-0.5">{r.text}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function NutritionTab() {
  const { targets } = useData()
  const [openDay, setOpenDay] = useState(todaysPlan().index)

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl">
        <Photo name="food" className="w-full h-28" rounded="rounded-2xl" />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(23,16,26,0.94)] to-transparent" />
        <div className="absolute bottom-3 left-4">
          <h3 className="font-semibold pearl-text">Haftalık beslenme programı</h3>
          <p className="text-[11px] text-[var(--text-dim)]">
            Günlük hedef: {targets.kcal} kcal · {targets.protein} g protein
          </p>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="font-medium text-sm mb-2">Neden bu hedefler?</h3>
        <p className="text-xs text-[var(--text-dim)] leading-relaxed">
          Vücudun bugünkü kilonda dinlenme ve günlük hareketle yaklaşık{' '}
          <strong className="text-[var(--text)]">{targets.maintenance} kalori</strong> harcıyor. Kas yapabilmek için
          bunun üstüne ılımlı bir fazla ekliyoruz →{' '}
          <strong className="text-[var(--pink-soft)]">{targets.kcal} kalori</strong>. Protein hedefi{' '}
          <strong className="text-[var(--mint)]">{targets.protein} g</strong>; bu kadar protein olmadan fazla kalori
          kastan çok yağa gider. Yağ {targets.fat} g (hormonal denge ve cilt için önemli), karbonhidrat {targets.carb} g
          (antrenman enerjisi).
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {MEAL_PLAN.map((day, idx) => {
          const totals = planDayTotals(day)
          const isOpen = openDay === idx
          const isToday = todaysPlan().index === idx
          return (
            <div key={day.name} className="card overflow-hidden">
              <button
                onClick={() => setOpenDay(isOpen ? -1 : idx)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div>
                  <p className="text-sm font-medium">
                    {day.name}
                    {isToday && <span className="chip chip-on ml-2 text-[10px]">bugün</span>}
                  </p>
                  <p className="text-[11px] text-[var(--text-dim)]">{day.theme}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[var(--pink-soft)]">{totals.kcal} kcal</p>
                  <p className="text-[11px] text-[var(--mint)]">{totals.protein} g protein</p>
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 flex flex-col gap-3 fade-up">
                  {day.meals.map((meal) => (
                    <div key={meal.title + meal.time} className="border-l-2 border-[var(--border)] pl-3">
                      <div className="flex items-baseline justify-between">
                        <p className="text-sm font-medium">
                          <span className="text-[var(--text-dim)] text-xs mr-2">{meal.time}</span>
                          {meal.title}
                        </p>
                        <span className="text-[11px] text-[var(--text-dim)]">
                          {meal.kcal} kcal · {meal.protein} g
                        </span>
                      </div>
                      <ul className="mt-1 flex flex-col gap-0.5">
                        {meal.items.map((item) => (
                          <li key={item} className="text-xs text-[var(--text-dim)]">
                            • {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  {day.tip && (
                    <p className="text-xs text-[var(--pink-soft)] bg-[rgba(236,72,153,0.08)] rounded-xl p-3">
                      💡 {day.tip}
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <h3 className="font-medium text-sm mt-1">Altın kurallar</h3>
      <Rules rules={NUTRITION_RULES} />
    </>
  )
}

function WorkoutTab() {
  const [openDay, setOpenDay] = useState(todaysWorkout().index)

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl">
        <Photo name="workout" className="w-full h-28" rounded="rounded-2xl" />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(23,16,26,0.94)] to-transparent" />
        <div className="absolute bottom-3 left-4">
          <h3 className="font-semibold pearl-text">Haftalık antrenman</h3>
          <p className="text-[11px] text-[var(--text-dim)]">Kalça ve bacak öncelikli hipertrofi</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {WORKOUT_WEEK.map((day, idx) => {
          const isOpen = openDay === idx
          const isToday = todaysWorkout().index === idx
          return (
            <div key={day.day} className="card overflow-hidden">
              <button
                onClick={() => setOpenDay(isOpen ? -1 : idx)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{day.icon}</span>
                  <div>
                    <p className="text-sm font-medium">
                      {day.day}
                      {isToday && <span className="chip chip-on ml-2 text-[10px]">bugün</span>}
                    </p>
                    <p className="text-[11px] text-[var(--text-dim)]">{day.focus}</p>
                  </div>
                </div>
                <span className="text-[var(--text-dim)] text-xs">{isOpen ? '▲' : '▼'}</span>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 flex flex-col gap-2 fade-up">
                  {day.exercises.map((exercise) => (
                    <div key={exercise.name} className="border-l-2 border-[var(--border)] pl-3">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-sm">{exercise.name}</p>
                        <span className="text-[11px] text-[var(--pink-soft)] whitespace-nowrap">
                          {exercise.sets} × {exercise.reps}
                        </span>
                      </div>
                      {exercise.note && <p className="text-[11px] text-[var(--text-dim)] mt-0.5">{exercise.note}</p>}
                    </div>
                  ))}
                  {day.homeAlt && (
                    <p className="text-xs text-[var(--text-dim)] bg-[var(--bg-soft)] rounded-xl p-3">
                      🏠 {day.homeAlt}
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <h3 className="font-medium text-sm mt-1">Antrenman kuralları</h3>
      <Rules rules={TRAINING_RULES} />
    </>
  )
}

function ShoppingTab() {
  return (
    <>
      <div className="card p-4">
        <h3 className="font-medium text-sm">Haftalık market listesi</h3>
        <p className="text-xs text-[var(--text-dim)] mt-1">
          Program bu malzemelerle dönüyor. Evde bunlar varsa "yiyecek bir şey yok" bahanesi kalmaz.
        </p>
      </div>
      {SHOPPING_LIST.map((group) => (
        <div key={group.group} className="card p-4">
          <h4 className="text-sm font-medium text-[var(--pink-soft)] mb-2">{group.group}</h4>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
            {group.items.map((item) => (
              <li key={item} className="text-xs text-[var(--text-dim)]">
                • {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  )
}

export default function Program() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('sekme') || 'beslenme'

  return (
    <div className="flex flex-col gap-4 fade-up">
      <Tabs value={tab} onChange={(t) => setParams({ sekme: t })} />
      {tab === 'beslenme' && <NutritionTab />}
      {tab === 'antrenman' && <WorkoutTab />}
      {tab === 'market' && <ShoppingTab />}
    </div>
  )
}
