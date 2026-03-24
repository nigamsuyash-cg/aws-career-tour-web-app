import type { Chapter } from '../../types/models'
import { getModuleContentType } from '../../types/models'

interface Props {
  chapter: Chapter
  chapterNumber: number
}

export default function ChapterHeaderItem({ chapter }: Props) {
  const videoCount = chapter.module_list.filter((m) => getModuleContentType(m) === 'VIDEO').length
  const quizCount = chapter.module_list.filter((m) => getModuleContentType(m) === 'QUIZ').length
  const textCount = chapter.module_list.filter((m) => getModuleContentType(m) === 'TEXT').length

  const infoParts: string[] = []
  if (videoCount > 0) infoParts.push(`${videoCount} Video${videoCount > 1 ? 's' : ''}`)
  if (quizCount > 0) infoParts.push(`${quizCount} Test${quizCount > 1 ? 's' : ''}`)
  if (textCount > 0) infoParts.push(`${textCount} Doc${textCount > 1 ? 's' : ''}`)

  return (
    <div className="chapter-header-item">
      <span className="chapter-title">{chapter.chapter_name}</span>
      <span className="chapter-info">{infoParts.join(' • ')}</span>
    </div>
  )
}
