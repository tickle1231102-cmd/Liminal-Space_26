export type PlatformKind = 'web' | 'capacitor' | 'electron'

export function detectPlatform(): PlatformKind {
  const w = window as Window & {
    Capacitor?: { isNativePlatform?: () => boolean }
    electronAPI?: unknown
  }
  if (w.Capacitor?.isNativePlatform?.()) return 'capacitor'
  if (w.electronAPI) return 'electron'
  return 'web'
}

export function isTouchPrimary(): boolean {
  return matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window
}
