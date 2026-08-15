import { useMemo, useState } from 'react'
import { useData } from '../context/contexts'
import { analyzeMeal } from '../lib/ai'
import { sumItems } from '../lib/foodDb'
import { formatDay, formatTime, todayStr, daysAgoStr } from '../lib/dates'
import { dailySummaries, weeklyReview } from '../lib/stats'
import Ring from '../components/Ring'
import Photo from '../components/Photo'

/** Son 7 günün özeti — hafta sonu değerlendirmesi için. */
function WeeklyReview() {
  const { meals, weights, targets } = useData()
  const r = useMemo(
    () => weeklyReview(meals, weights, targets.kcal, targets.protein),
    [meals, weights, targets],
  )
  if (!r) return null

  return (
    <div className="card p-4">
      <h3 className="font-medium text-sm mb-3">Bu haftanın değerlendirmesi</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xl font-semibold text-[var(--pink-soft)]">{r.avgKcal}</p>
          <p className="text-[11px] text-[var(--text-dim)]">günlük ortalama kalori</p>
        </div>
        <div>
          <p className="text-xl font-semibold text-[var(--mint)]">{r.avgProtein} g</p>
          <p className="text-[11px] text-[var(--text-dim)]">günlük ortalama protein</p>
        </div>
        <div>
          <p className="text-xl font-semibold">
            {r.daysHitKcal}
            <span className="text-sm text-[var(--text-dim)]">/{r.loggedDays}</span>
          </p>
          <p className="text-[11px] text-[var(--text-dim)]">gün kalori hedefini tuttu</p>
        </div>
        <div>
          <p
            className="text-xl font-semibold"
            style={{ color: r.weightChange == null ? 'var(--text-dim)' : r.weightChange >= 0 ? 'var(--mint)' : 'var(--gold)' }}
          >
            {r.weightChange == null ? '—' : `${r.weightChange > 0 ? '+' : ''}${r.weightChange} kg`}
          </p>
          <p className="text-[11px] text-[var(--text-dim)]">bu haftaki kilo değişimi</p>
        </div>
      </div>
      {r.weightChange != null && r.daysHitKcal >= Math.ceil(r.loggedDays * 0.7) && r.weightChange <= 0 && (
        <p className="text-xs text-[var(--gold)] bg-[rgba(245,185,66,0.10)] rounded-xl p-3 mt-3 leading-relaxed">
          💡 Hedefini çoğu gün tutturmuşsun ama kilo artmamış. Birkaç hafta böyle sürerse günlük kalori
          hedefini biraz yükseltmeyi düşünebilirsin — vücudun tahmininden fazla yakıyor olabilir.
        </p>
      )}
    </div>
  )
}

/** Gün gün kalori çubukları; hedefi geçen gün yeşile döner. */
function DailyBars() {
  const { meals, weights, targets } = useData()
  const [days, setDays] = useState(7)
  const rows = useMemo(() => dailySummaries(meals, weights, days), [meals, weights, days])
  const today = todayStr()
  const hasAny = rows.some((d) => d.mealCount > 0)

  if (!hasAny) return null

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-sm">Günlük kalori</h3>
        <div className="flex gap-1.5">
          {[7, 14].map((n) => (
            <button
              key={n}
              onClick={() => setDays(n)}
              className={`chip ${days === n ? 'chip-on' : ''}`}
            >
              {n} gün
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {rows.map((d) => {
          const pct = Math.min(100, Math.round((d.kcal / targets.kcal) * 100))
          const hit = d.kcal >= targets.kcal
          const empty = d.mealCount === 0
          return (
            <div key={d.date} className="flex items-center gap-2.5 text-xs">
              <span className={`w-14 shrink-0 ${d.date === today ? 'text-[var(--pink-soft)]' : 'text-[var(--text-dim)]'}`}>
                {d.date === today ? 'Bugün' : formatDay(d.date)}
              </span>
              <div className="flex-1 h-4 rounded-full bg-[var(--bg-soft)] overflow-hidden relative">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${empty ? 0 : Math.max(4, pct)}%`,
                    background: hit ? 'var(--mint)' : 'linear-gradient(90deg, var(--pink), var(--pink-deep))',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
              <span className={`w-24 text-right shrink-0 ${hit ? 'text-[var(--mint)]' : 'text-[var(--text-dim)]'}`}>
                {empty ? '—' : `${d.kcal} kcal`}
                {d.weight != null && <span className="text-[var(--text-dim)]"> · {d.weight}kg</span>}
              </span>
            </div>
          )
        })}
      </div>

      <p className="text-[11px] text-[var(--text-dim)] mt-3">
        Çubuk {targets.kcal} kaloriye ulaşınca yeşile döner. Yanında o günkü kilon da varsa görünür.
      </p>
    </div>
  )
}

const SLOTS = ['Kahvaltı', 'Ara öğün', 'Öğle', 'Atıştırmalık', 'Akşam', 'Gece']

const QUICK = [
  { label: '🥚 2 yumurta', text: '2 yumurta' },
  { label: '🥛 1 bardak süt', text: '1 bardak süt' },
  { label: '🍌 1 muz', text: '1 muz' },
  { label: '🍗 130 g tavuk', text: '130 gr tavuk göğsü' },
  { label: '🥣 1 kase yoğurt', text: '1 kase yoğurt' },
  { label: '🥤 1 protein shake', text: '1 ölçek protein tozu, 250 ml süt' },
]

function guessSlot(date = new Date()) {
  const h = date.getHours()
  if (h < 10) return 'Kahvaltı'
  if (h < 12) return 'Ara öğün'
  if (h < 15) return 'Öğle'
  if (h < 18) return 'Atıştırmalık'
  if (h < 22) return 'Akşam'
  return 'Gece'
}

export default function Food() {
  const { todaysMeals, todaysTotals, targets, currentWeight, addMeal, deleteMeal } = useData()
  const [text, setText] = useState('')
  const [slot, setSlot] = useState(guessSlot())
  const [date, setDate] = useState(todayStr())
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)
  const [msg, setMsg] = useState('')

  const remaining = useMemo(
    () => ({
      kcal: Math.max(0, targets.kcal - todaysTotals.kcal),
      protein: Math.max(0, Math.round(targets.protein - todaysTotals.protein)),
    }),
    [targets, todaysTotals],
  )

  async function handleAnalyze(e) {
    e?.preventDefault()
    if (!text.trim()) return
    setBusy(true)
    setResult(null)
    const analysis = await analyzeMeal(text.trim(), {
      weightKg: currentWeight,
      targets,
      consumedToday: todaysTotals,
      slot,
    })
    setResult(analysis)
    setBusy(false)
  }

  async function handleSave() {
    if (!result?.items?.length) return
    const total = sumItems(result.items)
    await addMeal({
      log_date: date,
      meal_slot: slot,
      note: text.trim(),
      kcal: total.kcal,
      protein: total.protein,
      carb: total.carb,
      fat: total.fat,
      items: result.items,
      source: result.source,
    })
    setText('')
    setResult(null)
    setMsg(date === todayStr() ? 'Öğün eklendi 💗' : `${formatDay(date)} gününe eklendi 💗`)
    setDate(todayStr())
    setTimeout(() => setMsg(''), 2500)
  }

  function updateItem(idx, field, value) {
    const n = parseFloat(value.replace(',', '.')) || 0
    setResult((r) => ({
      ...r,
      items: r.items.map((it, i) => (i === idx ? { ...it, [field]: n } : it)),
    }))
  }

  function removeItem(idx) {
    setResult((r) => ({ ...r, items: r.items.filter((_, i) => i !== idx) }))
  }

  const draftTotal = result ? sumItems(result.items) : null

  return (
    <div className="flex flex-col gap-5 fade-up">
      <div className="card p-4 flex items-center gap-3">
        <div className="flex-1">
          <h2 className="text-lg font-semibold">Yemek günlüğü</h2>
          <p className="text-sm text-[var(--text-dim)]">
            Ne yediysen normal cümlelerle yaz, kalorisini ben hesaplayayım.
          </p>
        </div>
        <Photo name="yemek" fit="contain" className="h-24 w-auto shrink-0" rounded="" hideOnError eager />
      </div>

      <div className="card p-4">
        <div className="grid grid-cols-3 gap-2">
          <Ring value={todaysTotals.kcal} max={targets.kcal} label="Kalori" color="var(--pink)" />
          <Ring value={todaysTotals.protein} max={targets.protein} label="Protein (g)" color="var(--mint)" />
          <Ring value={todaysTotals.carb} max={targets.carb} label="Karb. (g)" color="var(--gold)" />
        </div>
        <p className="text-xs text-[var(--text-dim)] text-center mt-3">
          {remaining.kcal > 0
            ? `Hedefe ${remaining.kcal} kalori ve ${remaining.protein} g protein kaldı.`
            : 'Günün kalori hedefini tamamladın 🎉'}
        </p>
      </div>

      {/* Giriş */}
      <form onSubmit={handleAnalyze} className="card p-4 flex flex-col gap-3">
        <div className="flex flex-wrap gap-1.5">
          {SLOTS.map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => setSlot(s)}
              className={`chip ${slot === s ? 'chip-on' : ''}`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-[11px] text-[var(--text-dim)]">Tarih</label>
          <input
            type="date"
            value={date}
            max={todayStr()}
            min={daysAgoStr(60)}
            onChange={(e) => setDate(e.target.value || todayStr())}
            className="input py-1.5 text-xs w-auto"
          />
          {date !== todayStr() && (
            <>
              <span className="text-[11px] text-[var(--gold)]">
                {formatDay(date)} gününe kaydedilecek
              </span>
              <button type="button" onClick={() => setDate(todayStr())} className="chip">
                Bugüne dön
              </button>
            </>
          )}
        </div>

        <textarea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="örn: 3 yumurtalı omlet, 2 dilim tam buğday ekmeği, 1 bardak süt ve bir muz"
          className="input resize-none"
        />

        <div className="flex flex-wrap gap-1.5">
          {QUICK.map((q) => (
            <button
              type="button"
              key={q.label}
              onClick={() => setText((t) => (t ? `${t}, ${q.text}` : q.text))}
              className="chip hover:border-[var(--pink-soft)]"
            >
              {q.label}
            </button>
          ))}
        </div>

        <button type="submit" disabled={busy || !text.trim()} className="btn btn-primary">
          {busy ? 'Hesaplanıyor…' : 'Kalorisini hesapla'}
        </button>
        {msg && <p className="text-xs text-[var(--mint)] text-center">{msg}</p>}
      </form>

      {/* Sonuç */}
      {result && (
        <div className="card p-4 flex flex-col gap-3 fade-up">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm">Tahmin</h3>
            <span className="chip">{result.source === 'yapay zeka' ? '🤖 yapay zekâ' : '📗 besin tablosu'}</span>
          </div>

          {result.items.length === 0 ? (
            <p className="text-sm text-[var(--text-dim)]">{result.comment}</p>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                {result.items.map((it, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{it.name}</p>
                      <p className="text-[11px] text-[var(--text-dim)]">{it.amount}</p>
                    </div>
                    <input
                      type="number"
                      value={it.kcal}
                      onChange={(e) => updateItem(idx, 'kcal', e.target.value)}
                      className="input w-20 text-center py-1 text-xs"
                      aria-label={`${it.name} kalori`}
                    />
                    <input
                      type="number"
                      value={it.protein}
                      onChange={(e) => updateItem(idx, 'protein', e.target.value)}
                      className="input w-16 text-center py-1 text-xs"
                      aria-label={`${it.name} protein`}
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="text-[var(--text-dim)] hover:text-[var(--pink-soft)] px-1"
                      aria-label="Kaldır"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <p className="text-[10px] text-[var(--text-dim)] text-right">kcal · protein (g) — düzeltebilirsin</p>
              </div>

              <div className="flex items-center justify-between text-sm border-t border-[var(--border)] pt-3">
                <span className="text-[var(--text-dim)]">Toplam</span>
                <span className="font-medium">
                  {draftTotal.kcal} kcal · {draftTotal.protein} g protein · {draftTotal.carb} g karb ·{' '}
                  {draftTotal.fat} g yağ
                </span>
              </div>

              {result.comment && <p className="text-xs text-[var(--text-dim)]">{result.comment}</p>}
              {result.suggestion && (
                <p className="text-xs text-[var(--pink-soft)] bg-[rgba(236,72,153,0.08)] rounded-xl p-3">
                  💡 {result.suggestion}
                </p>
              )}

              <button onClick={handleSave} className="btn btn-primary">
                Günlüğe ekle
              </button>
            </>
          )}
        </div>
      )}

      {/* Bugünün öğünleri */}
      <div className="card p-4">
        <h3 className="font-medium text-sm mb-3">Bugün yedikleri</h3>
        {todaysMeals.length === 0 ? (
          <p className="text-sm text-[var(--text-dim)]">Henüz kayıt yok. İlk öğününü yukarıdan ekle.</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {todaysMeals.map((m) => (
              <div key={m.id} className="flex items-start gap-3 border-b border-[var(--border)] pb-2.5 last:border-0 last:pb-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="text-[var(--pink-soft)]">{m.meal_slot}</span>
                    {m.created_at ? (
                      <span className="text-[11px] text-[var(--text-dim)]"> · {formatTime(m.created_at)}</span>
                    ) : null}
                  </p>
                  <p className="text-xs text-[var(--text-dim)] break-words">{m.note}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium">{m.kcal} kcal</p>
                  <p className="text-[11px] text-[var(--mint)]">{Math.round(m.protein_g)} g protein</p>
                </div>
                <button
                  onClick={() => deleteMeal(m.id)}
                  className="text-[var(--text-dim)] hover:text-[var(--pink-soft)]"
                  aria-label="Öğünü sil"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <WeeklyReview />
      <DailyBars />
    </div>
  )
}
