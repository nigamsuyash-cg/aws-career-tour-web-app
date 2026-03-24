import { useState, useRef, useCallback } from 'react'
import type { QuizQuestion, Answer } from '../types/models'

/** Mirrors AWSCareerTourQuizModuleViewModel */
export function useQuizModule(questions: QuizQuestion[]) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answersMap, setAnswersMap] = useState<Map<string, Answer>>(new Map())
  const startTimeRef = useRef<number>(Date.now())
  const accumulatedMs = useRef<number>(0)

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now()
  }, [])

  const pauseTimer = useCallback(() => {
    accumulatedMs.current += Date.now() - startTimeRef.current
  }, [])

  const getDurationMs = useCallback((): number => {
    return accumulatedMs.current + (Date.now() - startTimeRef.current)
  }, [])

  const currentQuestion = questions[currentIndex] ?? null

  const updateAnswer = useCallback((questionUuid: string, answer: Answer) => {
    setAnswersMap(prev => new Map(prev).set(questionUuid, answer))
  }, [])

  const removeAnswer = useCallback((questionUuid: string) => {
    setAnswersMap(prev => {
      const next = new Map(prev)
      next.delete(questionUuid)
      return next
    })
  }, [])

  const getAnswer = useCallback((questionUuid: string): Answer | undefined => {
    return answersMap.get(questionUuid)
  }, [answersMap])

  const isLastQuestion = currentIndex === questions.length - 1
  const isCurrentQuestionAnswered = currentQuestion ? answersMap.has(currentQuestion.question_uuid) : false
  const areAllQuestionsAnswered = questions.length > 0 && questions.every(q => answersMap.has(q.question_uuid))

  const nextQuestion = useCallback(() => {
    setCurrentIndex(i => Math.min(i + 1, questions.length - 1))
  }, [questions.length])

  return {
    currentIndex,
    currentQuestion,
    answersMap,
    updateAnswer,
    removeAnswer,
    getAnswer,
    isLastQuestion,
    isCurrentQuestionAnswered,
    areAllQuestionsAnswered,
    nextQuestion,
    startTimer,
    pauseTimer,
    getDurationMs,
    totalQuestions: questions.length,
  }
}
