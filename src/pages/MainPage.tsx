import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useCourseList } from '../hooks/useCourseList'
import { useUserProfile } from '../hooks/useUserProfile'
import { getLanguage } from '../utils/languageStore'
import CourseCard from '../components/CourseCard'
import CourseCardSmall from '../components/CourseCardSmall'
import CertificateCard from '../components/CertificateCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorRetry from '../components/common/ErrorRetry'
import type { Course } from '../types/models'

type Tab = 'home' | 'profile'

// ─── HomeTab ──────────────────────────────────────────────────────────────────

function HomeTab() {
  const navigate = useNavigate()
  const { uiState, load } = useCourseList()

  useEffect(() => { load(getLanguage()) }, [load])

  const handleCourseClick = (course: Course) => {
    navigate(`/course/${course.course_uuid}`)
  }

  if (uiState.status === 'idle' || uiState.status === 'loading') {
    return <div className="tab-content"><LoadingSpinner /></div>
  }

  if (uiState.status === 'error') {
    return <div className="tab-content"><ErrorRetry onRetry={load} /></div>
  }

  const { allCourses, continueLearning } = uiState

  return (
    <div className="tab-content home-tab">
      {continueLearning.length > 0 && (
        <section className="home-section">
          <p className="home-section-title">Continue Learning</p>
          <div className="continue-learning-list">
            {continueLearning.map(course => (
              <CourseCardSmall key={course.course_uuid} course={course} onClick={handleCourseClick} />
            ))}
          </div>
        </section>
      )}

      <section className="home-section">
        <p className="home-section-title">All Courses</p>
        <div className="course-list">
          {allCourses.map(course => (
            <CourseCard key={course.course_uuid} course={course} onClick={handleCourseClick} />
          ))}
        </div>
      </section>
    </div>
  )
}

// ─── ProfileTab ───────────────────────────────────────────────────────────────

function ProfileTab() {
  const navigate = useNavigate()
  const { uiState, load } = useUserProfile()

  useEffect(() => { load() }, [load])

  if (uiState.status === 'idle' || uiState.status === 'loading') {
    return <div className="tab-content"><LoadingSpinner /></div>
  }

  if (uiState.status === 'error') {
    return <div className="tab-content"><ErrorRetry onRetry={load} /></div>
  }

  const user = uiState.data

  return (
    <div className="tab-content profile-tab">
      <div className="profile-header">
        <div className="profile-avatar">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <div className="profile-info">
          <p className="profile-name">{user.name}</p>
          <p className="profile-type">{user.type}</p>
        </div>
        <button className="profile-edit-btn" onClick={() => navigate('/profile/edit')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
      </div>

      {user.certificates.length > 0 && (
        <section className="home-section">
          <p className="home-section-title">My Certificates</p>
          <div className="certificate-list">
            {user.certificates.map(cert => (
              <CertificateCard
                key={cert.uuid}
                certificate={cert}
                onGoToCourse={c => navigate(`/course/${c.course_uuid}`)}
              />
            ))}
          </div>
        </section>
      )}

      {user.certificates.length === 0 && (
        <p className="empty-state-text">No certificates yet. Complete a course to earn one!</p>
      )}
    </div>
  )
}

// ─── MainPage ─────────────────────────────────────────────────────────────────

export default function MainPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('home')

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-root">
      <div className="main-page">
        {/* Toolbar */}
        <div className="main-toolbar">
          <span className="main-toolbar__title">AWS Career Tours</span>
          <button className="main-toolbar__logout-btn" onClick={handleLogout}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>

        {/* Tab Content */}
        <div className="main-page__content">
          {activeTab === 'home' ? <HomeTab /> : <ProfileTab />}
        </div>

        {/* Bottom Nav Tabs */}
        <nav className="tabs-bar">
          <button
            className={`tab-btn ${activeTab === 'home' ? 'tab-btn--active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span>Home</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'profile' ? 'tab-btn--active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span>Profile</span>
          </button>
        </nav>
      </div>
    </div>
  )
}
