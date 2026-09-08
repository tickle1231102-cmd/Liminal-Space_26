export type MoveAxes = { x: number; y: number }

export type InputSnapshot = {
  move: MoveAxes
  lookDelta: MoveAxes
  sprint: boolean
  interactPressed: boolean
  reseedPressed: boolean
  pointerLocked: boolean
}

type InternalState = {
  keys: Set<string>
  lookDelta: MoveAxes
  touchMove: MoveAxes
  interactPressed: boolean
  reseedPressed: boolean
  pointerLocked: boolean
  sensitivity: number
  /** Ignore look spikes right after pointer lock (click jump). */
  lookIgnoreUntil: number
}

const state: InternalState = {
  keys: new Set(),
  lookDelta: { x: 0, y: 0 },
  touchMove: { x: 0, y: 0 },
  interactPressed: false,
  reseedPressed: false,
  pointerLocked: false,
  sensitivity: 1,
  lookIgnoreUntil: 0,
}

const MAX_LOOK_STEP = 0.12

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

export function setLookSensitivity(value: number): void {
  state.sensitivity = value
}

export function setTouchMove(x: number, y: number): void {
  state.touchMove.x = clamp(x, -1, 1)
  state.touchMove.y = clamp(y, -1, 1)
}

export function addTouchLook(dx: number, dy: number): void {
  if (performance.now() < state.lookIgnoreUntil) return
  state.lookDelta.x += clamp(dx * 0.0022 * state.sensitivity, -MAX_LOOK_STEP, MAX_LOOK_STEP)
  state.lookDelta.y += clamp(dy * 0.0022 * state.sensitivity, -MAX_LOOK_STEP, MAX_LOOK_STEP)
}

export function pressInteract(): void {
  state.interactPressed = true
}

export function pressReseed(): void {
  state.reseedPressed = true
}

export function clearLookDelta(): void {
  state.lookDelta.x = 0
  state.lookDelta.y = 0
}

export function bindDesktopInput(target: HTMLElement = document.body): () => void {
  const onKeyDown = (e: KeyboardEvent) => {
    state.keys.add(e.code)
    if (e.code === 'KeyE') state.interactPressed = true
    if (e.code === 'KeyR') state.reseedPressed = true
  }
  const onKeyUp = (e: KeyboardEvent) => {
    state.keys.delete(e.code)
  }
  const onMouseMove = (e: MouseEvent) => {
    if (!state.pointerLocked) return
    if (performance.now() < state.lookIgnoreUntil) return
    const dx = clamp(e.movementX * 0.0022 * state.sensitivity, -MAX_LOOK_STEP, MAX_LOOK_STEP)
    const dy = clamp(e.movementY * 0.0022 * state.sensitivity, -MAX_LOOK_STEP, MAX_LOOK_STEP)
    // Discard pathological spikes (pointer-lock engage)
    if (Math.abs(e.movementX) > 80 || Math.abs(e.movementY) > 80) return
    state.lookDelta.x += dx
    state.lookDelta.y += dy
  }
  const onPointerLockChange = () => {
    const locked = document.pointerLockElement === target
    state.pointerLocked = locked
    if (locked) {
      state.lookDelta.x = 0
      state.lookDelta.y = 0
      state.lookIgnoreUntil = performance.now() + 250
    }
  }

  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('mousemove', onMouseMove)
  document.addEventListener('pointerlockchange', onPointerLockChange)

  return () => {
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
    window.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('pointerlockchange', onPointerLockChange)
  }
}

export function requestPointerLock(el: HTMLElement): void {
  clearLookDelta()
  state.lookIgnoreUntil = performance.now() + 250
  void el.requestPointerLock()
}

export function exitPointerLock(): void {
  if (document.pointerLockElement) document.exitPointerLock()
}

export function sampleInput(): InputSnapshot {
  let x = state.touchMove.x
  let y = state.touchMove.y
  if (state.keys.has('KeyA') || state.keys.has('ArrowLeft')) x -= 1
  if (state.keys.has('KeyD') || state.keys.has('ArrowRight')) x += 1
  if (state.keys.has('KeyW') || state.keys.has('ArrowUp')) y += 1
  if (state.keys.has('KeyS') || state.keys.has('ArrowDown')) y -= 1

  const len = Math.hypot(x, y)
  if (len > 1) {
    x /= len
    y /= len
  }

  const look = { ...state.lookDelta }
  state.lookDelta.x = 0
  state.lookDelta.y = 0

  const interactPressed = state.interactPressed
  const reseedPressed = state.reseedPressed
  state.interactPressed = false
  state.reseedPressed = false

  return {
    move: { x, y },
    lookDelta: look,
    sprint: state.keys.has('ShiftLeft') || state.keys.has('ShiftRight'),
    interactPressed,
    reseedPressed,
    pointerLocked: state.pointerLocked,
  }
}
