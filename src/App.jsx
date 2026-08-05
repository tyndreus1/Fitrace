import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import { useAuth } from './context/contexts'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Food from './pages/Food'
import Measure from './pages/Measure'
import Program from './pages/Program'
import Coach from './pages/Coach'
import Journal from './pages/Journal'

function Gate() {
  const { unlocked } = useAuth()

  if (!unlocked) return <Login />

  return (
    <DataProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/yemek" element={<Food />} />
          <Route path="/olcum" element={<Measure />} />
          <Route path="/program" element={<Program />} />
          <Route path="/koc" element={<Coach />} />
          <Route path="/gunce" element={<Journal />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </DataProvider>
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
