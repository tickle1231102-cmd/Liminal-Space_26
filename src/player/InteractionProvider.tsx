import { useMemo, useRef, useState, type ReactNode } from 'react'
import {
  InteractionContext,
  type Interactable,
} from './InteractionContext'

export function InteractionProvider({ children }: { children: ReactNode }) {
  const registry = useRef(new Map<string, Interactable>())
  const [focused, setFocused] = useState<Interactable | null>(null)
  const [heldId, setHeldId] = useState<string | null>(null)

  const stable = useMemo(
    () => ({
      register: (item: Interactable) => {
        registry.current.set(item.id, item)
      },
      unregister: (id: string) => {
        registry.current.delete(id)
      },
      getAll: () => [...registry.current.values()],
    }),
    [],
  )

  const api = useMemo(
    () => ({
      ...stable,
      focused,
      setFocused,
      heldId,
      setHeldId,
    }),
    [stable, focused, heldId],
  )

  return (
    <InteractionContext.Provider value={api}>{children}</InteractionContext.Provider>
  )
}
