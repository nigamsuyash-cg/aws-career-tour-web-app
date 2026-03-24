import { useNavigate } from 'react-router-dom'
import type { Course } from '../types/models'
import {
  isCourseCompleted,
  isCourseInProgress,
  getFormattedDuration,
  getFormattedEnrollmentCount,
} from '../types/models'

interface Props {
  course: Course
  courseUuid: string
  onCtaClick: () => void
  onBackClick: () => void
}

// ─── Inline SVG icons matching Android drawables ──────────────────────────────

function IconDoubleTick() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 7l3.5 3.5L11 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 7l3.5 3.5L14 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconCertificate() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="1" width="8" height="10" rx="1" fill="#C3D2FC" />
      <circle cx="10" cy="10" r="3" fill="#FBE063" />
      <path d="M9 10l.8.8L11.5 9" stroke="#fff" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconClock() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7" cy="7" r="5.5" stroke="#999" strokeWidth="1.2" />
      <path d="M7 4.5V7l1.8 1.8" stroke="#999" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function IconGroup() {
  return (
    <svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="5.5" cy="4" r="2.5" fill="#999" />
      <circle cx="10.5" cy="4" r="2.5" fill="#999" />
      <path d="M1 13c0-2.761 2.015-5 4.5-5S10 10.239 10 13" stroke="#999" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M10 8.5c1.1-.3 2.2.2 3 1.5.5.9.8 1.9.9 3" stroke="#999" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CourseHeader({ course, courseUuid, onCtaClick, onBackClick }: Props) {
  const navigate = useNavigate()
  const completed = isCourseCompleted(course)
  const inProgress = isCourseInProgress(course)
  const completionPct = Math.round(course.completion ?? 0)

  return (
    <div className="course-header">
      {/* Toolbar */}
      <div className="toolbar">
        <button className="back-btn" onClick={onBackClick} aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M13 4l-6 6 6 6" stroke="#0E0E0E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="toolbar-title">{course.name}</span>
      </div>

      {/* Thumbnail */}
      <div className="thumbnail-wrap">
        <img
          className="course-thumbnail"
          src={course.thumbnail}
          alt={course.name}
          onError={(e) => {
            ;(e.target as HTMLImageElement).src =
              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100%25" height="200" viewBox="0 0 400 200"%3E%3Crect width="400" height="200" fill="%23C3D2FC"/%3E%3C/svg%3E'
          }}
        />

        {/* Completion indicator badge */}
        {completed ? (
          <span className="completion-badge completed">
            <IconDoubleTick />
            Completed
          </span>
        ) : (
          <span className="completion-badge not-started">
            <IconCertificate />
            Certificate
          </span>
        )}
      </div>

      {/* Description */}
      <p className="course-description">{course.description}</p>

      {/* Progress / enrollment row */}
      {inProgress ? (
        <div className="progress-section">
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${completionPct}%` }} />
          </div>
          <span className="completion-badge-yellow">{completionPct}% Completed</span>
        </div>
      ) : (
        <div className="meta-row">
          <span className="meta-item">
            <IconGroup />
            {getFormattedEnrollmentCount(course.enrolled)} enrolled
          </span>
          <span className="meta-item">
            <IconClock />
            {getFormattedDuration(course.duration)}
          </span>
        </div>
      )}

      {/* CTA buttons */}
      {completed ? (
        <button className="btn-view-certificate" onClick={() => navigate(`/course/${courseUuid}/completed`)}>
          View Certificate
        </button>
      ) : (
        <button className="btn-next" onClick={onCtaClick}>
          {inProgress ? 'Resume' : 'Start Course'}
        </button>
      )}
    </div>
  )
}
