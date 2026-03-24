import { useEffect } from 'react'
import { Routes, Route, Navigate, Outlet, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'
import { useCourseDetail } from './hooks/useCourseDetail'
import CourseHeader from './components/CourseHeader'
import ModuleList from './components/ModuleList'
import LoadingSpinner from './components/common/LoadingSpinner'
import ErrorRetry from './components/common/ErrorRetry'

import LoginPage from './pages/LoginPage'
import MainPage from './pages/MainPage'
import VideoModulePage from './pages/VideoModulePage'
import TextModulePage from './pages/TextModulePage'
import QuizModulePage from './pages/QuizModulePage'
import CourseCompletedPage from './pages/CourseCompletedPage'
import CertificatePage from './pages/CertificatePage'
import EditProfilePage from './pages/EditProfilePage'

import type { ModuleListItem } from './types/models'

function RequireAuth() {
  const { session } = useAuth()
  if (!session) return <Navigate to="/login" replace />
  return <Outlet />
}

// ─── CoursePage (moved from / to /course/:courseUuid) ─────────────────────────

function CoursePage() {
  const navigate = useNavigate()
  const { courseUuid = '' } = useParams<{ courseUuid: string }>()
  const { uiState, load } = useCourseDetail(courseUuid)

  useEffect(() => {
    if (courseUuid) load()
    else navigate('/')
  }, [courseUuid, load, navigate])

  /** Navigate to the correct module route based on module type.
   *  Mirrors: AWSCareerTourCourseFragment.handleModuleClick → AWSCareerTourModuleSVM.loadModuleByType */
  const handleItemClick = (item: ModuleListItem) => {
    if (uiState.status !== 'success') return
    const { items } = uiState

    if (item.kind === 'ModuleItem') {
      const uuid = item.module.module_uuid
      const type = item.module.content.type
      const state = { module: item.module, items, courseUuid, attemptUuid: crypto.randomUUID() }
      if (type === 'video') {
        navigate(`/module/${uuid}`, { state })
      } else if (type === 'quiz') {
        navigate(`/module/${uuid}/quiz`, { state })
      } else {
        navigate(`/module/${uuid}/text`, { state })
      }
    } else if (item.kind === 'SurveyItem') {
      const uuid = item.survey.module_uuid
      const state = {
        survey: item.survey,
        surveyType: item.surveyType,
        items,
        courseUuid,
        attemptUuid: crypto.randomUUID(),
      }
      navigate(`/module/${uuid}/quiz`, { state })
    }
  }

  const handleCtaClick = () => {
    if (uiState.status !== 'success') return
    const first = uiState.items.find(
      item =>
        (item.kind === 'ModuleItem' && item.moduleState === 1) ||
        (item.kind === 'SurveyItem' && item.state === 1),
    )
    if (first) handleItemClick(first)
  }

  if (uiState.status === 'idle' || uiState.status === 'loading') {
    return <div className="app-root full-overlay"><LoadingSpinner /></div>
  }

  if (uiState.status === 'error') {
    return <div className="app-root full-overlay"><ErrorRetry onRetry={load} /></div>
  }

  const { course, items } = uiState

  return (
    <div className="app-root">
      <div className="course-page">
        <div className="course-page__header-col">
          <CourseHeader
            course={course}
            courseUuid={courseUuid}
            onCtaClick={handleCtaClick}
            onBackClick={() => navigate(-1)}
          />
        </div>
        <div className="course-page__list-col">
          <ModuleList items={items} onItemClick={handleItemClick} />
        </div>
      </div>
    </div>
  )
}

// ─── App router ───────────────────────────────────────────────────────────────

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/" element={<MainPage />} />
        <Route path="/course/:courseUuid" element={<CoursePage />} />
        <Route path="/course/:courseUuid/completed" element={<CourseCompletedPage />} />
        <Route path="/module/:moduleUuid" element={<VideoModulePage />} />
        <Route path="/module/:moduleUuid/text" element={<TextModulePage />} />
        <Route path="/module/:moduleUuid/quiz" element={<QuizModulePage />} />
        <Route path="/certificate/:certUuid" element={<CertificatePage />} />
        <Route path="/profile/edit" element={<EditProfilePage />} />
      </Route>
    </Routes>
  )
}
