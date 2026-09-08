import { useFrame, useThree } from '@react-three/fiber'
import {
  BallCollider,
  RigidBody,
  type RapierRigidBody,
} from '@react-three/rapier'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useInteraction } from '../player/InteractionContext'

type BalloonProps = {
  id?: string
  position?: [number, number, number]
  color?: string
}

const WIND_STRENGTH = 0.35
const RELEASE_FORCE = 14

export function Balloon({
  id = 'balloon-0',
  position = [2.5, 1.8, 4],
  color = '#e85d75',
}: BalloonProps) {
  const body = useRef<RapierRigidBody>(null)
  const wind = useRef(new THREE.Vector3())
  const windT = useRef(Math.random() * 100)
  const interaction = useInteraction()
  const { camera } = useThree()
  const holdPos = useRef(new THREE.Vector3())
  const prevHold = useRef(new THREE.Vector3())
  const heldVelocity = useRef(new THREE.Vector3())

  useEffect(() => {
    interaction.register({
      id,
      kind: 'grab',
      label: 'Balloon',
      body,
    })
    return () => interaction.unregister(id)
  }, [id, interaction])

  useFrame((_, dt) => {
    const rb = body.current
    if (!rb) return

    windT.current += dt
    // random-walk wind
    wind.current.x += (Math.sin(windT.current * 0.7) * 0.4 - wind.current.x) * dt
    wind.current.z += (Math.cos(windT.current * 0.55) * 0.4 - wind.current.z) * dt
    wind.current.y = 1.8 + Math.sin(windT.current * 0.9) * 0.25

    const held = interaction.heldId === id
    if (held) {
      const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion)
      holdPos.current.copy(camera.position).addScaledVector(dir, 1.6).add(new THREE.Vector3(0, -0.15, 0))

      heldVelocity.current
        .copy(holdPos.current)
        .sub(prevHold.current)
        .multiplyScalar(1 / Math.max(dt, 1 / 120))
      prevHold.current.copy(holdPos.current)

      rb.setNextKinematicTranslation({
        x: holdPos.current.x,
        y: holdPos.current.y,
        z: holdPos.current.z,
      })
      rb.setLinvel({ x: 0, y: 0, z: 0 }, true)

      if (heldVelocity.current.length() > RELEASE_FORCE) {
        interaction.setHeldId(null)
        rb.setLinvel(
          {
            x: heldVelocity.current.x * 0.35,
            y: heldVelocity.current.y * 0.35,
            z: heldVelocity.current.z * 0.35,
          },
          true,
        )
      }
      return
    }

    rb.applyImpulse(
      {
        x: wind.current.x * WIND_STRENGTH * dt * 60,
        y: wind.current.y * 0.08 * dt * 60,
        z: wind.current.z * WIND_STRENGTH * dt * 60,
      },
      true,
    )

    // soft ceiling / floor bias
    const t = rb.translation()
    if (t.y < 0.6) rb.applyImpulse({ x: 0, y: 0.4, z: 0 }, true)
    if (t.y > 6) rb.applyImpulse({ x: 0, y: -0.25, z: 0 }, true)
  })

  const isHeld = interaction.heldId === id

  return (
    <RigidBody
      ref={body}
      position={position}
      colliders={false}
      mass={0.08}
      linearDamping={2.8}
      angularDamping={2.2}
      gravityScale={-0.35}
      type={isHeld ? 'kinematicPosition' : 'dynamic'}
      ccd
    >
      <BallCollider args={[0.45]} restitution={0.55} friction={0.2} />
      <mesh castShadow>
        <sphereGeometry args={[0.48, 32, 32]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.22}
          metalness={0.05}
          clearcoat={0.65}
          clearcoatRoughness={0.25}
          sheen={0.4}
          sheenColor={color}
          emissive={color}
          emissiveIntensity={0.18}
          toneMapped={false}
        />
      </mesh>
      {/* highlight knot */}
      <mesh position={[0, -0.48, 0]}>
        <sphereGeometry args={[0.06, 10, 10]} />
        <meshStandardMaterial color="#f2e8d8" roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.85, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.75, 6]} />
        <meshStandardMaterial color="#e8dfd0" roughness={0.6} />
      </mesh>
    </RigidBody>
  )
}
