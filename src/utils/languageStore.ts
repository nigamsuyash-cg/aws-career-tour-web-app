const STORAGE_KEY = 'ct_language'
const DEFAULT_LANGUAGE = 'en'

export interface LanguageOption {
  code: string
  label: string
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'gu', label: 'ગુજરાતી' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'mr', label: 'मराठी' },
]

let currentLanguage: string = loadLanguage()

function loadLanguage(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_LANGUAGE
  } catch {
    return DEFAULT_LANGUAGE
  }
}

export function getLanguage(): string {
  return currentLanguage
}

export function setLanguage(lang: string): void {
  currentLanguage = lang
  localStorage.setItem(STORAGE_KEY, lang)
}
