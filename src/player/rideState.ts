import type * as THREE from 'three'

/**
 * Hand-off from the ridden RideSeat to the player — mutated in frame callbacks, never React state
 * (riding must not re-render the scene every frame). The player reads the seat node itself each
 * frame (ride animations advance at an earlier useFrame priority), so there is no one-frame lag.
 */
export const rideState = {
  /** Seat currently ridden (set by that RideSeat while held). */
  id: null as string | null,
  /** Seat point node, mounted on the animated ride. */
  anchor: null as THREE.Object3D | null,
  /** World-space dismount point for a given seat world position. */
  /** World yaw to turn the view to on boarding (undefined = keep the current view). */
  faceYaw: undefined as number | undefined,
  exitFrom: null as ((seatWorld: THREE.Vector3, out: THREE.Vector3) => void) | null,
}
