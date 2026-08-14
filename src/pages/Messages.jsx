import { useEffect, useState } from 'react'
import { store } from '../lib/store'
import { ADMIN_PASSWORD } from '../lib/config'
import { formatLongDay, formatTime } from '../lib/dates'

/**
 * Gizli sayfa: Özge'nin yaratıcıya bıraktığı teşekkür notları burada okunur.
 * Özge'nin normal girişinden bağımsız, ayrı bir şifreyle korunur.
 */
export default function Messages() {
  const [ok, setOk] = useState(false)
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const [notes, setNotes] = useState(null)

  useEffect(() => {
    if (!ok) return
    store.loadThanks().then(setNotes)
  }, [ok])

  function gir(e) {
    e.preventDefault()
    if (pass.trim() === ADMIN_PASSWORD) {
      setOk(true)
      setErr('')
    } else {
      setErr('Şifre yanlış.')
      setPass('')
    }
  }

  if (!ok) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <form onSubmit={gir} className="card w-full max-w-sm p-7 flex flex-col gap-4 fade-up">
          <h1 className="text-lg font-semibold text-center">💌 Notlar</h1>
          <input
            type="password"
            autoFocus
            placeholder="Şifre"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            className="input text-center"
          />
          {err && <p className="text-sm text-[var(--pink-soft)] text-center">{err}</p>}
          <button type="submit" disabled={!pass} className="btn btn-primary">
            Gir
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-8 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold pearl-text mb-1">Özge'den notlar 💌</h1>
      <p className="text-sm text-[var(--text-dim)] mb-6">Programı yapana bıraktığı teşekkürler.</p>

      {notes == null ? (
        <p className="text-[var(--text-dim)] pulse-soft">Yükleniyor…</p>
      ) : notes.length === 0 ? (
        <p className="text-[var(--text-dim)]">Henüz not yok.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {notes.map((n) => (
            <div key={n.id} className="card p-4">
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{n.content}</p>
              {n.created_at && (
                <p className="text-[11px] text-[var(--text-dim)] mt-2">
                  {formatLongDay(String(n.created_at).slice(0, 10))} · {formatTime(n.created_at)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
