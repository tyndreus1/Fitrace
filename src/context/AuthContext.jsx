import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)
const STORAGE_KEY = 'fitrace_session'

export function AuthProvider({ children }) {
  const [profile, setProfile] = useState(null)
  const [allProfiles, setAllProfiles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfiles()
  }, [])

  async function loadProfiles() {
    const { data, error } = await supabase.from('profiles').select('*').order('id')
    if (!error && data) {
      setAllProfiles(data)
      const savedId = localStorage.getItem(STORAGE_KEY)
      if (savedId) {
        const found = data.find((p) => p.id === savedId)
        if (found) setProfile(found)
      }
    }
    setLoading(false)
  }

  async function login(profileId, pin) {
    const target = allProfiles.find((p) => p.id === profileId)
    if (!target) return { error: 'Profile not found' }
    if (String(target.pin) !== String(pin)) return { error: 'Incorrect PIN' }
    setProfile(target)
    localStorage.setItem(STORAGE_KEY, target.id)
    return { error: null }
  }

  function logout() {
    setProfile(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  const opponent = profile ? allProfiles.find((p) => p.id !== profile.id) : null

  return (
    <AuthContext.Provider
      value={{ profile, opponent, allProfiles, loading, login, logout, reload: loadProfiles }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
