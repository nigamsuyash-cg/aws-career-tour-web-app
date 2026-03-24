import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { updateUserProfile } from '../api/careerTourApi'
import { useAuth } from '../auth/AuthContext'
import { useModuleFlow } from '../hooks/useModuleFlow'
import {
  INDIA_STATES,
  GRADE_OPTIONS,
  SCHOOL_TYPE_VALUES,
  SCHOOL_TYPE_LABELS,
  type ModuleListItem,
  type SchoolType,
  type UserType,
} from '../types/models'
import LoadingSpinner from '../components/common/LoadingSpinner'

interface LocationState {
  items: ModuleListItem[]
  courseUuid: string
  attemptUuid: string
}

/** Mirrors AWSCareerTourProfileCompletionModuleFragment — same form as EditProfilePage but on save
 *  calls onProfileCompleted() to advance to the next module. */
export default function ProfileCompletionModulePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as LocationState | null
  const { onProfileCompleted } = useModuleFlow({
    items: state?.items ?? [],
    courseUuid: state?.courseUuid ?? '',
    attemptUuid: state?.attemptUuid ?? '',
  })

  const { session } = useAuth()
  const userAlias = session?.userAlias ?? ''
  const [saving, setSaving] = useState(false)

  // Form state
  const [role] = useState<UserType>('STUDENT') // role is fixed
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [grade, setGrade] = useState('')
  const [schoolType, setSchoolType] = useState<SchoolType | ''>('')
  const [stateCode, setStateCode] = useState('')
  const [city, setCity] = useState('')
  const [cityInput, setCityInput] = useState('')

  useEffect(() => {
    if (!state) navigate('/')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!state) return null

  const selectedState = INDIA_STATES.find(s => s.code === stateCode)

  const isFormValid = name.trim().length > 0 && stateCode && city && schoolType &&
    (role === 'TEACHER' ? email.trim().length > 0 : grade.length > 0)

  const handleSave = async () => {
    if (!isFormValid) return
    setSaving(true)
    try {
      await updateUserProfile({
        user_alias: userAlias,
        name: name.trim(),
        email: role === 'TEACHER' ? email.trim() : null,
        grade: role === 'STUDENT' ? grade : null,
        school_type: schoolType || null,
        state_code: stateCode,
        city,
      })
      onProfileCompleted()
    } catch {
      // best-effort
      onProfileCompleted()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="app-root">
      <div className="edit-profile-page">
        <div className="module-toolbar">
          <button className="toolbar-back-btn" onClick={() => navigate(-1)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <span className="toolbar-title">Enter Details</span>
        </div>

        <div className="edit-profile-form">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" />
          </div>

          {role === 'STUDENT' ? (
            <div className="form-group">
              <label className="form-label">Grade *</label>
              <select className="form-select" value={grade} onChange={e => setGrade(e.target.value)}>
                <option value="">Select Grade</option>
                {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter email" />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">School Type *</label>
            <select className="form-select" value={schoolType} onChange={e => setSchoolType(e.target.value as SchoolType)}>
              <option value="">Select School</option>
              {SCHOOL_TYPE_VALUES.map(s => <option key={s} value={s}>{SCHOOL_TYPE_LABELS[s]}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">State *</label>
            <select className="form-select" value={stateCode} onChange={e => { setStateCode(e.target.value); setCity(''); setCityInput('') }}>
              <option value="">Select State</option>
              {INDIA_STATES.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
            </select>
          </div>

          {selectedState && (
            <div className="form-group">
              <label className="form-label">City *</label>
              <input
                className="form-input"
                value={cityInput}
                onChange={e => { setCityInput(e.target.value); setCity(e.target.value) }}
                placeholder="Enter city"
              />
            </div>
          )}

          <button
            className={`btn-save ${!isFormValid ? 'btn-save--disabled' : ''}`}
            disabled={!isFormValid || saving}
            onClick={handleSave}
          >
            {saving ? <LoadingSpinner /> : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  )
}
