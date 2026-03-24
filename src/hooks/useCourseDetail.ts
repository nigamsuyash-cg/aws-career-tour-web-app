import { useState, useCallback } from 'react'
import { getModuleList } from '../api/careerTourApi'
import { useAuth } from '../auth/AuthContext'
import type {
  Course,
  ModuleListItem,
  ModuleListResponse,
} from '../types/models'
import {
  isPreSignupSurvey,
  isPostSessionSurvey,
  isSurveyCompleted,
  isModuleCompleted,
} from '../types/models'

// ─── Constants matching AwsCareerToursConstants.kt ───────────────────────────
const TITLE_PRE_SIGNUP = 'Pre-Signup Survey'
const TITLE_POST_SESSION = 'Feedback'

// ─── Local completion cache (sessionStorage) ──────────────────────────────────
// The course page re-fetches from the API on every mount. If submitModuleStats
// failed silently (best-effort), the server still shows the module as incomplete,
// causing the Resume button to appear on the wrong module. We cache completions
// locally within the session so the module list reflects the user's actual progress.

const cacheKey = (courseUuid: string) => `ct_done_${courseUuid}`

export function cacheCompletion(courseUuid: string, moduleUuid: string): void {
  try {
    const key = cacheKey(courseUuid)
    const existing: string[] = JSON.parse(sessionStorage.getItem(key) ?? '[]')
    if (!existing.includes(moduleUuid)) {
      sessionStorage.setItem(key, JSON.stringify([...existing, moduleUuid]))
    }
  } catch { /* sessionStorage unavailable */ }
}

function getCachedCompletions(courseUuid: string): Set<string> {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(cacheKey(courseUuid)) ?? '[]'))
  } catch {
    return new Set()
  }
}

// ─── State shape ──────────────────────────────────────────────────────────────
type UiState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; course: Course; items: ModuleListItem[]; raw: ModuleListResponse }
  | { status: 'error'; message: string }

// ─── Build flat list — 1:1 port of AWSCareerTourCourseViewModel.buildModuleListItems ──
function buildModuleListItems(data: ModuleListResponse, localCompletions: Set<string>): ModuleListItem[] {
  const items: ModuleListItem[] = []
  let preSignUpSurveyCompleted = true

  // Pre-signup survey section
  if (data.survey_list.length > 0) {
    items.push({ kind: 'SurveyHeader', title: TITLE_PRE_SIGNUP })

    data.survey_list.forEach((survey) => {
      if (isPreSignupSurvey(survey)) {
        const completed = isSurveyCompleted(survey) || localCompletions.has(survey.module_uuid)
        const state = completed ? 2 : 1
        items.push({ kind: 'SurveyItem', surveyType: 'PRE_SIGNUP', survey, state })
      }
    })

    preSignUpSurveyCompleted = data.survey_list
      .filter(isPreSignupSurvey)
      .every(s => isSurveyCompleted(s) || localCompletions.has(s.module_uuid))
  }

  let foundFirstIncomplete = !preSignUpSurveyCompleted
  let firstIncompleteUuid = ''

  data.chapter_list.forEach((chapter, chapterIndex) => {
    items.push({ kind: 'ChapterHeader', chapter, chapterNumber: chapterIndex + 1 })

    chapter.module_list.forEach((module) => {
      const moduleCompleted = isModuleCompleted(module) || localCompletions.has(module.module_uuid)

      if (!moduleCompleted && !foundFirstIncomplete) {
        firstIncompleteUuid = module.module_uuid
        foundFirstIncomplete = true
      }

      let state: 0 | 1 | 2
      if (moduleCompleted) {
        state = 2
      } else if (module.module_uuid === firstIncompleteUuid) {
        state = 1
      } else {
        state = 0
      }

      items.push({ kind: 'ModuleItem', module, moduleState: state })
    })
  })

  // Post-session survey section
  if (data.survey_list.length > 0) {
    items.push({ kind: 'SurveyHeader', title: TITLE_POST_SESSION })
    const allChaptersCompleted = data.chapter_list.every(chapter =>
      chapter.module_list.every(m => isModuleCompleted(m) || localCompletions.has(m.module_uuid))
    )
    const previousActivityCompleted = preSignUpSurveyCompleted && allChaptersCompleted

    data.survey_list.forEach((survey) => {
      if (isPostSessionSurvey(survey)) {
        let state: 0 | 1 | 2
        if (!previousActivityCompleted) {
          state = 0
        } else if (isSurveyCompleted(survey) || localCompletions.has(survey.module_uuid)) {
          state = 2
        } else {
          state = 1
        }
        items.push({ kind: 'SurveyItem', surveyType: 'POST_SESSION', survey, state })
      }
    })
  }

  return items
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useCourseDetail(courseUuid: string) {
  const { session } = useAuth()
  const userAlias = session?.userAlias ?? ''
  const [uiState, setUiState] = useState<UiState>({ status: 'idle' })

  const load = useCallback(async () => {
    setUiState({ status: 'loading' })
    try {
      const data = await getModuleList({ user_alias: userAlias, course_uuid: courseUuid })
      const items = buildModuleListItems(data, getCachedCompletions(courseUuid))
      setUiState({ status: 'success', course: data.course, items, raw: data })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setUiState({ status: 'error', message })
    }
  }, [courseUuid, userAlias])

  return { uiState, load }
}
