import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { RigidBody, type RapierRigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import { useInteraction } from '../../../core/player/InteractionContext'
import type { SchoolPropKind } from '../createSchoolDecor'
import { GltfVisual, schoolModel } from '../../../core/world/GltfAsset'

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

/** art/blender/school/prop_<kind>.py — 원점은 예전 박스 메시와 같은 자리라 스폰 높이를 그대로 쓴다. */
const MODEL: Record<SchoolPropKind, string> = {
  chair: schoolModel('prop_chair'),
  desk: schoolModel('prop_desk'),
  tray: schoolModel('prop_tray'),
  ball: schoolModel('prop_ball'),
  bin: schoolModel('prop_bin'),
  book: schoolModel('prop_book'),
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
      <GltfVisual url={MODEL[kind]} />
    </RigidBody>
  )
}
