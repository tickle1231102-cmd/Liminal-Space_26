import { useFrame, useThree } from '@react-three/fiber'
import {
  CapsuleCollider,
  CuboidCollider,
  RigidBody,
  useRapier,
  type RapierRigidBody,
} from '@react-three/rapier'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { sampleInput } from '../input/controls'
import { useInteraction } from './InteractionContext'
import { rideState } from './rideState'
import type { ComfortSettings } from '../../app/comfort'

const WALK_SPEED = 3.4
const SPRINT_SPEED = 5.4
const JUMP_SPEED = 6.2
const MAX_PITCH = Math.PI / 2 - 0.12
const EYE_HEIGHT = 1.55
const INTERACT_RANGE = 2.6
/** Seated eye height above the seat point. */
const SEATED_EYE = 0.75
/** Rigid body origin sits at feet; collider rises above. */
const SPAWN: [number, number, number] = [0, 0.15, 10]

type PlayerProps = {
  spawn?: [number, number, number]
  comfort: ComfortSettings
  onReseed?: () => void
  controlsEnabled?: boolean
}

export function PlayerController({
  spawn = SPAWN,
  comfort,
  onReseed,
  controlsEnabled = true,
}: PlayerProps) {
  const body = useRef<RapierRigidBody>(null)
  const yaw = useRef(0)
  const pitch = useRef(0)
  const groundedFrames = useRef(0)
  const { camera, scene } = useThree()
  const interaction = useInteraction()
  const focusScratch = useRef(new THREE.Vector3())
  const forward = useRef(new THREE.Vector3())
  const right = useRef(new THREE.Vector3())
  const wish = useRef(new THREE.Vector3())
  /** Seat yaw last frame (NaN = just boarded) — its change turns the view with the ride. */
  const lastSeatYaw = useRef(NaN)
  /** Seat just left: heldId clears on the next render, until then keep the body at the exit. */
  const dismounted = useRef<string | null>(null)
  const exitAt = useRef(new THREE.Vector3())
  /** Frames spent riding without a live seat (seat unmounted / hot reload) — release after a few. */
  const orphanFrames = useRef(0)
  const seatPos = useRef(new THREE.Vector3())
  const seatQuat = useRef(new THREE.Quaternion())
  const seatEuler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'))
  const { rapier } = useRapier()

  const held = interaction.heldId ? interaction.getAll().find((i) => i.id === interaction.heldId) : undefined
  const riding = held?.kind === 'ride'

  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = comfort.fov
      camera.updateProjectionMatrix()
    }
  }, [camera, comfort.fov])

  // Dev-only console handle for testing far-off spots: __afterHours.teleport(x, y, z, yaw)
  useEffect(() => {
    if (!import.meta.env.DEV) return
    const w = window as unknown as Record<string, unknown>
    w.__afterHours = {
      scene,
      teleport: (x: number, y: number, z: number, look = yaw.current) => {
        body.current?.setTranslation({ x, y, z }, true)
        body.current?.setLinvel({ x: 0, y: 0, z: 0 }, true)
        yaw.current = look
        pitch.current = 0
      },
      state: () => ({
        pos: body.current?.translation(),
        yaw: yaw.current,
        focused: interaction.focused?.id ?? null,
        held: interaction.heldId,
        rides: interaction
          .getAll()
          .filter((i) => i.kind === 'ride')
          .map((i) => ({ id: i.id, at: i.body.current?.translation() })),
      }),
    }
    return () => void delete w.__afterHours
  }, [interaction, scene])

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
          jumpPressed: false,
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

    if (!riding) dismounted.current = null
    if (riding && dismounted.current === interaction.heldId) {
      // Waiting for heldId to clear: hold at the exit (the seat keeps publishing its pose meanwhile)
      const e = exitAt.current
      rb.setTranslation({ x: e.x, y: e.y, z: e.z }, true)
      rb.setLinvel({ x: 0, y: 0, z: 0 }, true)
      return
    }
    if (riding) {
      // Seat pose arrives from the ridden RideSeat's useFrame (may lag one frame on boarding)
      const anchor = rideState.anchor
      if (rideState.id !== interaction.heldId || !anchor) {
        if (++orphanFrames.current > 30) {
          orphanFrames.current = 0
          rb.setBodyType(rapier.RigidBodyType.Dynamic, true)
          interaction.setHeldId(null)
        }
        return
      }
      orphanFrames.current = 0
      if (Number.isNaN(lastSeatYaw.current) && rideState.faceYaw !== undefined) {
        yaw.current = rideState.faceYaw
        pitch.current = 0
      }
      anchor.updateWorldMatrix(true, false)
      const seat = anchor.getWorldPosition(seatPos.current)
      const seatYaw = seatEuler.current.setFromQuaternion(anchor.getWorldQuaternion(seatQuat.current)).y
      // Body type is switched here, not via the RigidBody prop: a prop change makes
      // @react-three/rapier reset the body to its stale object transform (back onto the seat).
      if (rb.bodyType() !== rapier.RigidBodyType.KinematicPositionBased) {
        rb.setBodyType(rapier.RigidBodyType.KinematicPositionBased, true)
      }
      if (!comfort.reduceMotion && !Number.isNaN(lastSeatYaw.current)) {
        let d = seatYaw - lastSeatYaw.current
        d = Math.atan2(Math.sin(d), Math.cos(d))
        yaw.current += d
      }
      lastSeatYaw.current = seatYaw
      if (controlsEnabled && input.interactPressed) {
        // Dismount to the ride's exit point
        const e = exitAt.current
        rideState.exitFrom?.(seat, e)
        rb.setBodyType(rapier.RigidBodyType.Dynamic, true)
        rb.setTranslation({ x: e.x, y: e.y, z: e.z }, true)
        rb.setLinvel({ x: 0, y: 0, z: 0 }, true)
        camera.position.set(e.x, e.y + EYE_HEIGHT, e.z)
        rideState.id = null
        rideState.anchor = null
        dismounted.current = interaction.heldId
        lastSeatYaw.current = NaN
        groundedFrames.current = 0
        interaction.setHeldId(null)
        return
      }
      rb.setNextKinematicTranslation({ x: seat.x, y: seat.y - 0.4, z: seat.z })
      camera.position.set(seat.x, seat.y + SEATED_EYE, seat.z)
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
    const grounded = groundedFrames.current >= 2

    let vy = Math.max(linvel.y, -12)
    if (input.jumpPressed && grounded) {
      vy = JUMP_SPEED
      groundedFrames.current = 0
    }

    rb.setLinvel({ x: wish.current.x, y: vy, z: wish.current.z }, true)

    let t = rb.translation()

    // Soft recovery if we somehow fell through the floor
    if (t.y < -1) {
      rb.setTranslation({ x: spawn[0], y: spawn[1], z: spawn[2] }, true)
      rb.setLinvel({ x: 0, y: 0, z: 0 }, true)
      t = rb.translation()
    }

    // Grounded when near floor and not rising fast
    if (t.y < 0.45 && linvel.y <= 0.15) groundedFrames.current += 1
    else if (t.y > 0.55 || linvel.y > 0.4) groundedFrames.current = 0
    else groundedFrames.current = Math.max(0, groundedFrames.current - 1)

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
        lastSeatYaw.current = NaN
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
