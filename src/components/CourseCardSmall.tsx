import type { Course } from '../types/models'
import { isCourseInProgress } from '../types/models'

interface Props {
  course: Course
  onClick: (course: Course) => void
}

/** Compact horizontal card used in "Continue Learning" row — mirrors CourseHorizontalAdapter */
export default function CourseCardSmall({ course, onClick }: Props) {
  const completion = Math.round(course.completion ?? 0)
  const inProgress = isCourseInProgress(course)

  return (
    <div
      className="course-card-small"
      onClick={() => onClick(course)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick(course)}
    >
      <img
        className="course-card-small__thumb"
        src={course.thumbnail}
        alt={course.name}
        onError={e => { (e.target as HTMLImageElement).src = '/placeholder.png' }}
      />
      <div className="course-card-small__body">
        <p className="course-card-small__title">{course.name}</p>
        {inProgress && (
          <div className="course-card-small__progress-bar">
            <div className="course-card-small__progress-fill" style={{ width: `${completion}%` }} />
          </div>
        )}
        <span className="course-card-small__resume">Resume →</span>
      </div>
    </div>
  )
}
