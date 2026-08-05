import { useMemo, useState } from 'react'
import { useData } from '../context/contexts'
import { analyzeMeal } from '../lib/ai'
import { sumItems } from '../lib/foodDb'
import { formatTime } from '../lib/dates'
import Ring from '../components/Ring'

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
    setMsg('Öğün eklendi 💗')
    setTimeout(() => setMsg(''), 2000)
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
      <div>
        <h2 className="text-lg font-semibold">Yemek günlüğü</h2>
        <p className="text-sm text-[var(--text-dim)]">Ne yediysen normal cümlelerle yaz, kalorisini ben hesaplayayım.</p>
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
    </div>
  )
}
