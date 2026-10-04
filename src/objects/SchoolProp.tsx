import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { RigidBody, type RapierRigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import { useInteraction } from '../player/InteractionContext'
import type { SchoolPropKind } from '../proc/createSchoolDecor'

type SchoolPropProps = {
  id: string
  kind: SchoolPropKind
  position: [number, number, number]
  rotationY?: number
}

const LABEL: Record<SchoolPropKind, string> = {
  chair: '의자',
  desk: '책상',
  tray: '식판',
  ball: '농구공',
  bin: '청소도구함',
  book: '교과서',
}

const MASS: Record<SchoolPropKind, number> = {
  chair: 3.2,
  desk: 8.5,
  tray: 0.5,
  ball: 0.62,
  bin: 5.0,
  book: 0.4,
}

/** 끌고 갈 때 손이 놓이는 높이 — 바닥에 붙어 미끄러지는 느낌을 준다. */
const DRAG_HEIGHT = 0.45
/** 이보다 빠르게 휘두르면 손에서 놓친다 (PRD 04절 — 과도한 힘이면 놓침). */
const RELEASE_SPEED = 9

function PropMesh({ kind }: { kind: SchoolPropKind }) {
  switch (kind) {
    case 'chair':
      return (
        <group>
          <mesh castShadow position={[0, 0, 0]}>
            <boxGeometry args={[0.42, 0.06, 0.42]} />
            <meshStandardMaterial color="#b8823f" roughness={0.75} />
          </mesh>
          <mesh castShadow position={[0, 0.3, -0.19]}>
            <boxGeometry args={[0.42, 0.55, 0.05]} />
            <meshStandardMaterial color="#b8823f" roughness={0.75} />
          </mesh>
          {([-0.17, 0.17] as const).map((x) =>
            ([-0.17, 0.17] as const).map((z) => (
              <mesh key={`${x}:${z}`} castShadow position={[x, -0.22, z]}>
                <cylinderGeometry args={[0.022, 0.022, 0.44, 8]} />
                <meshStandardMaterial color="#5f6a70" metalness={0.55} roughness={0.42} />
              </mesh>
            )),
          )}
        </group>
      )
    case 'desk':
      return (
        <group>
          <mesh castShadow position={[0, 0.1, 0]}>
            <boxGeometry args={[0.7, 0.06, 0.5]} />
            <meshStandardMaterial color="#c49450" roughness={0.72} />
          </mesh>
          <mesh castShadow position={[0, -0.05, -0.18]}>
            <boxGeometry args={[0.66, 0.2, 0.12]} />
            <meshStandardMaterial color="#8d9299" metalness={0.4} roughness={0.5} />
          </mesh>
          {([-0.3, 0.3] as const).map((x) =>
            ([-0.2, 0.2] as const).map((z) => (
              <mesh key={`${x}:${z}`} castShadow position={[x, -0.2, z]}>
                <cylinderGeometry args={[0.025, 0.025, 0.55, 8]} />
                <meshStandardMaterial color="#5f6a70" metalness={0.55} roughness={0.42} />
              </mesh>
            )),
          )}
        </group>
      )
    case 'tray':
      return (
        <mesh castShadow>
          <boxGeometry args={[0.42, 0.05, 0.32]} />
          <meshStandardMaterial color="#cfd4d8" metalness={0.75} roughness={0.28} />
        </mesh>
      )
    case 'ball':
      return (
        <mesh castShadow>
          <sphereGeometry args={[0.12, 20, 20]} />
          <meshStandardMaterial color="#c4632a" roughness={0.85} />
        </mesh>
      )
    case 'bin':
      return (
        <group>
          <mesh castShadow>
            <boxGeometry args={[0.45, 1.5, 0.45]} />
            <meshStandardMaterial color="#6f7f86" metalness={0.35} roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.2, 0.23]}>
            <boxGeometry args={[0.3, 0.02, 0.02]} />
            <meshStandardMaterial color="#39434a" />
          </mesh>
        </group>
      )
    case 'book':
    default:
      return (
        <mesh castShadow>
          <boxGeometry args={[0.2, 0.04, 0.27]} />
          <meshStandardMaterial color="#d8d2c0" roughness={0.9} />
        </mesh>
      )
  }
}

/**
 * 학교판 물리 오브젝트. 상호작용 축은 밀기/끌기 하나뿐이며(PRD 12절),
 * 잡은 동안에는 바닥 높이를 유지한 채 시선 앞을 따라온다.
 */
export function SchoolProp({ id, kind, position, rotationY = 0 }: SchoolPropProps) {
  const body = useRef<RapierRigidBody>(null)
  const interaction = useInteraction()
  const { camera } = useThree()
  const target = useRef(new THREE.Vector3())
  const prev = useRef(new THREE.Vector3())
  const vel = useRef(new THREE.Vector3())
  const dir = useRef(new THREE.Vector3())

  useEffect(() => {
    interaction.register({ id, kind: 'push', label: LABEL[kind], body })
    return () => interaction.unregister(id)
  }, [id, kind, interaction])

  const held = interaction.heldId === id

  useFrame((_, dt) => {
    const rb = body.current
    if (!rb || !held) return

    dir.current.set(0, 0, -1).applyQuaternion(camera.quaternion)
    dir.current.y = 0
    if (dir.current.lengthSq() < 1e-4) return
    dir.current.normalize()

    target.current
      .set(camera.position.x, DRAG_HEIGHT, camera.position.z)
      .addScaledVector(dir.current, 1.25)

    vel.current
      .copy(target.current)
      .sub(prev.current)
      .multiplyScalar(1 / Math.max(dt, 1 / 120))
    prev.current.copy(target.current)

    rb.setNextKinematicTranslation({
      x: target.current.x,
      y: target.current.y,
      z: target.current.z,
    })

    if (vel.current.length() > RELEASE_SPEED) {
      interaction.setHeldId(null)
      rb.setLinvel(
        {
          x: vel.current.x * 0.3,
          y: 0,
          z: vel.current.z * 0.3,
        },
        true,
      )
    }
  })

  return (
    <RigidBody
      ref={body}
      position={position}
      rotation={[0, rotationY, 0]}
      colliders={kind === 'ball' ? 'ball' : 'cuboid'}
      mass={MASS[kind]}
      linearDamping={kind === 'ball' ? 0.35 : 1.6}
      angularDamping={kind === 'ball' ? 0.4 : 1.8}
      type={held ? 'kinematicPosition' : 'dynamic'}
      ccd
    >
      <PropMesh kind={kind} />
    </RigidBody>
  )
}
