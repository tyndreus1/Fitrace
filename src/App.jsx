import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Water from './pages/Water'
import Weight from './pages/Weight'
import Race from './pages/Race'
import Badges from './pages/Badges'

function Gate() {
  const { profile, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-[var(--text-dim)]">Loading…</div>
  if (!profile) return <Login />

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/water" element={<Water />} />
        <Route path="/weight" element={<Weight />} />
        <Route path="/race" element={<Race />} />
        <Route path="/badges" element={<Badges />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Gate />
      </AuthProvider>
    </BrowserRouter>
  )
}
