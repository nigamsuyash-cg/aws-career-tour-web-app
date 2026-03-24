import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { sendOtp, verifyOtp } from '../api/authApi'
import { LANGUAGES, getLanguage, setLanguage } from '../utils/languageStore'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [language, setLang] = useState(getLanguage)

  const handleLanguageChange = (code: string) => {
    setLanguage(code)
    setLang(code)
  }

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault()
    if (!mobile.trim() || loading) return

    setLoading(true)
    setError(null)

    try {
      await sendOtp(mobile.trim())
      setOtpSent(true)
    } catch {
      setError('Failed to send OTP. Please check the phone number and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault()
    if (!otp.trim() || loading) return

    setLoading(true)
    setError(null)

    try {
      const res = await verifyOtp(mobile.trim(), otp.trim())
      login({
        sessionId: res.sessionId,
        mobile: mobile.trim(),
        userAlias: res.userProfile?.alias ?? '',
        loginToken: res.loginToken,
      })
      navigate('/', { replace: true })
    } catch {
      setError('Invalid OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChangeMobile = () => {
    setOtpSent(false)
    setOtp('')
    setError(null)
  }

  return (
    <div className="app-root">
      <div className="login-page">
        <h1 className="login-page__title">AWS Career Tours</h1>

        <div className="login-page__lang-selector">
          <select
            className="form-select"
            value={language}
            onChange={e => handleLanguageChange(e.target.value)}
          >
            {LANGUAGES.map(l => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        </div>

        {!otpSent ? (
          <form className="login-page__form" onSubmit={handleSendOtp}>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                className="form-input"
                type="tel"
                value={mobile}
                onChange={e => setMobile(e.target.value)}
                placeholder="+911111111111"
              />
            </div>

            {error && <p className="login-page__error">{error}</p>}

            <button
              type="submit"
              className={`btn-save ${!mobile.trim() ? 'btn-save--disabled' : ''}`}
              disabled={!mobile.trim() || loading}
            >
              {loading ? <LoadingSpinner /> : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form className="login-page__form" onSubmit={handleVerifyOtp}>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div className="login-page__mobile-row">
                <span className="login-page__mobile-value">{mobile}</span>
                <button type="button" className="login-page__change-btn" onClick={handleChangeMobile}>
                  Change
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">OTP</label>
              <input
                className="form-input"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="Enter OTP"
                autoFocus
              />
            </div>

            {error && <p className="login-page__error">{error}</p>}

            <button
              type="submit"
              className={`btn-save ${!otp.trim() ? 'btn-save--disabled' : ''}`}
              disabled={!otp.trim() || loading}
            >
              {loading ? <LoadingSpinner /> : 'Verify & Login'}
            </button>

            <button
              type="button"
              className="login-page__resend-btn"
              disabled={loading}
              onClick={handleSendOtp}
            >
              Resend OTP
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
