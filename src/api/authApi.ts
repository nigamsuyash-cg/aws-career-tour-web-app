import axios from 'axios'
import { getLanguage } from '../utils/languageStore'

function getAuthHeaders() {
  return {
    'Content-Type': 'application/json',
    'package-name': 'ai.convegenius.app',
    'version-code': '1',
    'language': getLanguage(),
  }
}

export async function sendOtp(mobile: string): Promise<void> {
  await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/api/mobile/send-otp`,
    { mobile },
    { headers: getAuthHeaders() },
  )
}

interface VerifyOtpResponse {
  sessionId: string
  loginToken: string
  userProfile: {
    alias: string
    name: string
  } | null
}

export async function verifyOtp(mobile: string, otp: string): Promise<VerifyOtpResponse> {
  const { data } = await axios.post<VerifyOtpResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/api/mobile/verify-otp`,
    { mobile, otp },
    { headers: getAuthHeaders() },
  )
  return data
}
