export interface SessionData {
  sessionId: string
  mobile: string
  userAlias: string
  loginToken: string
}

const STORAGE_KEY = 'ct_session'

export function loadSession(): SessionData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && parsed.sessionId && parsed.mobile && parsed.userAlias) {
      return parsed as SessionData
    }
    return null
  } catch {
    return null
  }
}

export function saveSession(data: SessionData): void {
  currentSession = data
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function clearSession(): void {
  currentSession = null
  localStorage.removeItem(STORAGE_KEY)
}

// Module-level variable so the axios interceptor (outside React) can read session synchronously
let currentSession: SessionData | null = loadSession()

export function getSession(): SessionData | null {
  return currentSession
}
