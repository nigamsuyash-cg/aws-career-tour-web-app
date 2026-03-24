import type { Certificate } from '../types/models'
import { getFormattedIssueDate } from '../types/models'
import { useNavigate } from 'react-router-dom'

interface Props {
  certificate: Certificate
  onGoToCourse: (certificate: Certificate) => void
}

/** Certificate list item card — mirrors item_aws_career_tour_certificate.xml + CertificateAdapter */
export default function CertificateCard({ certificate, onGoToCourse }: Props) {
  const navigate = useNavigate()

  return (
    <div className="certificate-card">
      <div className="certificate-card__body">
        <p className="certificate-card__course">{certificate.course_name}</p>
        <p className="certificate-card__name">{certificate.name}</p>
        <p className="certificate-card__date">Issued: {getFormattedIssueDate(certificate.issue_date)}</p>
      </div>
      <div className="certificate-card__actions">
        <button
          className="certificate-card__btn certificate-card__btn--primary"
          onClick={() => navigate(`/certificate/${certificate.uuid}`, { state: { certificate } })}
        >
          View Certificate
        </button>
        <button
          className="certificate-card__btn certificate-card__btn--secondary"
          onClick={() => onGoToCourse(certificate)}
        >
          Go to Course
        </button>
      </div>
    </div>
  )
}
