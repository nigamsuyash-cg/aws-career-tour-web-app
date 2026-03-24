import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useQuizModule } from '../hooks/useQuizModule'
import { useModuleFlow } from '../hooks/useModuleFlow'
import type { Module, SurveyModule, ModuleListItem, QuizQuestion, Answer } from '../types/models'

interface LocationState {
  /** Regular module (quiz type) */
  module?: Module
  /** Survey item */
  survey?: SurveyModule
  surveyType?: string
  items: ModuleListItem[]
  courseUuid: string
  attemptUuid: string
}

function getQuestionsFromModule(state: LocationState): QuizQuestion[] {
  if (state.survey) {
    return state.survey.content.pre_signup ?? state.survey.content.post_session ?? []
  }
  return state.module?.content.quiz ?? []
}

function getModuleInfo(state: LocationState): { uuid: string; name: string; type: 'module' | 'survey'; isCompleted: boolean } {
  if (state.survey) {
    return { uuid: state.survey.module_uuid, name: state.survey.module_name, type: 'survey', isCompleted: state.survey.is_completed }
  }
  return {
    uuid: state.module!.module_uuid,
    name: state.module!.module_name,
    type: 'module',
    isCompleted: state.module!.is_completed,
  }
}

/** Mirrors AWSCareerTourQuizModuleFragment */
export default function QuizModulePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as LocationState | null

  const questions = state ? getQuestionsFromModule(state) : []
  const quiz = useQuizModule(questions)

  const { onModuleComplete } = useModuleFlow({
    items: state?.items ?? [],
    courseUuid: state?.courseUuid ?? '',
    attemptUuid: state?.attemptUuid ?? '',
  })

  useEffect(() => {
    if (!state) { navigate('/'); return }
    quiz.startTimer()
    return () => quiz.pauseTimer()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!state) return null

  const modInfo = getModuleInfo(state)

  const sendStats = (moveToNext: boolean) => {
    quiz.pauseTimer()
    const answerList = Array.from(quiz.answersMap.values())
    const completion = moveToNext ? 100 : Math.round((answerList.length * 100) / Math.max(questions.length, 1))
    onModuleComplete({
      moduleUuid: modInfo.uuid,
      type: modInfo.type,
      completionPercentage: completion,
      timeSpentSeconds: Math.round(quiz.getDurationMs() / 1000),
      isCompleted: completion >= 100,
      answers: answerList,
      moveToNext,
    })
  }

  const handleNext = () => {
    if (quiz.isLastQuestion) {
      if (quiz.areAllQuestionsAnswered) {
        sendStats(true)
      }
    } else {
      if (quiz.isCurrentQuestionAnswered) {
        quiz.nextQuestion()
      }
    }
  }

  const handleBack = () => {
    const answerList = Array.from(quiz.answersMap.values())
    if (answerList.length > 0) {
      sendStats(false)
    } else {
      navigate(-1)
    }
  }

  const q = quiz.currentQuestion
  const btnText = quiz.isLastQuestion ? 'Submit' : 'Next'
  const btnEnabled = quiz.isLastQuestion ? quiz.areAllQuestionsAnswered : quiz.isCurrentQuestionAnswered

  return (
    <div className="app-root">
      <div className="module-page quiz-module-page">
        {/* Toolbar */}
        <div className="module-toolbar">
          <button className="toolbar-back-btn" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <span className="toolbar-title">{modInfo.name}</span>
          <span className="toolbar-counter">{quiz.currentIndex + 1}/{quiz.totalQuestions}</span>
        </div>

        {q && (
          <div className="quiz-content">
            <p className="quiz-question-text">{q.text}</p>
            <div className="quiz-options">
              {q.type.toUpperCase() === 'SINGLE_SELECT' && renderSingleSelect(q, quiz)}
              {q.type.toUpperCase() === 'NUMBER' && renderNumberInput(q, quiz)}
              {q.type.toUpperCase() === 'TEXT' && renderTextInput(q, quiz)}
            </div>
          </div>
        )}

        <div className="module-page__footer">
          <button
            className={`btn-next ${!btnEnabled ? 'btn-next--disabled' : ''}`}
            onClick={handleNext}
            disabled={!btnEnabled}
          >
            {btnText}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Question renderers ───────────────────────────────────────────────────────

function renderSingleSelect(q: QuizQuestion, quiz: ReturnType<typeof useQuizModule>) {
  const currentAnswer = quiz.getAnswer(q.question_uuid)
  const hasCorrectAnswer = q.correct_answer_uuid != null
  const isAnswered = currentAnswer != null

  return (q.options ?? []).map(opt => {
    const isSelected = currentAnswer?.selected_option_uuid === opt.option_uuid
    const isCorrect = q.correct_answer_uuid === opt.option_uuid

    let optClass = 'quiz-option quiz-option--unselected'
    let checkmark: React.ReactNode = null

    if (!hasCorrectAnswer || !isAnswered) {
      if (isSelected) optClass = 'quiz-option quiz-option--selected'
    } else {
      if (isCorrect) {
        optClass = 'quiz-option quiz-option--correct'
        checkmark = <span className="quiz-option__check quiz-option__check--correct">✓</span>
      } else if (isSelected) {
        optClass = 'quiz-option quiz-option--incorrect'
        checkmark = <span className="quiz-option__check quiz-option__check--incorrect">✗</span>
      }
    }

    const handleClick = () => {
      if (hasCorrectAnswer && isAnswered) return
      const answer: Answer = {
        type: 'SINGLE_SELECT',
        question_uuid: q.question_uuid,
        user_answer: opt.option_text,
        is_correct: q.correct_answer_uuid == null ? null : q.correct_answer_uuid === opt.option_uuid,
        selected_option_uuid: opt.option_uuid,
      }
      quiz.updateAnswer(q.question_uuid, answer)
    }

    return (
      <div key={opt.option_uuid} className={optClass} onClick={handleClick}
        role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && handleClick()}>
        <span className="quiz-option__text">{opt.option_text}</span>
        {checkmark}
      </div>
    )
  })
}

function renderNumberInput(q: QuizQuestion, quiz: ReturnType<typeof useQuizModule>) {
  const current = quiz.getAnswer(q.question_uuid)
  return (
    <input
      key={q.question_uuid}
      className="quiz-text-input"
      type="number"
      placeholder="Enter a number"
      defaultValue={current?.user_answer ?? ''}
      onChange={e => {
        const val = e.target.value
        if (!val) { quiz.removeAnswer(q.question_uuid); return }
        quiz.updateAnswer(q.question_uuid, {
          type: 'NUMBER', question_uuid: q.question_uuid, user_answer: Number(val),
        })
      }}
    />
  )
}

function renderTextInput(q: QuizQuestion, quiz: ReturnType<typeof useQuizModule>) {
  const current = quiz.getAnswer(q.question_uuid)
  return (
    <textarea
      key={q.question_uuid}
      className="quiz-text-input quiz-text-input--multiline"
      placeholder="Enter your answer"
      defaultValue={current?.user_answer ?? ''}
      onChange={e => {
        const val = e.target.value
        if (!val) { quiz.removeAnswer(q.question_uuid); return }
        quiz.updateAnswer(q.question_uuid, {
          type: 'TEXT', question_uuid: q.question_uuid, user_answer: val,
        })
      }}
    />
  )
}
