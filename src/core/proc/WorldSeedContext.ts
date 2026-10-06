import { createContext, useContext } from 'react'

export type WorldSeedState = {
  seed: string
  generation: number
  reseed: () => void
}

export const WorldSeedContext = createContext<WorldSeedState | null>(null)

export function useWorldSeed(): WorldSeedState {
  const ctx = useContext(WorldSeedContext)
  if (!ctx) throw new Error('useWorldSeed must be used within WorldSeedProvider')
  return ctx
}
