import { useFrame, useThree } from '@react-three/fiber'
import {
  CapsuleCollider,
  CuboidCollider,
  RigidBody,
  type RapierRigidBody,
} from '@react-three/rapier'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { sampleInput } from '../input/controls'
import { useInteraction } from './InteractionContext'
import type { ComfortSettings } from '../app/comfort'

const WALK_SPEED = 3.4
const SPRINT_SPEED = 5.4
const MAX_PITCH = Math.PI / 2 - 0.12
const EYE_HEIGHT = 1.55
const INTERACT_RANGE = 2.6
/** Rigid body origin sits at feet; collider rises above. */
const SPAWN: [number, number, number] = [0, 0.15, 10]

type PlayerProps = {
  spawn?: [number, number, number]
  comfort: ComfortSettings
  onReseed?: () => void
  riding?: boolean
  rideWorldPos?: THREE.Vector3 | null
  controlsEnabled?: boolean
}

export function PlayerController({
  spawn = SPAWN,
  comfort,
  onReseed,
  riding = false,
  rideWorldPos = null,
  controlsEnabled = true,
}: PlayerProps) {
  const body = useRef<RapierRigidBody>(null)
  const yaw = useRef(0)
  const pitch = useRef(0)
  const groundedFrames = useRef(0)
  const { camera } = useThree()
  const interaction = useInteraction()
  const focusScratch = useRef(new THREE.Vector3())
  const forward = useRef(new THREE.Vector3())
  const right = useRef(new THREE.Vector3())
  const wish = useRef(new THREE.Vector3())

  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = comfort.fov
      camera.updateProjectionMatrix()
    }
  }, [camera, comfort.fov])

  // Stable camera before first physics tick
  useEffect(() => {
    camera.position.set(spawn[0], spawn[1] + EYE_HEIGHT, spawn[2])
    camera.rotation.order = 'YXZ'
    camera.rotation.set(0, 0, 0)
  }, [camera, spawn])

  useFrame((_, dt) => {
    const input = controlsEnabled
      ? sampleInput()
      : {
          move: { x: 0, y: 0 },
          lookDelta: { x: 0, y: 0 },
          sprint: false,
          interactPressed: false,
          reseedPressed: false,
          pointerLocked: false,
        }

    if (input.reseedPressed) onReseed?.()

    yaw.current -= input.lookDelta.x
    pitch.current = THREE.MathUtils.clamp(
      pitch.current - input.lookDelta.y,
      -MAX_PITCH,
      MAX_PITCH,
    )

    const rb = body.current
    if (!rb) return

    if (riding && rideWorldPos) {
      rb.setNextKinematicTranslation({
        x: rideWorldPos.x,
        y: rideWorldPos.y + 0.4,
        z: rideWorldPos.z,
      })
      camera.position.set(rideWorldPos.x, rideWorldPos.y + 1.1, rideWorldPos.z)
      camera.rotation.order = 'YXZ'
      camera.rotation.y = yaw.current
      camera.rotation.x = pitch.current
      return
    }

    const speed = input.sprint ? SPRINT_SPEED : WALK_SPEED
    forward.current.set(-Math.sin(yaw.current), 0, -Math.cos(yaw.current))
    right.current.set(Math.cos(yaw.current), 0, -Math.sin(yaw.current))
    wish.current
      .set(0, 0, 0)
      .addScaledVector(forward.current, input.move.y)
      .addScaledVector(right.current, input.move.x)
    if (wish.current.lengthSq() > 0) wish.current.normalize().multiplyScalar(speed)

    const linvel = rb.linvel()
    // Clamp fall speed so a missed collider doesn't slingshot the camera
    const vy = Math.max(linvel.y, -12)
    rb.setLinvel({ x: wish.current.x, y: vy, z: wish.current.z }, true)

    let t = rb.translation()

    // Soft recovery if we somehow fell through the floor
    if (t.y < -1) {
      rb.setTranslation({ x: spawn[0], y: spawn[1], z: spawn[2] }, true)
      rb.setLinvel({ x: 0, y: 0, z: 0 }, true)
      t = rb.translation()
    }

    // Detect settled on ground (near spawn height)
    if (t.y < 0.4 && Math.abs(vy) < 0.35) groundedFrames.current += 1
    else groundedFrames.current = 0

    camera.position.set(t.x, t.y + EYE_HEIGHT, t.z)
    camera.rotation.order = 'YXZ'
    camera.rotation.y = yaw.current
    camera.rotation.x = pitch.current

    const origin = camera.position
    const dir = focusScratch.current
      .set(0, 0, -1)
      .applyEuler(camera.rotation)
      .normalize()

    let best: { id: string; dist: number } | null = null
    for (const item of interaction.getAll()) {
      const b = item.body.current
      if (!b) continue
      const p = b.translation()
      const to = new THREE.Vector3(p.x - origin.x, p.y - origin.y, p.z - origin.z)
      const dist = to.length()
      if (dist > INTERACT_RANGE) continue
      const aligned = to.normalize().dot(dir)
      if (aligned < 0.55) continue
      if (!best || dist < best.dist) best = { id: item.id, dist }
    }

    const focused =
      best == null ? null : interaction.getAll().find((i) => i.id === best.id) ?? null
    if (focused?.id !== interaction.focused?.id) interaction.setFocused(focused)

    if (controlsEnabled && input.interactPressed && focused) {
      if (focused.kind === 'grab' || focused.kind === 'push') {
        if (interaction.heldId === focused.id) interaction.setHeldId(null)
        else interaction.setHeldId(focused.id)
      }
      if (focused.kind === 'ride') {
        interaction.setHeldId(focused.id)
      }
    } else if (controlsEnabled && input.interactPressed && interaction.heldId) {
      interaction.setHeldId(null)
    }

    void dt
  })

  return (
    <RigidBody
      ref={body}
      position={spawn}
      colliders={false}
      enabledRotations={[false, false, false]}
      linearDamping={0.15}
      angularDamping={1}
      canSleep={false}
      type={riding ? 'kinematicPosition' : 'dynamic'}
      ccd
      lockRotations
    >
      {/* Capsule standing on feet at body origin */}
      <CapsuleCollider args={[0.45, 0.32]} position={[0, 0.77, 0]} friction={1} restitution={0} />
      {/* Wide foot disc to reduce tunneling */}
      <CuboidCollider args={[0.28, 0.08, 0.28]} position={[0, 0.08, 0]} friction={1.4} />
    </RigidBody>
  )
}
