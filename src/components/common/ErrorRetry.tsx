interface Props {
  onRetry: () => void
}

export default function ErrorRetry({ onRetry }: Props) {
  return (
    <div className="error-retry-container">
      <p className="error-header">Something went wrong</p>
      <button className="retry-button" onClick={onRetry}>
        Refresh
      </button>
    </div>
  )
}
