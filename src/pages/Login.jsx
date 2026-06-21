import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { allProfiles, login, loading } = useAuth()
  const [selected, setSelected] = useState(null)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    const { error } = await login(selected.id, pin)
    setBusy(false)
    if (error) setError(error)
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-text-dim">Loading…</div>
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight" style={{ color: 'var(--text)' }}>
          🏁 Fit Race
        </h1>
        <p className="text-[var(--text-dim)] mt-1">Witch vs Polar Bear</p>
      </div>

      {!selected ? (
        <div className="grid grid-cols-2 gap-6">
          {allProfiles.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              className="card flex flex-col items-center gap-3 px-10 py-10 hover:scale-[1.03] transition-transform"
              style={{ borderColor: p.color }}
            >
              <span className="text-5xl">{p.avatar}</span>
              <span className="text-lg font-medium" style={{ color: p.color }}>
                {p.display_name}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card flex flex-col items-center gap-4 px-8 py-8 w-72">
          <span className="text-4xl">{selected.avatar}</span>
          <p className="font-medium" style={{ color: selected.color }}>
            {selected.display_name}
          </p>
          <input
            type="password"
            inputMode="numeric"
            autoFocus
            placeholder="PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full text-center text-lg rounded-lg bg-[var(--bg-soft)] border border-[var(--border)] py-2 outline-none focus:border-[var(--text-dim)]"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-2 w-full">
            <button
              type="button"
              onClick={() => {
                setSelected(null)
                setPin('')
                setError('')
              }}
              className="flex-1 rounded-lg border border-[var(--border)] py-2 text-[var(--text-dim)]"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={busy || !pin}
              className="flex-1 rounded-lg py-2 font-medium text-white disabled:opacity-50"
              style={{ background: selected.color }}
            >
              Log in
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
