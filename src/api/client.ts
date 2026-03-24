import axios from 'axios'
import { getSession, clearSession } from '../auth/sessionStore'
import { getLanguage } from '../utils/languageStore'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
  headers: {
    'Content-Type': 'application/json',
    'package-name': 'ai.convegenius.app',
    'version-code': '1',
  },
})

// Inject session and language headers dynamically
apiClient.interceptors.request.use((config) => {
  const session = getSession()
  if (session) {
    config.headers['session-id'] = session.sessionId
    config.headers['mobile'] = session.mobile
  }
  config.headers['language'] = getLanguage()
  return config
})

// Auto-redirect to login on 401 (session expired)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearSession()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default apiClient
