import { createContext, useContext } from 'react'
import type { RapierRigidBody } from '@react-three/rapier'
import type { RefObject } from 'react'

export type InteractableKind = 'push' | 'grab' | 'ride'

export type Interactable = {
  id: string
  kind: InteractableKind
  label: string
  body: RefObject<RapierRigidBody | null>
}

type InteractionApi = {
  register: (item: Interactable) => void
  unregister: (id: string) => void
  getAll: () => Interactable[]
  focused: Interactable | null
  setFocused: (item: Interactable | null) => void
  heldId: string | null
  setHeldId: (id: string | null) => void
}

export const InteractionContext = createContext<InteractionApi | null>(null)

export function useInteraction(): InteractionApi {
  const ctx = useContext(InteractionContext)
  if (!ctx) throw new Error('useInteraction requires InteractionProvider')
  return ctx
}
