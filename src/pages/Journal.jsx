import { useState } from 'react'
import { useData } from '../context/contexts'
import { BADGE_DEFS, computeEarnedKeys } from '../lib/badges'
import { HARD_DAY_NOTES, MOODS, SKIN_STATES, SKIN_TIPS, affirmationOfTheDay } from '../lib/motivation'
import { focusCmGained, loggingStreak, proteinHitDays, waterStreak, weightGainedKg } from '../lib/stats'
import { formatDay } from '../lib/dates'
import { PROFILE } from '../lib/config'
import Photo from '../components/Photo'
import { GALLERY } from '../lib/media'

export default function Journal() {
  const {
    todaysJournal,
    saveJournal,
    journal,
    weights,
    meals,
    measurements,
    water,
    targets,
  } = useData()

  // Taslak alanlar boşken kayıtlı değer gösterilir; kullanıcı dokununca
  // taslak devreye girer. Böylece kayıt yüklendiğinde form kendini tazeler.
  const [moodDraft, setMoodDraft] = useState(null)
  const [skinDraft, setSkinDraft] = useState(null)
  const [noteDraft, setNoteDraft] = useState(null)
  const [msg, setMsg] = useState('')
  const [openNote, setOpenNote] = useState(null)
  const [missingPhotos, setMissingPhotos] = useState(() => new Set())

  const mood = moodDraft ?? todaysJournal?.mood ?? null
  const skin = skinDraft ?? todaysJournal?.skin ?? null
  const note = noteDraft ?? todaysJournal?.note ?? ''

  const setMood = setMoodDraft
  const setSkin = setSkinDraft
  const setNote = setNoteDraft

  const earned = computeEarnedKeys({
    weights,
    meals,
    measurements,
    journal,
    streak: loggingStreak(meals),
    waterStreak: waterStreak(water, targets.waterMl),
    proteinDays: proteinHitDays(meals, targets.protein),
    gained: weightGainedKg(weights),
    focusCm: focusCmGained(measurements),
  })

  async function save() {
    await saveJournal({ mood, skin, note: note.trim() })
    setMsg('Kaydedildi 💗')
    setTimeout(() => setMsg(''), 2000)
  }

  const pastEntries = [...(journal || [])]
    .filter((j) => j.note || j.mood)
    .sort((a, b) => b.log_date.localeCompare(a.log_date))
    .slice(0, 10)

  return (
    <div className="flex flex-col gap-5 fade-up">
      <div>
        <h2 className="text-lg font-semibold">Günce</h2>
        <p className="text-sm text-[var(--text-dim)]">Bugün nasıl hissediyorsun? Vücudun kadar ruh hâlin de önemli.</p>
      </div>

      <div className="card p-4 flex gap-3 items-start card-glow">
        <span className="text-xl">💌</span>
        <p className="text-sm leading-relaxed">{affirmationOfTheDay()}</p>
      </div>

      {/* Bugünün kaydı */}
      <div className="card p-4 flex flex-col gap-4">
        <div>
          <p className="text-sm font-medium mb-2">Ruh hâlin</p>
          <div className="flex justify-between gap-1.5">
            {MOODS.map((m) => (
              <button
                key={m.value}
                onClick={() => setMood(m.value)}
                className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border transition-colors ${
                  mood === m.value
                    ? 'border-[var(--pink)] bg-[rgba(236,72,153,0.14)]'
                    : 'border-[var(--border)]'
                }`}
              >
                <span className="text-xl">{m.emoji}</span>
                <span className="text-[10px] text-[var(--text-dim)]">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Cildin</p>
          <div className="flex justify-between gap-1.5">
            {SKIN_STATES.map((s) => (
              <button
                key={s.value}
                onClick={() => setSkin(s.value)}
                className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border transition-colors ${
                  skin === s.value ? 'border-[var(--gold)] bg-[rgba(245,185,66,0.12)]' : 'border-[var(--border)]'
                }`}
              >
                <span className="text-xl">{s.emoji}</span>
                <span className="text-[10px] text-[var(--text-dim)]">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Not</p>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Bugün nasıl geçti? Neyi iyi yaptın, ne zorladı?"
            className="input resize-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <button onClick={save} className="btn btn-primary flex-1">
            Günü kaydet
          </button>
          {msg && <span className="text-xs text-[var(--mint)]">{msg}</span>}
        </div>
      </div>

      {/* Zor gün rehberi */}
      <div>
        <h3 className="font-medium text-sm mb-2">Zor bir gün mü?</h3>
        <div className="flex flex-col gap-2">
          {HARD_DAY_NOTES.map((n) => (
            <button
              key={n.title}
              onClick={() => setOpenNote(openNote === n.title ? null : n.title)}
              className="card p-3.5 text-left"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm">{n.title}</span>
                <span className="text-[var(--text-dim)] text-xs">{openNote === n.title ? '▲' : '▼'}</span>
              </div>
              {openNote === n.title && (
                <p className="text-xs text-[var(--text-dim)] leading-relaxed mt-2 fade-up">{n.text}</p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Rozetler */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-sm">Rozetler</h3>
          <span className="text-xs text-[var(--pink-soft)]">
            {earned.size} / {BADGE_DEFS.length}
          </span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
          {BADGE_DEFS.map((b) => {
            const has = earned.has(b.key)
            return (
              <div
                key={b.key}
                title={b.desc}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-center ${
                  has ? 'border-[var(--pink)] bg-[rgba(236,72,153,0.12)]' : 'border-[var(--border)] opacity-45'
                }`}
              >
                <span className="text-xl">{b.icon}</span>
                <span className="text-[10px] leading-tight">{b.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Cilt bölümü */}
      <div className="relative overflow-hidden rounded-2xl">
        <Photo name="skin" className="w-full h-24" rounded="rounded-2xl" />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(23,16,26,0.94)] to-transparent" />
        <h3 className="absolute bottom-3 left-4 font-semibold pearl-text">Cilt notları</h3>
      </div>
      <div className="flex flex-col gap-2">
        {SKIN_TIPS.map((t) => (
          <div key={t.title} className="card p-3.5 flex gap-3">
            <span className="text-lg">{t.icon}</span>
            <div>
              <p className="text-sm font-medium">{t.title}</p>
              <p className="text-xs text-[var(--text-dim)] leading-relaxed mt-0.5">{t.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Galeri — yalnızca gerçekten yüklenen görseller gösterilir */}
      <div>
        <h3 className="font-medium text-sm mb-2">Motivasyon panosu</h3>
        {missingPhotos.size >= GALLERY.length ? (
          <div className="card p-4 text-center">
            <p className="text-2xl">🖼️</p>
            <p className="text-sm mt-1">Pano henüz boş</p>
            <p className="text-xs text-[var(--text-dim)] mt-1 leading-relaxed">
              Seni motive eden görselleri <code>public/ozge/</code> klasörüne{' '}
              <code>galeri-1.jpg</code> … <code>galeri-8.jpg</code> adlarıyla koy, burada görünsünler.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {GALLERY.map((g) => (
              <Photo
                key={g.src}
                src={g.src}
                alt={g.alt}
                hideOnError
                eager
                onFail={(s) => setMissingPhotos((prev) => new Set(prev).add(s))}
                className="w-full aspect-square"
              />
            ))}
          </div>
        )}
      </div>

      {/* Geçmiş */}
      {pastEntries.length > 0 && (
        <div className="card p-4">
          <h3 className="font-medium text-sm mb-3">Geçmiş notların</h3>
          <div className="flex flex-col gap-2.5">
            {pastEntries.map((j) => (
              <div key={j.id} className="border-b border-[var(--border)] pb-2.5 last:border-0 last:pb-0">
                <p className="text-xs text-[var(--text-dim)]">
                  {formatDay(j.log_date)}
                  {j.mood ? ` · ${MOODS.find((m) => m.value === j.mood)?.emoji || ''}` : ''}
                  {j.skin ? ` · cilt ${SKIN_STATES.find((s) => s.value === j.skin)?.emoji || ''}` : ''}
                </p>
                {j.note && <p className="text-sm mt-0.5">{j.note}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-[11px] text-[var(--text-dim)] leading-relaxed text-center px-2">
        {PROFILE.name}, kendini uzun süredir kötü hissediyorsan bunu bir sağlık profesyoneliyle konuşmak en doğrusu.
        İyi hissetmek de bu programın hedeflerinden biri.
      </p>
    </div>
  )
}
