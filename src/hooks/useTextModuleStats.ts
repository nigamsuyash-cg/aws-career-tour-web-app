import { useRef, useCallback } from 'react'

/** Mirrors AWSCareerTourTextModuleViewModel: tracks wall-clock time spent on a text module. */
export function useTextModuleStats() {
  const startTimeRef = useRef<number>(Date.now())
  const accumulatedMs = useRef<number>(0)

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now()
  }, [])

  const pauseTimer = useCallback(() => {
    accumulatedMs.current += Date.now() - startTimeRef.current
  }, [])

  /** Returns total elapsed duration in milliseconds (includes paused intervals). */
  const getDurationMs = useCallback((): number => {
    return accumulatedMs.current + (Date.now() - startTimeRef.current)
  }, [])

  return { startTimer, pauseTimer, getDurationMs }
}
