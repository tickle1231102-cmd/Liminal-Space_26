import { useRef } from 'react'
import { RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { useDraggable } from '../../../core/objects/useDraggable'
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
  const held = useDraggable(id, LABEL[kind], body, { dragHeight: DRAG_HEIGHT, releaseSpeed: RELEASE_SPEED })

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
