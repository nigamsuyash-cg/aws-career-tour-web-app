import React from 'react'
import type { Module, SurveyModule } from '../../types/models'
import { getModuleContentType } from '../../types/models'

// ─── Icons (inline SVG, matching the exact Android drawables) ─────────────────

function IconLock() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="15" cy="15" r="15" fill="#C3D2FC" fillOpacity="0.3" />
      <rect x="10" y="14" width="10" height="8" rx="1.5" fill="#000" />
      <path d="M12 14v-2.5a3 3 0 0 1 6 0V14" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IconCompleted() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="15" cy="15" r="15" fill="#00BA34" />
      <path d="M9 15l4.5 4.5L21 10" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconVideo() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="15" cy="15" r="15" fill="#E3ECFB" />
      <polygon points="12,10 22,15 12,20" fill="#386AF6" />
    </svg>
  )
}

function IconQuiz() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="15" cy="15" r="15" fill="#E3ECFB" />
      <text x="15" y="20" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#386AF6">?</text>
    </svg>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ModuleProps {
  module: Module
  moduleState: 0 | 1 | 2
  onClick?: () => void
}

export function ModuleItem({ module, moduleState, onClick }: ModuleProps) {
  const contentType = getModuleContentType(module)

  let icon: React.ReactNode
  if (moduleState === 0) {
    icon = <IconLock />
  } else if (moduleState === 2) {
    icon = <IconCompleted />
  } else {
    icon = contentType === 'VIDEO' ? <IconVideo /> : <IconQuiz />
  }

  const isClickable = moduleState >= 1
  const nameColor = moduleState === 0 ? 'var(--color-text-secondary)' : 'var(--color-text-primary)'

  return (
    <div
      className={`module-card${isClickable ? ' clickable' : ''}`}
      onClick={isClickable ? onClick : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable && onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <div className="module-icon">{icon}</div>
      <span className="module-name" style={{ color: nameColor }}>{module.module_name}</span>
      {moduleState === 1 && (
        <button className="module-action-btn" onClick={(e) => { e.stopPropagation(); onClick?.() }}>
          Resume
        </button>
      )}
    </div>
  )
}

// ─── Survey variant (same layout, survey data) ────────────────────────────────

interface SurveyProps {
  survey: SurveyModule
  state: 0 | 1 | 2
  onClick?: () => void
}

export function SurveyItem({ survey, state, onClick }: SurveyProps) {
  let icon: React.ReactNode
  if (state === 0) {
    icon = <IconLock />
  } else if (state === 2) {
    icon = <IconCompleted />
  } else {
    icon = <IconQuiz />
  }

  const isClickable = state >= 1
  const nameColor = state === 0 ? 'var(--color-text-secondary)' : 'var(--color-text-primary)'

  return (
    <div
      className={`module-card${isClickable ? ' clickable' : ''}`}
      onClick={isClickable ? onClick : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable && onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <div className="module-icon">{icon}</div>
      <span className="module-name" style={{ color: nameColor }}>{survey.module_name}</span>
      {state === 1 && (
        <button className="module-action-btn" onClick={(e) => { e.stopPropagation(); onClick?.() }}>
          Resume
        </button>
      )}
    </div>
  )
}
