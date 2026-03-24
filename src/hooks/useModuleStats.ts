import { useRef, useCallback } from 'react'
import { submitModuleStats } from '../api/careerTourApi'
import { useAuth } from '../auth/AuthContext'
import type { Module } from '../types/models'

// Mirrors CareerTourRequirements.minimumThreshold = 90 (Firebase Remote Config default)
const MINIMUM_THRESHOLD = 90

interface UseModuleStatsOptions {
  module: Module
  courseUuid: string
  attemptUuid: string
}

export function useModuleStats({ module, courseUuid, attemptUuid }: UseModuleStatsOptions) {
  const { session } = useAuth()
  const userAlias = session?.userAlias ?? ''
  const playedSecondsRef = useRef(0)
  const durationRef = useRef(0)

  const setDuration = useCallback((seconds: number) => {
    durationRef.current = seconds
  }, [])

  const setPlayedSeconds = useCallback((seconds: number) => {
    // Only update forward — mirrors ExoPlayer's totalPlayTimeMs accumulation
    if (seconds > playedSecondsRef.current) {
      playedSecondsRef.current = seconds
    }
  }, [])

  const getCompletion = useCallback((): number => {
    if (durationRef.current <= 0) return 0
    return Math.min(100, Math.round((playedSecondsRef.current / durationRef.current) * 100))
  }, [])

  const isSatisfied = useCallback((): boolean => {
    return getCompletion() >= MINIMUM_THRESHOLD
  }, [getCompletion])

  const sendStats = useCallback(
    async (moveToNext: boolean) => {
      const completion = getCompletion()
      const isCompleted = isSatisfied()
      try {
        await submitModuleStats({
          user_alias: userAlias,
          course_uuid: courseUuid,
          module_uuid: module.module_uuid,
          type: 'module',
          attempt_uuid: attemptUuid,
          completion,
          time_spent: Math.round(playedSecondsRef.current),
          is_completed: moveToNext ? isCompleted : false,
          answers: null,
        })
      } catch {
        // Stats submission is best-effort — don't block navigation on failure
      }
      return { completion, isCompleted }
    },
    [module, courseUuid, attemptUuid, userAlias, getCompletion, isSatisfied],
  )

  const getTimeSpentSeconds = useCallback((): number => {
    return Math.round(playedSecondsRef.current)
  }, [])

  const resetStats = useCallback(() => {
    playedSecondsRef.current = 0
    durationRef.current = 0
  }, [])

  return {
    setDuration,
    setPlayedSeconds,
    getCompletion,
    getTimeSpentSeconds,
    isSatisfied,
    sendStats,
    resetStats,
    minimumThreshold: MINIMUM_THRESHOLD,
  }
}
