import { useEffect, useMemo, useRef, useState } from 'react'
import { useData } from '../context/contexts'
import { askCoach } from '../lib/ai'
import { PROFILE } from '../lib/config'
import { calcBmi } from '../lib/nutrition'
import { focusCmGained, loggingStreak, weeklyTrendKg, weightGainedKg } from '../lib/stats'
import { formatTime } from '../lib/dates'

const STARTERS = [
  'Bugün ne yesem? Elimde yumurta, yoğurt ve tavuk var.',
  'Kalçamı büyütmek için en etkili 3 hareket ne?',
  'İştahım hiç yok, kaloriyi nasıl tamamlarım?',
  'Tartı bir haftadır oynamıyor, ne yapmalıyım?',
  'Sivilcelerim için beslenmemde ne değiştirebilirim?',
  'Bugün motivasyonum sıfır, bir şeyler söyle.',
]

const WELCOME = {
  role: 'assistant',
  content:
    `Merhaba ${PROFILE.name} 👋 Ben senin beslenme ve motivasyon koçunum. ` +
    'Kayıtlarını görebiliyorum, o yüzden "bugün ne yesem" gibi sorulara sana göre cevap verebilirim. ' +
    'Ne sormak istersin?',
}

export default function Coach() {
  const {
    chat,
    addChatMessage,
    clearChat,
    currentWeight,
    targets,
    todaysTotals,
    todaysWater,
    todaysJournal,
    weights,
    meals,
    measurements,
  } = useData()

  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [pending, setPending] = useState(null)
  // Kaydedilemese bile ekranda kalsın diye bu oturumda yazılanların kopyası
  const [unsaved, setUnsaved] = useState([])
  const endRef = useRef(null)

  const messages = useMemo(() => {
    const stored = (chat || []).map((c) => ({ role: c.role, content: c.content, at: c.created_at }))
    const base = stored.length ? stored : [WELCOME]
    // Depoya ulaşmış olanları kopyadan ele; kalanlar sohbetin sonuna eklenir
    const missing = unsaved.filter((u) => !stored.some((s) => s.role === u.role && s.content === u.content))
    return [...base, ...missing]
  }, [chat, unsaved])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length, pending, busy])

  const context = useMemo(
    () => ({
      isim: PROFILE.name,
      yas: PROFILE.age,
      boyCm: PROFILE.heightCm,
      baslangicKg: PROFILE.startWeightKg,
      hedefKg: PROFILE.goalWeightKg,
      guncelKg: currentWeight,
      vki: calcBmi(currentWeight)?.toFixed(1),
      gunlukHedef: targets,
      bugunAlinan: todaysTotals,
      bugunSuMl: todaysWater,
      toplamDegisimKg: weightGainedKg(weights),
      haftalikEgilimKg: weeklyTrendKg(weights),
      kayitSerisiGun: loggingStreak(meals),
      kalcaBacakKazancCm: focusCmGained(measurements),
      bugunRuhHali: todaysJournal?.mood ?? null,
      bugunCilt: todaysJournal?.skin ?? null,
    }),
    [currentWeight, targets, todaysTotals, todaysWater, weights, meals, measurements, todaysJournal],
  )

  async function send(text) {
    const content = (text ?? input).trim()
    if (!content || busy) return
    setInput('')
    setPending(content)
    setBusy(true)

    const history = [...messages, { role: 'user', content }]
      .filter((m) => m.content)
      .slice(-16)
      .map((m) => ({ role: m.role, content: m.content }))

    await addChatMessage('user', content)
    const reply = await askCoach(history, context)
    await addChatMessage('assistant', reply.message)

    // Kayıt bir şekilde başarısız olsa bile yanıt ekranda kalsın
    setUnsaved((u) => [
      ...u,
      { role: 'user', content },
      { role: 'assistant', content: reply.message },
    ])

    setPending(null)
    setBusy(false)
  }

  return (
    <div className="flex flex-col gap-4 fade-up">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Koçun</h2>
          <p className="text-sm text-[var(--text-dim)]">Sorularını sor; kayıtlarına bakarak cevap verir.</p>
        </div>
        {chat?.length > 0 && (
          <button
            onClick={() => {
              if (confirm('Sohbet geçmişi silinsin mi?')) clearChat()
            }}
            className="btn btn-ghost text-xs px-3 py-1.5 shrink-0"
          >
            Temizle
          </button>
        )}
      </div>

      <div className="card p-4 flex flex-col gap-3 min-h-[45vh]">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'pink-grad text-white rounded-br-md'
                  : 'bg-[var(--bg-soft)] border border-[var(--border)] rounded-bl-md'
              }`}
            >
              {m.content}
              {m.at && (
                <span className="block text-[10px] opacity-60 mt-1">{formatTime(m.at)}</span>
              )}
            </div>
          </div>
        ))}

        {pending && (
          <div className="flex justify-end">
            <div className="max-w-[85%] rounded-2xl rounded-br-md px-3.5 py-2.5 text-sm pink-grad text-white opacity-60">
              {pending}
            </div>
          </div>
        )}

        {busy && (
          <div className="flex justify-start">
            <div className="bg-[var(--bg-soft)] border border-[var(--border)] rounded-2xl rounded-bl-md px-3.5 py-2.5 text-sm text-[var(--text-dim)] pulse-soft">
              yazıyor…
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-1.5">
          {STARTERS.map((s) => (
            <button key={s} onClick={() => send(s)} className="chip text-left hover:border-[var(--pink-soft)]">
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          send()
        }}
        className="flex gap-2 sticky bottom-0"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Bir şey sor…"
          className="input flex-1"
        />
        <button type="submit" disabled={busy || !input.trim()} className="btn btn-primary px-5">
          Gönder
        </button>
      </form>

      <p className="text-[11px] text-[var(--text-dim)] leading-relaxed text-center px-2">
        Koç genel bilgi verir, tanı koymaz ve ilaç önermez. Sağlıkla ilgili kararlarda hekimine danış.
      </p>
    </div>
  )
}
