import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { Certificate } from '../types/models'
import { getFormattedIssueDate } from '../types/models'

/** Mirrors AWSCareerTourCertificateFragment */
export default function CertificatePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [imageLoaded, setImageLoaded] = useState(false)

  const certificate = (location.state as { certificate?: Certificate } | null)?.certificate ?? null

  useEffect(() => {
    if (!certificate) navigate(-1)
  }, [certificate, navigate])

  // Set --cert-width CSS variable so overlay font sizes scale with image width
  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      el.style.setProperty('--cert-width', `${entry.contentRect.width}px`)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  if (!certificate) return null

  const handleDownload = () => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = certificate.template
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)

      const W = canvas.width
      const H = canvas.height
      const textColor = '#4B3A2E'

      // Username: centered between 20%-80%, top at 56.5%
      ctx.font = `600 ${W * 0.033}px sans-serif`
      ctx.fillStyle = textColor
      ctx.textAlign = 'center'
      ctx.fillText(certificate.name, W * 0.5, H * 0.565 + W * 0.033, W * 0.6)

      // Date: left at 77%, top at 83.5%
      const dateSize = W * 0.016
      ctx.font = `${dateSize}px sans-serif`
      ctx.textAlign = 'left'
      ctx.fillText(getFormattedIssueDate(certificate.issue_date), W * 0.77, H * 0.835 + dateSize)

      // Serial number: left at 79.8%, below date
      if (certificate.serial_number) {
        ctx.fillText(certificate.serial_number, W * 0.798, H * 0.835 + dateSize * 2.5)
      }

      canvas.toBlob(blob => {
        if (!blob) {
          window.open(certificate.template, '_blank')
          return
        }
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `certificate_${certificate.course_name.replace(/\s+/g, '_')}.png`
        a.click()
        URL.revokeObjectURL(url)
      }, 'image/png')
    }
    img.onerror = () => window.open(certificate.template, '_blank')
  }

  return (
    <div className="app-root">
      <div className="certificate-page">
        {/* Toolbar */}
        <div className="module-toolbar">
          <button className="toolbar-back-btn" onClick={() => navigate(-1)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <span className="toolbar-title">View Certificate</span>
          <button className="toolbar-action-btn" onClick={handleDownload}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>
        </div>

        <div className="certificate-page__content">
          {/* Certificate image with text overlays */}
          <div className="certificate-page__image-wrapper" ref={wrapperRef}>
            <img
              className="certificate-page__cert-image"
              src={certificate.template}
              alt="Certificate"
              onLoad={() => setImageLoaded(true)}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            {imageLoaded && (
              <>
                {/* Username: centered between 20%-80%, top at 56.5% */}
                <span className="cert-overlay cert-overlay--name">
                  {certificate.name}
                </span>
                {/* Date: left at 77%, top at 83.5% */}
                <span className="cert-overlay cert-overlay--date">
                  {getFormattedIssueDate(certificate.issue_date)}
                </span>
                {/* Serial number: left at 79.8%, below date */}
                {certificate.serial_number && (
                  <span className="cert-overlay cert-overlay--serial">
                    {certificate.serial_number}
                  </span>
                )}
              </>
            )}
          </div>

          {/* Certificate details */}
          <div className="certificate-page__details">
            <div className="certificate-detail-row">
              <span className="certificate-detail-label">Name</span>
              <span className="certificate-detail-value">{certificate.name}</span>
            </div>
            <div className="certificate-detail-row">
              <span className="certificate-detail-label">Course</span>
              <span className="certificate-detail-value">{certificate.course_name}</span>
            </div>
            <div className="certificate-detail-row">
              <span className="certificate-detail-label">Certificate ID</span>
              <span className="certificate-detail-value certificate-detail-value--mono">{certificate.uuid}</span>
            </div>
            <div className="certificate-detail-row">
              <span className="certificate-detail-label">Issue Date</span>
              <span className="certificate-detail-value">{getFormattedIssueDate(certificate.issue_date)}</span>
            </div>
            {certificate.serial_number && (
              <div className="certificate-detail-row">
                <span className="certificate-detail-label">Serial No.</span>
                <span className="certificate-detail-value certificate-detail-value--mono">{certificate.serial_number}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
