interface Props {
  state: 0 | 1 | 2
  isProfileCompleted: boolean
  onClick?: () => void
}

function ProfileIcon() {
  return (
    <svg width="22" height="26" viewBox="0 0 22 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="8" r="6" fill="#5597E1" />
      <path d="M1 24c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="#5597E1" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function ErrorDot() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="6" cy="6" r="6" fill="#EB5757" />
      <text x="6" y="9.5" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#fff">!</text>
    </svg>
  )
}

export default function ProfileCompletionBanner({ state, isProfileCompleted, onClick }: Props) {
  const isComplete = state === 2 || isProfileCompleted
  const isClickable = state >= 1

  const bannerText = isComplete
    ? 'Please confirm your details for certification'
    : 'To proceed forward kindly complete your profile'

  const btnBg = isComplete ? 'var(--color-primary)' : 'var(--color-disable-btn)'
  const progressValue = isComplete ? 100 : 50

  return (
    <div
      className={`profile-banner-card${isClickable ? ' clickable' : ''}`}
      onClick={isClickable ? onClick : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable && onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {/* Avatar */}
      <div className="profile-banner-avatar">
        <div className="profile-avatar-icon">
          <ProfileIcon />
        </div>
        {!isComplete && (
          <div className="profile-error-dot">
            <ErrorDot />
          </div>
        )}
      </div>

      {/* Text + progress */}
      <div className="profile-banner-content">
        <span className="profile-banner-text">{bannerText}</span>
        <div className="profile-progress-track">
          <div
            className="profile-progress-fill"
            style={{ width: `${progressValue}%` }}
          />
        </div>
      </div>

      {/* Action button */}
      <button
        className="profile-action-btn"
        style={{ background: btnBg }}
        onClick={(e) => { e.stopPropagation(); onClick?.() }}
        disabled={!isClickable}
      >
        Click Here
      </button>
    </div>
  )
}
