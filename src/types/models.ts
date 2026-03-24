// ─── Course ──────────────────────────────────────────────────────────────────

export interface Course {
  course_uuid: string
  name: string
  description: string
  thumbnail: string
  duration: number      // seconds
  enrolled: number
  completion: number | null
}

export function getFormattedDuration(duration: number): string {
  const hours = Math.floor(duration / 3600)
  const minutes = Math.floor((duration % 3600) / 60)
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h`
  if (minutes > 0) return `${minutes}m`
  return '0m'
}

export function getFormattedEnrollmentCount(enrolled: number): string {
  if (enrolled >= 1000) return `${(enrolled / 1000).toFixed(1)}K`
  return enrolled.toString()
}

export function isCourseCompleted(course: Course): boolean {
  return (course.completion ?? 0) >= 100
}

export function isCourseInProgress(course: Course): boolean {
  const c = course.completion ?? 0
  return c > 0 && c < 100
}

export function isCourseNotStarted(course: Course): boolean {
  return (course.completion ?? 0) === 0
}

// ─── Chapter & Module ─────────────────────────────────────────────────────────

export type ContentType = 'TEXT' | 'VIDEO' | 'QUIZ'

export interface ModuleContent {
  type: string
  text?: string | null
  video?: string | null
  quiz?: QuizQuestion[] | null
}

export interface Module {
  module_uuid: string
  module_name: string
  content: ModuleContent
  completion: number
  is_completed: boolean
  profile_completion_hook: boolean
}

export interface Chapter {
  chapter_uuid: string
  chapter_name: string
  module_list: Module[]
}

export function getModuleContentType(module: Module): ContentType {
  switch (module.content.type) {
    case 'video': return 'VIDEO'
    case 'quiz': return 'QUIZ'
    default: return 'TEXT'
  }
}

export function isModuleCompleted(module: Module): boolean {
  return module.is_completed
}

export function isChapterCompleted(chapter: Chapter): boolean {
  return chapter.module_list.every(isModuleCompleted)
}

// ─── Survey ───────────────────────────────────────────────────────────────────

export type SurveyType = 'PRE_SIGNUP' | 'POST_SESSION'

export interface SurveyContent {
  type: string
  pre_signup?: QuizQuestion[] | null
  post_session?: QuizQuestion[] | null
}

export interface SurveyModule {
  module_uuid: string
  module_name: string
  content: SurveyContent
  completion: number
  is_completed: boolean
}

export function isSurveyCompleted(survey: SurveyModule): boolean {
  return survey.is_completed
}

export function getSurveyType(survey: SurveyModule): SurveyType {
  return survey.content.type === 'pre_signup' ? 'PRE_SIGNUP' : 'POST_SESSION'
}

export function isPreSignupSurvey(survey: SurveyModule): boolean {
  return getSurveyType(survey) === 'PRE_SIGNUP'
}

export function isPostSessionSurvey(survey: SurveyModule): boolean {
  return getSurveyType(survey) === 'POST_SESSION'
}

// ─── Quiz ─────────────────────────────────────────────────────────────────────

export type QuizQuestionType = 'SINGLE_SELECT' | 'NUMBER' | 'TEXT'

export interface QuizOption {
  option_number: number
  option_uuid: string
  option_text: string
}

export interface QuizQuestion {
  seq_no: number
  question_uuid: string
  type: QuizQuestionType
  text: string
  correct_answer_uuid: string | null
  options?: QuizOption[] | null
}

// ─── User ─────────────────────────────────────────────────────────────────────

export type UserType = 'STUDENT' | 'TEACHER'

export interface User {
  userAlias: string
  type: UserType
  name: string
  preferredLanguage: string
  email?: string | null
  grade?: string | null
  schoolType?: string | null
  state?: string | null
  city?: string | null
}

export function isProfileComplete(user: User): boolean {
  if (user.type === 'STUDENT') {
    return !!(user.name && user.grade && user.state && user.city)
  }
  return !!(user.name && user.state && user.city)
}

// ─── ModuleListItem (discriminated union, mirrors Kotlin sealed class) ─────────

export type ModuleListItem =
  | { kind: 'ChapterHeader'; chapter: Chapter; chapterNumber: number }
  | { kind: 'ModuleItem'; module: Module; moduleState: 0 | 1 | 2 }
  | { kind: 'SurveyHeader'; title: string }
  | { kind: 'SurveyItem'; surveyType: SurveyType; survey: SurveyModule; state: 0 | 1 | 2 }
  | { kind: 'ProfileCompletionBanner'; state: 0 | 1 | 2; isProfileCompleted: boolean }

// ─── API Request / Response ───────────────────────────────────────────────────

export interface GetModuleListRequest {
  user_alias: string
  course_uuid: string
}

export interface GetCourseListRequest {
  user_alias: string
  language: string
}

export interface ModuleListResponse {
  course: Course
  survey_list: SurveyModule[]
  chapter_list: Chapter[]
}

export interface CourseListResponse {
  course_list: Course[]
}

export interface SubmitModuleStatsRequest {
  user_alias: string
  course_uuid: string
  module_uuid: string
  type: 'module' | 'survey'
  attempt_uuid: string
  completion: number
  time_spent: number
  is_completed: boolean
  answers: Answer[] | null
}

// ─── Answer ───────────────────────────────────────────────────────────────────

export interface Answer {
  type: string
  question_uuid: string
  user_answer: string | number
  is_correct?: boolean | null
  selected_option_uuid?: string | null
}

// ─── Certificate ──────────────────────────────────────────────────────────────

export interface Certificate {
  uuid: string
  course_uuid: string
  course_name: string
  name: string
  issue_date: string
  template: string
  serial_number?: string | null
}

export function getFormattedIssueDate(issueDate: string): string {
  const dateStr = issueDate.substring(0, 19) // strip microseconds
  const date = new Date(dateStr.replace(' ', 'T'))
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── School Type ──────────────────────────────────────────────────────────────

export type SchoolType =
  | 'GOVERNMENT_SCHOOL'
  | 'CENTRAL_GOVERNMENT_SCHOOL'
  | 'GOVERNMENT_AIDED_SCHOOL'
  | 'PRIVATE_SCHOOL'
  | 'EMRS_TRIBAL_SCHOOL'
  | 'KGBV'
  | 'OTHER'

export const SCHOOL_TYPE_LABELS: Record<SchoolType, string> = {
  GOVERNMENT_SCHOOL: 'Government School',
  CENTRAL_GOVERNMENT_SCHOOL: 'Central Government School',
  GOVERNMENT_AIDED_SCHOOL: 'Government Aided School',
  PRIVATE_SCHOOL: 'Private School',
  EMRS_TRIBAL_SCHOOL: 'EMRS / Tribal School',
  KGBV: 'KGBV',
  OTHER: 'Other',
}

export const SCHOOL_TYPE_VALUES: SchoolType[] = [
  'GOVERNMENT_SCHOOL',
  'CENTRAL_GOVERNMENT_SCHOOL',
  'GOVERNMENT_AIDED_SCHOOL',
  'PRIVATE_SCHOOL',
  'EMRS_TRIBAL_SCHOOL',
  'KGBV',
  'OTHER',
]

export const GRADE_OPTIONS = ['Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 10+']

// ─── User Profile API ─────────────────────────────────────────────────────────

export interface UserWithCertificates extends User {
  certificates: Certificate[]
}

export interface GetUserProfileRequest {
  user_alias: string
}

export interface UserProfileResponse {
  user_alias: string
  type: string
  name: string
  preferred_language: string
  email?: string | null
  grade?: string | null
  school_type?: SchoolType | null
  state?: string | null
  city?: string | null
  certificates: Certificate[]
}

export interface UpdateUserRequest {
  user_alias: string
  name: string
  email?: string | null
  preferred_language?: string | null
  grade?: string | null
  school_type?: SchoolType | null
  state_code?: string | null
  city?: string | null
}

// ─── State / City ─────────────────────────────────────────────────────────────

export interface StateInfo {
  code: string
  name: string
}

// Static Indian states list (mirrors Android app resources)
export const INDIA_STATES: StateInfo[] = [
  { code: 'AN', name: 'Andaman and Nicobar Islands' },
  { code: 'AP', name: 'Andhra Pradesh' },
  { code: 'AR', name: 'Arunachal Pradesh' },
  { code: 'AS', name: 'Assam' },
  { code: 'BR', name: 'Bihar' },
  { code: 'CH', name: 'Chandigarh' },
  { code: 'CT', name: 'Chhattisgarh' },
  { code: 'DN', name: 'Dadra and Nagar Haveli' },
  { code: 'DD', name: 'Daman and Diu' },
  { code: 'DL', name: 'Delhi' },
  { code: 'GA', name: 'Goa' },
  { code: 'GJ', name: 'Gujarat' },
  { code: 'HR', name: 'Haryana' },
  { code: 'HP', name: 'Himachal Pradesh' },
  { code: 'JK', name: 'Jammu and Kashmir' },
  { code: 'JH', name: 'Jharkhand' },
  { code: 'KA', name: 'Karnataka' },
  { code: 'KL', name: 'Kerala' },
  { code: 'LA', name: 'Ladakh' },
  { code: 'LD', name: 'Lakshadweep' },
  { code: 'MP', name: 'Madhya Pradesh' },
  { code: 'MH', name: 'Maharashtra' },
  { code: 'MN', name: 'Manipur' },
  { code: 'ML', name: 'Meghalaya' },
  { code: 'MZ', name: 'Mizoram' },
  { code: 'NL', name: 'Nagaland' },
  { code: 'OR', name: 'Odisha' },
  { code: 'PY', name: 'Puducherry' },
  { code: 'PB', name: 'Punjab' },
  { code: 'RJ', name: 'Rajasthan' },
  { code: 'SK', name: 'Sikkim' },
  { code: 'TN', name: 'Tamil Nadu' },
  { code: 'TG', name: 'Telangana' },
  { code: 'TR', name: 'Tripura' },
  { code: 'UP', name: 'Uttar Pradesh' },
  { code: 'UK', name: 'Uttarakhand' },
  { code: 'WB', name: 'West Bengal' },
]
