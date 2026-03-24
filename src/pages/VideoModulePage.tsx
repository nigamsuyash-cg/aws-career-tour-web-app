import { useEffect, useRef, useState, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ReactPlayer from 'react-player'
import { useModuleStats } from '../hooks/useModuleStats'
import { useModuleFlow } from '../hooks/useModuleFlow'
import type { Module, ModuleListItem } from '../types/models'

// Location state shape passed from CoursePage
interface VideoModuleLocationState {
  module: Module
  courseUuid: string
  items: ModuleListItem[]
  attemptUuid: string
}

export default function VideoModulePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as VideoModuleLocationState | null

  // Guard: if no state was passed (e.g. direct URL entry), go back
  useEffect(() => {
    if (!state?.module) {
      navigate(-1)
    }
  }, [state, navigate])

  const module = state?.module as Module
  const courseUuid = state?.courseUuid ?? ''
  const items = state?.items ?? []
  const attemptUuid = state?.attemptUuid ?? crypto.randomUUID()

  const { setDuration, setPlayedSeconds, isSatisfied, sendStats, getCompletion, getTimeSpentSeconds, resetStats } =
    useModuleStats({ module, courseUuid, attemptUuid })

  const { onModuleComplete } = useModuleFlow({ items, courseUuid, attemptUuid })

  const [showNextBtn, setShowNextBtn] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [isNavigating, setIsNavigating] = useState(false)
  const playerRef = useRef<ReactPlayer>(null)
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Reset all per-module state when navigating to a new module via replace: true
  // (component instance is reused, so state/refs must be reset manually)
  useEffect(() => {
    setShowNextBtn(false)
    setIsNavigating(false)
    resetStats()
    playerRef.current?.seekTo(0)
  }, [module?.module_uuid])

  // Auto-hide controls after 3 seconds of no interaction (mirrors ExoPlayer controller behaviour)
  const resetControlsTimer = useCallback(() => {
    setControlsVisible(true)
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current)
    controlsTimerRef.current = setTimeout(() => setControlsVisible(false), 3000)
  }, [])

  useEffect(() => {
    resetControlsTimer()
    return () => {
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current)
    }
  }, [resetControlsTimer])

  // Back handler — send stats then navigate back (mirrors onBackPressedCallback)
  const handleBack = useCallback(async () => {
    if (isNavigating) return
    setIsNavigating(true)
    await sendStats(false)
    navigate(-1)
  }, [isNavigating, sendStats, navigate])

  // Next button — only active when threshold satisfied (mirrors btnNext.clickWithDebounce)
  const handleNext = useCallback(async () => {
    if (isNavigating) return
    if (!isSatisfied()) {
      alert(`You have to watch this video completely to proceed further.`)
      return
    }
    setIsNavigating(true)
    await onModuleComplete({
      moduleUuid: module.module_uuid,
      type: 'module',
      completionPercentage: getCompletion(),
      timeSpentSeconds: getTimeSpentSeconds(),
      isCompleted: true,
      answers: null,
      moveToNext: true,
    })
  }, [isNavigating, isSatisfied, onModuleComplete, module, getCompletion, getTimeSpentSeconds])

  if (!module) return null

  return (
    <div className="video-page" onClick={resetControlsTimer} onMouseMove={resetControlsTimer}>
      {/* Full-screen player */}
      <div className="video-player-wrap">
        <ReactPlayer
          ref={playerRef}
          url={module.content.video ?? ''}
          width="100%"
          height="100%"
          controls
          playing
          config={{
            file: {
              forceHLS: module.content.video?.includes('.m3u8') ?? false,
              attributes: { controlsList: 'nodownload' },
            },
          }}
          onDuration={(d) => setDuration(d)}
          onProgress={({ playedSeconds }) => {
            setPlayedSeconds(playedSeconds)
          }}
          onEnded={() => {
            // Show Next button when video finishes (mirrors Player.STATE_ENDED)
            setShowNextBtn(!module.is_completed)
          }}
        />
      </div>

      {/* Toolbar — overlaid, visibility mirrors ExoPlayer controller visibility */}
      <div className={`video-toolbar${controlsVisible ? ' visible' : ''}`}>
        <button className="back-btn" onClick={handleBack} aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M13 4l-6 6 6 6"
              stroke="#0E0E0E"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <span className="toolbar-title">{module.module_name}</span>
      </div>

      {/* Next button — bottom-center, hidden until threshold met or video ended */}
      {showNextBtn && (
        <div className="video-next-wrap">
          <button className="video-next-btn" onClick={handleNext} disabled={isNavigating}>
            Next
          </button>
        </div>
      )}
    </div>
  )
}
