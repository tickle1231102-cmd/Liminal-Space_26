import { createPortal, useFrame, useThree } from '@react-three/fiber'
import { CuboidCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useInteraction } from '../../../core/player/InteractionContext'
import { rideState } from '../../../core/player/rideState'
import { GltfVisual } from '../../../core/world/GltfAsset'

type RideSeatProps = {
  id: string
  label: string
  /** Visual model (glb url); omit for seats inside a ride model (gondola bench). */
  model?: string
  /** Seat point relative to the mount node, in its local space. */
  seat?: [number, number, number]
  /** Half extents of the seat's collider (centered on the seat point); omit for none. */
  collider?: [number, number, number]
  /** World yaw the rider faces on boarding (e.g. out over the park); omit to keep the view. */
  faceYaw?: number
  /** World-space dismount point, given the seat's current world position. */
  exitFrom: (seatWorld: THREE.Vector3, out: THREE.Vector3) => void
}

/**
 * Boardable seat. Mount it on an animated node (GltfAnimated `mounts`): a kinematic body
 * follows that node every frame so focus/boarding works wherever the ride currently is.
 */
export function RideSeat({ id, label, model, seat = [0, 0, 0], collider, faceYaw, exitFrom }: RideSeatProps) {
  const scene = useThree((st) => st.scene)
  const body = useRef<RapierRigidBody>(null)
  const anchor = useRef<THREE.Group>(null)
  const interaction = useInteraction()
  const pos = useRef(new THREE.Vector3())
  const quat = useRef(new THREE.Quaternion())

  useEffect(() => {
    interaction.register({ id, kind: 'ride', label, body })
    return () => interaction.unregister(id)
  }, [id, label, interaction])

  useFrame(() => {
    const g = anchor.current
    const rb = body.current
    if (!g || !rb) return
    g.getWorldPosition(pos.current)
    g.getWorldQuaternion(quat.current)
    rb.setNextKinematicTranslation(pos.current)
    rb.setNextKinematicRotation(quat.current)

    if (interaction.heldId === id && rideState.id !== id) {
      rideState.id = id
      rideState.anchor = g
      rideState.exitFrom = exitFrom
      rideState.faceYaw = faceYaw
    }
  })

  return (
    <>
      {/* Visual: a plain child of the animated mount, so it moves exactly with the ride */}
      <group ref={anchor} position={seat}>
        {model && (
          <group position={[-seat[0], -seat[1], -seat[2]]}>
            <GltfVisual url={model} />
          </group>
        )}
      </group>
      {/* Physics: world-space kinematic body at the scene root, driven from the anchor each frame
          (nested under an animated parent, @react-three/rapier's world/local sync drifts) */}
      {createPortal(
        <RigidBody ref={body} type="kinematicPosition" colliders={false}>
          {collider && <CuboidCollider args={collider} />}
        </RigidBody>,
        scene,
      )}
    </>
  )
}
