interface Props {
  title: string
}

export default function SurveyHeaderItem({ title }: Props) {
  return (
    <div className="chapter-header-item">
      <span className="chapter-title">{title}</span>
    </div>
  )
}
