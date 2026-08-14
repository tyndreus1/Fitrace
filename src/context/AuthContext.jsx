import { useState } from 'react'
import { SESSION_KEY, SITE_PASSWORD } from '../lib/config'
import { AuthCtx } from './contexts'

function readSession() {
  try {
    return localStorage.getItem(SESSION_KEY) === 'ok'
  } catch {
    return false
  }
}

export function AuthProvider({ children }) {
  const [unlocked, setUnlocked] = useState(readSession)

  function login(password) {
    if (password.trim() !== SITE_PASSWORD) {
      return { error: 'Şifre yanlış. Tekrar dene 💗' }
    }
    localStorage.setItem(SESSION_KEY, 'ok')
    setUnlocked(true)
    return { error: null }
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY)
    setUnlocked(false)
  }

  return <AuthCtx.Provider value={{ unlocked, login, logout }}>{children}</AuthCtx.Provider>
}
