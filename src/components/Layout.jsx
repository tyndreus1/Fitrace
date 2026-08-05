import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/contexts'
import { PROFILE } from '../lib/config'
import Photo from './Photo'

const NAV = [
  { to: '/', label: 'Bugün', icon: '🏠' },
  { to: '/yemek', label: 'Yemek', icon: '🍽️' },
  { to: '/olcum', label: 'Ölçüm', icon: '📏' },
  { to: '/program', label: 'Program', icon: '📋' },
  { to: '/koc', label: 'Koç', icon: '💬' },
  { to: '/gunce', label: 'Günce', icon: '✨' },
]

export default function Layout() {
  const { logout } = useAuth()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] sticky top-0 z-10 backdrop-blur bg-[rgba(23,16,26,0.82)]">
        <div className="flex items-center gap-2.5">
          <Photo name="avatar" className="w-9 h-9" rounded="rounded-full" />
          <div className="leading-tight">
            <p className="font-semibold text-sm">{PROFILE.name}'nin Günlüğü</p>
            <p className="text-[11px] text-[var(--text-dim)]">Güçlen, dolgunlaş, iyi hisset</p>
          </div>
        </div>
        <button onClick={logout} className="btn btn-ghost text-xs px-3 py-1.5">
          Çıkış
        </button>
      </header>

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
