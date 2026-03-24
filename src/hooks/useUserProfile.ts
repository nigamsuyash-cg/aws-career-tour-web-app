import { useState, useCallback } from 'react'
import { getUserProfile } from '../api/careerTourApi'
import { useAuth } from '../auth/AuthContext'
import type { UserProfileResponse } from '../types/models'

type UiState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: UserProfileResponse }
  | { status: 'error' }

export function useUserProfile() {
  const { session } = useAuth()
  const userAlias = session?.userAlias ?? ''
  const [uiState, setUiState] = useState<UiState>({ status: 'idle' })

  const load = useCallback(async () => {
    setUiState({ status: 'loading' })
    try {
      const data = await getUserProfile({ user_alias: userAlias })
      setUiState({ status: 'success', data })
    } catch {
      setUiState({ status: 'error' })
    }
  }, [userAlias])

  return { uiState, load }
}
