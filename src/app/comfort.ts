export type ComfortSettings = {
  fov: number
  lookSensitivity: number
  reduceMotion: boolean
  showFps: boolean
}

const STORAGE_KEY = 'after-hours.comfort.v1'

const DEFAULTS: ComfortSettings = {
  fov: 72,
  lookSensitivity: 1,
  reduceMotion: false,
  showFps: import.meta.env.DEV,
}

export function loadComfortSettings(): ComfortSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULTS }
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<ComfortSettings>) }
  } catch {
    return { ...DEFAULTS }
  }
}

export function saveComfortSettings(settings: ComfortSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}
