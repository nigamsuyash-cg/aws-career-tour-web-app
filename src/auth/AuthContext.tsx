import { createContext, useContext, useState, type ReactNode } from 'react'
import { loadSession, saveSession, clearSession, type SessionData } from './sessionStore'

interface AuthContextValue {
  session: SessionData | null
  login: (data: SessionData) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionData | null>(() => loadSession())

  const login = (data: SessionData) => {
    saveSession(data)
    setSession(data)
  }

  const logout = () => {
    clearSession()
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ session, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
