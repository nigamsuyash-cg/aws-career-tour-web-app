import type { ModuleListItem } from '../types/models'
import ChapterHeaderItem from './items/ChapterHeaderItem'
import SurveyHeaderItem from './items/SurveyHeaderItem'
import { ModuleItem, SurveyItem } from './items/ModuleItem'

interface Props {
  items: ModuleListItem[]
  onItemClick?: (item: ModuleListItem) => void
}

export default function ModuleList({ items, onItemClick }: Props) {
  return (
    <div className="module-list">
      {items.map((item, index) => {
        switch (item.kind) {
          case 'ChapterHeader':
            return (
              <ChapterHeaderItem
                key={`chapter-${item.chapter.chapter_uuid}`}
                chapter={item.chapter}
                chapterNumber={item.chapterNumber}
              />
            )
          case 'SurveyHeader':
            return <SurveyHeaderItem key={`survey-header-${index}`} title={item.title} />
          case 'ModuleItem':
            return (
              <ModuleItem
                key={`module-${item.module.module_uuid}`}
                module={item.module}
                moduleState={item.moduleState}
                onClick={() => onItemClick?.(item)}
              />
            )
          case 'SurveyItem':
            return (
              <SurveyItem
                key={`survey-${item.survey.module_uuid}`}
                survey={item.survey}
                state={item.state}
                onClick={() => onItemClick?.(item)}
              />
            )
          case 'ProfileCompletionBanner':
            return null
        }
      })}
    </div>
  )
}
