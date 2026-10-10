import { useRef } from 'react'
import { ModelBoundary } from '../../core/world/ModelBoundary'
import { CuboidCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { GltfVisual } from '../../core/world/GltfAsset'
import { useBuoyancy } from '../../core/physics/useBuoyancy'
import { useDraggable } from '../../core/objects/useDraggable'
import { bathModel } from './BathKit'
import type { BathPropKind } from './createBathDecor'

/** 반크기(m), 질량(kg), 부력(1보다 크면 뜸), 라벨, 끌 때 손 높이 — 모델 치수는 art/blender/bathhouse/*.py */
const SPEC: Record<BathPropKind, { half: [number, number, number]; mass: number; float: number; label: string; hold: number }> = {
  stool: { half: [0.15, 0.12, 0.12], mass: 0.6, float: 1.6, label: '목욕 의자', hold: 0.35 },
  oke: { half: [0.11, 0.06, 0.11], mass: 0.25, float: 2.2, label: '바가지', hold: 0.6 },
  rubber_duck: { half: [0.06, 0.05, 0.075], mass: 0.05, float: 3.2, label: '고무 오리', hold: 0.7 },
  towel_cart: { half: [0.47, 0.5, 0.26], mass: 18, float: 0.6, label: '수건 카트', hold: 0.5 },
  basket: { half: [0.23, 0.11, 0.16], mass: 0.8, float: 1.4, label: '바구니', hold: 0.6 },
}

/** kind → art/blender/bathhouse/<model>.py */
const MODEL: Record<BathPropKind, string> = {
  stool: 'bath_stool',
  oke: 'oke',
  rubber_duck: 'rubber_duck',
  towel_cart: 'towel_cart',
  basket: 'basket',
}

/** 센토 소품 — 밀기/끌기(core/objects/useDraggable) + 탕에 들어가면 부력으로 뜬다. */
export function BathProp({
  id,
  kind,
  position,
  rotationY = 0,
}: {
  id: string
  kind: BathPropKind
  position: [number, number, number]
  rotationY?: number
}) {
  const body = useRef<RapierRigidBody>(null)
  const s = SPEC[kind]
  const held = useDraggable(id, s.label, body, { dragHeight: s.hold })
  useBuoyancy(body, { halfHeight: s.half[1], floatiness: s.float })
  return (
    <RigidBody
      ref={body}
      colliders={false}
      position={position}
      rotation={[0, rotationY, 0]}
      mass={s.mass}
      type={held ? 'kinematicPosition' : 'dynamic'}
      ccd
    >
      <CuboidCollider args={s.half} friction={0.7} restitution={0.05} />
      <ModelBoundary label={MODEL[kind]}>
        <GltfVisual url={bathModel(MODEL[kind])} />
      </ModelBoundary>
    </RigidBody>
  )
}
