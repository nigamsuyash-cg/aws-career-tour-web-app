import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { getUserProfile } from '../api/careerTourApi'
import { useAuth } from '../auth/AuthContext'
import type { Certificate } from '../types/models'
import LoadingSpinner from '../components/common/LoadingSpinner'

/** Mirrors AWSCareerTourCourseCompletedFragment */
export default function CourseCompletedPage() {
  const { courseUuid } = useParams<{ courseUuid: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  const [loading, setLoading] = useState(false)
  const [certificate, setCertificate] = useState<Certificate | null>(
    (location.state as { certificate?: Certificate } | null)?.certificate ?? null,
  )

  const { session } = useAuth()
  const userAlias = session?.userAlias ?? ''

  useEffect(() => {
    if (!courseUuid) navigate('/')
  }, [courseUuid, navigate])

  const handleViewCertificate = async () => {
    if (certificate) {
      navigate(`/certificate/${certificate.uuid}`, { state: { certificate } })
      return
    }
    setLoading(true)
    try {
      const profile = await getUserProfile({ user_alias: userAlias })
      const cert = profile.certificates.find(c => c.course_uuid === courseUuid) ?? null
      if (cert) {
        setCertificate(cert)
        navigate(`/certificate/${cert.uuid}`, { state: { certificate: cert } })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-root">
      <div className="course-completed-page">
        <button className="course-completed__close" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div className="course-completed__content">
          {/* Celebration illustration */}
          <div className="course-completed__illustration">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
              <circle cx="60" cy="60" r="55" fill="#E8F5E9"/>
              <circle cx="60" cy="60" r="40" fill="#C8E6C9"/>
              <path d="M38 60 L52 74 L82 44" stroke="#00BA34" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <h2 className="course-completed__title">Congratulations!</h2>
          <p className="course-completed__subtitle">You have successfully completed the course.</p>

          <button
            className="btn-next course-completed__btn"
            onClick={handleViewCertificate}
            disabled={loading}
          >
            {loading ? <LoadingSpinner /> : 'View Certificate'}
          </button>
        </div>
      </div>
    </div>
  )
}
