import { NavLink, Outlet } from 'react-router-dom'
import { useAuth, useData } from '../context/contexts'
import { PROFILE } from '../lib/config'
import { retryRemote } from '../lib/store'

const NAV = [
  { to: '/', label: 'Bugün', icon: '🏠' },
  { to: '/yemek', label: 'Yemek', icon: '🍽️' },
  { to: '/olcum', label: 'Ölçüm', icon: '📏' },
  { to: '/program', label: 'Program', icon: '📋' },
  { to: '/koc', label: 'Koç', icon: '💬' },
  { to: '/gunce', label: 'Günce', icon: '✨' },
]

/** Kayıt sorunlarını sessizce yutmak yerine kullanıcıya gösteren şerit. */
function StorageNotice() {
  const { storageDegraded, storage, saveError, dismissSaveError } = useData()

  if (saveError) {
    return (
      <div className="px-4 pt-3">
        <div className="rounded-xl border border-[var(--pink)] bg-[rgba(236,72,153,0.12)] px-3 py-2 flex items-start gap-2">
          <span>⚠️</span>
          <p className="text-xs flex-1 leading-relaxed">{saveError}</p>
          <button onClick={dismissSaveError} className="text-xs text-[var(--text-dim)]" aria-label="Kapat">
            ✕
          </button>
        </div>
      </div>
    )
  }

  if (!storageDegraded) return null

  return (
    <div className="px-4 pt-3">
      <details className="rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] px-3 py-2">
        <summary className="text-xs text-[var(--text-dim)] cursor-pointer">
          📴 Kayıtlar şu an bu cihazda tutuluyor
        </summary>
        <p className="text-[11px] text-[var(--text-dim)] leading-relaxed mt-2">
          Her şey normal çalışıyor ve hiçbir veri kaybolmuyor; sadece cihazlar arası eşitleme kapalı.
          Sebep: {storage.reason}
        </p>
        <button
          onClick={() => {
            retryRemote()
            window.location.reload()
          }}
          className="btn btn-ghost text-[11px] px-3 py-1.5 mt-2"
        >
          Bulutu tekrar dene
        </button>
      </details>
    </div>
  )
}

export default function Layout() {
  const { logout } = useAuth()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] sticky top-0 z-10 backdrop-blur bg-[rgba(23,16,26,0.82)]">
        <div className="flex items-center gap-2.5">
          <span
            className="w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--pink), var(--pink-deep))' }}
            aria-hidden="true"
          >
            🌸
          </span>
          <div className="leading-tight">
            <p className="font-semibold text-sm">{PROFILE.name}'nin Günlüğü</p>
            <p className="text-[11px] text-[var(--text-dim)]">Güçlen, dolgunlaş, iyi hisset</p>
          </div>
        </div>
        <button onClick={logout} className="btn btn-ghost text-xs px-3 py-1.5">
          Çıkış
        </button>
      </header>

      <div className="max-w-3xl mx-auto w-full">
        <StorageNotice />
      </div>

      <main className="flex-1 px-4 py-5 max-w-3xl mx-auto w-full pb-4">
        <Outlet />
      </main>

      <nav className="sticky bottom-0 border-t border-[var(--border)] bg-[rgba(31,21,34,0.95)] backdrop-blur flex justify-around py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-[10px] px-2 py-1 rounded-xl transition-colors ${
                isActive ? 'text-[var(--pink-soft)]' : 'text-[var(--text-dim)]'
              }`
            }
          >
            <span className="text-lg leading-none">{n.icon}</span>
            {n.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
