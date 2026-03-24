import apiClient from './client'
import type {
  GetModuleListRequest,
  GetCourseListRequest,
  GetUserProfileRequest,
  UpdateUserRequest,
  ModuleListResponse,
  CourseListResponse,
  UserProfileResponse,
  SubmitModuleStatsRequest,
} from '../types/models'

export async function getModuleList(request: GetModuleListRequest): Promise<ModuleListResponse> {
  const { data } = await apiClient.post<ModuleListResponse>(
    '/api/career-tour/get-module-list',
    request,
  )
  return data
}

export async function getCourseList(request: GetCourseListRequest): Promise<CourseListResponse> {
  const { data } = await apiClient.post<CourseListResponse>(
    '/api/career-tour/get-course-list',
    request,
  )
  return data
}

export async function submitModuleStats(request: SubmitModuleStatsRequest): Promise<void> {
  // Mirror Android's convertAnswerToJSONArray: only send type, question_uuid,
  // user_answer, is_correct. selected_option_uuid is local UI state only.
  const answers = request.answers?.map(({ type, question_uuid, user_answer, is_correct }) => {
    const a: Record<string, unknown> = { type, question_uuid, user_answer }
    if (is_correct !== null && is_correct !== undefined) a.is_correct = is_correct
    return a
  }) ?? null

  const body = Object.fromEntries(
    Object.entries({ ...request, answers }).filter(([, v]) => v !== null && v !== undefined),
  )
  await apiClient.post('/api/career-tour/submit-module-stats', body)
}

export async function getUserProfile(request: GetUserProfileRequest): Promise<UserProfileResponse> {
  const { data } = await apiClient.post<UserProfileResponse>(
    '/api/career-tour/get-user',
    request,
  )
  return data
}

export async function updateUserProfile(request: UpdateUserRequest): Promise<void> {
  await apiClient.post('/api/career-tour/update-user', request)
}
