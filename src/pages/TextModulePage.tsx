import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTextModuleStats } from '../hooks/useTextModuleStats'
import { useModuleFlow } from '../hooks/useModuleFlow'
import type { Module, ModuleListItem } from '../types/models'

interface LocationState {
  module: Module
  items: ModuleListItem[]
  courseUuid: string
  attemptUuid: string
}

/** Mirrors AWSCareerTourTextModuleFragment */
export default function TextModulePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as LocationState | null

  const { startTimer, pauseTimer, getDurationMs } = useTextModuleStats()
  const { onModuleComplete } = useModuleFlow({
    items: state?.items ?? [],
    courseUuid: state?.courseUuid ?? '',
    attemptUuid: state?.attemptUuid ?? '',
  })

  useEffect(() => {
    if (!state) { navigate('/'); return }
    startTimer()
    return () => pauseTimer()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!state) return null

  const { module } = state

  const sendStats = (moveToNext: boolean) => {
    pauseTimer()
    const durationMs = getDurationMs()
    onModuleComplete({
      moduleUuid: module.module_uuid,
      type: 'module',
      completionPercentage: 100,
      timeSpentSeconds: Math.round(durationMs / 1000),
      isCompleted: true,
      answers: null,
      moveToNext,
    })
  }

  return (
    <div className="app-root">
      <div className="module-page text-module-page">
        {/* Toolbar */}
        <div className="module-toolbar">
          <button className="toolbar-back-btn" onClick={() => sendStats(false)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <span className="toolbar-title">{module.module_name}</span>
        </div>

        {/* Text content */}
        <div className="text-module-content">
          <p className="text-module-body">{module.content.text ?? ''}</p>
        </div>

        {/* Next button */}
        {!module.is_completed && (
          <div className="module-page__footer">
            <button className="btn-next" onClick={() => sendStats(true)}>
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
