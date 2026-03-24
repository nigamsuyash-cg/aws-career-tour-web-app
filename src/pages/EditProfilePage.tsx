import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserProfile, updateUserProfile } from '../api/careerTourApi'
import { useAuth } from '../auth/AuthContext'
import {
  INDIA_STATES,
  GRADE_OPTIONS,
  SCHOOL_TYPE_VALUES,
  SCHOOL_TYPE_LABELS,
  type SchoolType,
  type UserType,
  type UserProfileResponse,
} from '../types/models'
import LoadingSpinner from '../components/common/LoadingSpinner'

/** Mirrors AWSCareerTourEditProfileFragment */
export default function EditProfilePage() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const userAlias = session?.userAlias ?? ''

  const [loadingUser, setLoadingUser] = useState(true)
  const [saving, setSaving] = useState(false)

  // Lock role once loaded
  const [role, setRole] = useState<UserType>('STUDENT')
  const [roleDisabled, setRoleDisabled] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [grade, setGrade] = useState('')
  const [schoolType, setSchoolType] = useState<SchoolType | ''>('')
  const [stateCode, setStateCode] = useState('')
  const [city, setCity] = useState('')

  useEffect(() => {
    getUserProfile({ user_alias: userAlias })
      .then((data: UserProfileResponse) => {
        setName(data.name)
        setEmail(data.email ?? '')
        setGrade(data.grade ?? '')
        setSchoolType(data.school_type ?? '')
        if (data.state) setStateCode(data.state)
        if (data.city) setCity(data.city)
        const userType: UserType = data.type === 'STUDENT' ? 'STUDENT' : 'TEACHER'
        setRole(userType)
        setRoleDisabled(true)
      })
      .catch(() => {})
      .finally(() => setLoadingUser(false))
  }, [userAlias])

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
      navigate(-1)
    } catch {
      // best-effort
    } finally {
      setSaving(false)
    }
  }

  if (loadingUser) {
    return <div className="app-root"><LoadingSpinner /></div>
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
          <span className="toolbar-title">Edit Profile</span>
        </div>

        <div className="edit-profile-form">
          {/* Role */}
          <div className="form-group">
            <label className="form-label">Role</label>
            <select
              className={`form-select ${roleDisabled ? 'form-select--disabled' : ''}`}
              value={role}
              disabled={roleDisabled}
              onChange={e => setRole(e.target.value as UserType)}
            >
              <option value="STUDENT">Student</option>
              <option value="TEACHER">Teacher</option>
            </select>
          </div>

          {/* Name */}
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" />
          </div>

          {/* Conditional: Grade (student) or Email (teacher) */}
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

          {/* School Type */}
          <div className="form-group">
            <label className="form-label">School Type *</label>
            <select className="form-select" value={schoolType} onChange={e => setSchoolType(e.target.value as SchoolType)}>
              <option value="">Select School</option>
              {SCHOOL_TYPE_VALUES.map(s => <option key={s} value={s}>{SCHOOL_TYPE_LABELS[s]}</option>)}
            </select>
          </div>

          {/* State */}
          <div className="form-group">
            <label className="form-label">State *</label>
            <select className="form-select" value={stateCode} onChange={e => { setStateCode(e.target.value); setCity('') }}>
              <option value="">Select State</option>
              {INDIA_STATES.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
            </select>
          </div>

          {/* City */}
          {stateCode && (
            <div className="form-group">
              <label className="form-label">City *</label>
              <input
                className="form-input"
                value={city}
                onChange={e => setCity(e.target.value)}
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
