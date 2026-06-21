import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/water', label: 'Water', icon: '💧' },
  { to: '/weight', label: 'Weight & Body', icon: '⚖️' },
  { to: '/race', label: 'Race', icon: '🏁' },
  { to: '/badges', label: 'Badges', icon: '🎖️' },
]

export default function Layout() {
  const { profile, logout } = useAuth()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏁</span>
          <span className="font-semibold">Fit Race</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{profile.avatar}</span>
          <span className="hidden sm:inline font-medium" style={{ color: profile.color }}>
            {profile.display_name}
          </span>
          <button
            onClick={logout}
            className="text-sm text-[var(--text-dim)] border border-[var(--border)] rounded-lg px-3 py-1.5 hover:text-[var(--text)]"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 max-w-3xl mx-auto w-full">
        <Outlet />
      </main>

      <nav className="sticky bottom-0 border-t border-[var(--border)] bg-[var(--bg-soft)] flex justify-around py-2">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-xs px-3 py-1 rounded-lg ${
                isActive ? 'text-[var(--text)]' : 'text-[var(--text-dim)]'
              }`
            }
          >
            <span className="text-lg">{n.icon}</span>
            {n.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
