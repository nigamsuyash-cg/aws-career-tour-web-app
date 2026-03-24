import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { submitModuleStats } from '../api/careerTourApi'
import { useAuth } from '../auth/AuthContext'
import { cacheCompletion } from './useCourseDetail'
import type { ModuleListItem, Answer } from '../types/models'

interface UseModuleFlowOptions {
  /** Full ordered flat list of items (same object passed from CoursePage) */
  items: ModuleListItem[]
  courseUuid: string
  attemptUuid: string
}

/**
 * Mirrors AWSCareerTourModuleSVM.setModuleStatsCompletion + loadFirstIncompleteModule.
 * After a module is completed, submits stats, marks it done locally, then navigates
 * to the next incomplete module (or to CourseCompleted if all done).
 */
export function useModuleFlow({ items, courseUuid, attemptUuid }: UseModuleFlowOptions) {
  const navigate = useNavigate()
  const { session } = useAuth()
  const userAlias = session?.userAlias ?? ''

  /** Find the next module/survey that is still available (state === 1). */
  const findNextIncomplete = useCallback(
    (updatedItems: ModuleListItem[]): ModuleListItem | null => {
      return (
        updatedItems.find(
          item =>
            (item.kind === 'ModuleItem' && item.moduleState === 1) ||
            (item.kind === 'SurveyItem' && item.state === 1),
        ) ?? null
      )
    },
    [],
  )

  /** Mark an item as completed in the items array and return the new array.
   *  Also promotes the first remaining locked (state=0) module/survey to unlocked (state=1),
   *  mirroring Android's AWSCareerTourModuleSVM where allModules only ever has state 1 or 2.
   *  Without this, findNextIncomplete would find nothing after the first completion and
   *  incorrectly show the Course Completed screen. */
  const markCompleted = useCallback(
    (uuid: string, updatedItems: ModuleListItem[]): ModuleListItem[] => {
      let promoted = false
      return updatedItems.map(item => {
        if (item.kind === 'ModuleItem' && item.module.module_uuid === uuid) {
          return { ...item, moduleState: 2 as const }
        }
        if (item.kind === 'SurveyItem' && item.survey.module_uuid === uuid) {
          return { ...item, state: 2 as const }
        }
        if (!promoted && item.kind === 'ModuleItem' && item.moduleState === 0) {
          promoted = true
          return { ...item, moduleState: 1 as const }
        }
        if (!promoted && item.kind === 'SurveyItem' && item.state === 0) {
          promoted = true
          return { ...item, state: 1 as const }
        }
        return item
      })
    },
    [],
  )

  /** Navigate to the correct route for the next module item. */
  const navigateToModule = useCallback(
    (item: ModuleListItem, updatedItems: ModuleListItem[]) => {
      const state = { items: updatedItems, courseUuid, attemptUuid: crypto.randomUUID() }

      if (item.kind === 'ModuleItem') {
        const uuid = item.module.module_uuid
        const type = item.module.content.type
        if (type === 'video') {
          navigate(`/module/${uuid}`, { state: { ...state, module: item.module }, replace: true })
        } else if (type === 'quiz') {
          navigate(`/module/${uuid}/quiz`, { state: { ...state, module: item.module }, replace: true })
        } else {
          navigate(`/module/${uuid}/text`, { state: { ...state, module: item.module }, replace: true })
        }
      } else if (item.kind === 'SurveyItem') {
        const uuid = item.survey.module_uuid
        navigate(`/module/${uuid}/quiz`, {
          state: { ...state, survey: item.survey, surveyType: item.surveyType },
          replace: true,
        })
      }
    },
    [navigate, courseUuid, attemptUuid],
  )

  /**
   * Called by each module page after user finishes the module.
   * - Submits stats to API (best-effort)
   * - If moveToNext=true + isCompleted: marks done, finds next, navigates
   * - If moveToNext=false: navigates back to course
   */
  const onModuleComplete = useCallback(
    async (options: {
      moduleUuid: string
      type: 'module' | 'survey'
      completionPercentage: number
      timeSpentSeconds: number
      isCompleted: boolean
      answers: Answer[] | null
      moveToNext: boolean
    }) => {
      const { moduleUuid, type, completionPercentage, timeSpentSeconds, isCompleted, answers, moveToNext } = options

      // Submit stats (best-effort)
      try {
        await submitModuleStats({
          user_alias: userAlias,
          course_uuid: courseUuid,
          module_uuid: moduleUuid,
          type,
          attempt_uuid: attemptUuid,
          completion: completionPercentage,
          time_spent: timeSpentSeconds,
          is_completed: isCompleted,
          answers,
        })
      } catch {
        // best-effort
      }

      if (!moveToNext) {
        navigate(-1)
        return
      }

      if (isCompleted) {
        cacheCompletion(courseUuid, moduleUuid)
        const updatedItems = markCompleted(moduleUuid, items)
        const next = findNextIncomplete(updatedItems)
        if (next) {
          navigateToModule(next, updatedItems)
        } else {
          navigate(`/course/${courseUuid}/completed`, { replace: true })
        }
      } else {
        navigate(-1)
      }
    },
    [userAlias, courseUuid, attemptUuid, items, markCompleted, findNextIncomplete, navigateToModule, navigate],
  )

  return { onModuleComplete }
}
