import { useState, useCallback } from 'react'
import { getCourseList } from '../api/careerTourApi'
import { useAuth } from '../auth/AuthContext'
import type { Course } from '../types/models'
import { isCourseInProgress } from '../types/models'

type UiState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; allCourses: Course[]; continueLearning: Course[] }
  | { status: 'error' }

export function useCourseList() {
  const { session } = useAuth()
  const userAlias = session?.userAlias ?? ''
  const [uiState, setUiState] = useState<UiState>({ status: 'idle' })

  const load = useCallback(async (language = 'en') => {
    setUiState({ status: 'loading' })
    try {
      const response = await getCourseList({ user_alias: userAlias, language })
      const courses = response.course_list ?? []
      setUiState({
        status: 'success',
        allCourses: courses,
        continueLearning: courses.filter(isCourseInProgress),
      })
    } catch {
      setUiState({ status: 'error' })
    }
  }, [userAlias])

  return { uiState, load }
}
