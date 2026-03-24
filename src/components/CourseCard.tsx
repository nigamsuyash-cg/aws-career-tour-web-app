import type { Course } from '../types/models'
import {
  getFormattedDuration,
  getFormattedEnrollmentCount,
  isCourseCompleted,
  isCourseInProgress,
} from '../types/models'

interface Props {
  course: Course
  onClick: (course: Course) => void
}

/** Large vertical course card — mirrors item_course_large.xml + CourseAdapter */
export default function CourseCard({ course, onClick }: Props) {
  const completion = Math.round(course.completion ?? 0)
  const completed = isCourseCompleted(course)
  const inProgress = isCourseInProgress(course)

  const btnLabel = completed ? 'View Certificate' : inProgress ? 'Resume' : 'Start Course'

  return (
    <div className="course-card" onClick={() => onClick(course)} role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick(course)}>
      <div className="course-card__thumb-wrap">
        <img
          className="course-card__thumb"
          src={course.thumbnail}
          alt={course.name}
          onError={e => { (e.target as HTMLImageElement).src = '/placeholder.png' }}
        />
        {/* Completion badge top-right */}
        {completed ? (
          <span className="completion-badge completion-badge--green">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/><polyline points="20 6 9 17 4 12" strokeOpacity="0.5" strokeWidth="0"/></svg>
            ✓✓ Completed
          </span>
        ) : (
          <span className="completion-badge completion-badge--grey">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 12h8M12 8v8"/></svg>
            Certificate
          </span>
        )}
      </div>

      <div className="course-card__body">
        <p className="course-card__title">{course.name}</p>
        <p className="course-card__desc">{course.description}</p>

        {inProgress ? (
          <div className="course-card__progress-row">
            <div className="course-card__progress-bar">
              <div className="course-card__progress-fill" style={{ width: `${completion}%` }} />
            </div>
            <span className="course-card__completion-label">{completion}% Completed</span>
          </div>
        ) : (
          <div className="course-card__meta-row">
            <span className="course-card__meta">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              {getFormattedEnrollmentCount(course.enrolled)} enrolled
            </span>
            <span className="course-card__meta">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {getFormattedDuration(course.duration)}
            </span>
          </div>
        )}

        <button
          className="course-card__btn"
          style={{ visibility: completed ? 'hidden' : 'visible' }}
          onClick={e => { e.stopPropagation(); onClick(course) }}
        >
          {btnLabel}
        </button>
      </div>
    </div>
  )
}
