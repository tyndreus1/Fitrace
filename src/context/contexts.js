import { createContext, useContext } from 'react'

// Context nesneleri ve kancaları burada duruyor; sağlayıcı bileşenler
// AuthContext.jsx / DataContext.jsx içinde. (Bir dosyanın hem bileşen hem
// yardımcı dışa aktarması Vite'ın hızlı yenilemesini bozuyor.)
export const AuthCtx = createContext(null)
export const DataCtx = createContext(null)

export function useAuth() {
  return useContext(AuthCtx)
}

export function useData() {
  return useContext(DataCtx)
}
