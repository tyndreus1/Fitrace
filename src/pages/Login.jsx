import { useState } from 'react'
import { useAuth } from '../context/contexts'
import Photo from '../components/Photo'
import { PROFILE } from '../lib/config'

export default function Login() {
  const { login } = useAuth()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const { error } = login(password)
    setError(error || '')
    if (error) setPassword('')
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4">
      <Photo name="login" className="absolute inset-0 w-full h-full opacity-25" rounded="rounded-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(23,16,26,0.75)] via-[rgba(23,16,26,0.85)] to-[var(--bg)]" />

      <form onSubmit={handleSubmit} className="relative card card-glow w-full max-w-sm p-7 flex flex-col gap-5 fade-up">
        <div className="text-center">
          <div className="text-4xl mb-2">🌸</div>
          <h1 className="text-2xl font-semibold pearl-text">{PROFILE.name}'nin Sağlık Günlüğü</h1>
          <p className="text-sm text-[var(--text-dim)] mt-1.5">
            Güçlenmek, dolgunlaşmak ve iyi hissetmek için kişisel alanın.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-xs text-[var(--text-dim)]">
            Şifre
          </label>
          <input
            id="password"
            type="password"
            autoFocus
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input text-center tracking-widest"
          />
          {error && <p className="text-sm text-[var(--pink-soft)] text-center">{error}</p>}
        </div>

        <button type="submit" disabled={!password} className="btn btn-primary w-full">
          Gir
        </button>

        <p className="text-[11px] text-[var(--text-dim)] text-center leading-relaxed">
          Bu sayfa tıbbi tavsiye vermez; kişisel takip içindir.
        </p>
      </form>
    </div>
  )
}
