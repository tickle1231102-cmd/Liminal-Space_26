import { useRef } from 'react'
import { BallCollider, CuboidCollider, CylinderCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { ModelBoundary } from '../../core/world/ModelBoundary'
import { GltfVisual } from '../../core/world/GltfAsset'
import { useBuoyancy } from '../../core/physics/useBuoyancy'
import { useDraggable } from '../../core/objects/useDraggable'
import { jjimModel } from './JjimKit'
import type { JjimPropKind } from './createJjimDecor'

type Shape = { box: [number, number, number] } | { ball: number } | { cylinder: [halfHeight: number, radius: number] }

/** 충돌 모양(m), 질량(kg), 부력(1보다 크면 뜸), 라벨, 끌 때 손 높이 — 모델 치수는 art/blender/jjimjilbang/*.py */
const SPEC: Record<JjimPropKind, { shape: Shape; half: number; mass: number; float: number; label: string; hold: number; friction?: number }> = {
  mat: { shape: { box: [0.35, 0.025, 0.9] }, half: 0.025, mass: 2.5, float: 1.3, label: '매트', hold: 0.25, friction: 0.9 },
  mokchim: { shape: { box: [0.15, 0.05, 0.08] }, half: 0.05, mass: 1.2, float: 1.5, label: '목침', hold: 0.5 },
  egg: { shape: { ball: 0.023 }, half: 0.023, mass: 0.06, float: 0.6, label: '구운 계란', hold: 0.7, friction: 0.5 },
  can: { shape: { cylinder: [0.06, 0.033] }, half: 0.06, mass: 0.26, float: 1.25, label: '식혜 캔', hold: 0.7, friction: 0.5 },
  ball: { shape: { ball: 0.05 }, half: 0.05, mass: 0.2, float: 2.4, label: '편백 볼', hold: 0.6, friction: 0.5 },
  bucket: { shape: { box: [0.16, 0.07, 0.16] }, half: 0.07, mass: 0.4, float: 2, label: '족욕 바가지', hold: 0.6 },
  straw: { shape: { box: [0.3, 0.02, 0.3] }, half: 0.02, mass: 0.8, float: 1.2, label: '가마니 방석', hold: 0.3, friction: 0.9 },
  cart: { shape: { box: [0.45, 0.4, 0.275] }, half: 0.4, mass: 16, float: 0.6, label: '수거 카트', hold: 0.45 },
}

/** kind → art/blender/jjimjilbang/<model>.py */
const MODEL: Record<JjimPropKind, string> = {
  mat: 'mat',
  mokchim: 'mokchim',
  egg: 'egg',
  can: 'sikhye_can',
  ball: 'hinoki_ball',
  bucket: 'foot_bucket',
  straw: 'straw_mat',
  cart: 'laundry_cart',
}

/** 찜질방 소품 — 밀기/끌기(core/objects/useDraggable) + 족욕 수로에 들어가면 부력을 받는다. */
export function JjimProp({
  id,
  kind,
  position,
  rotationY = 0,
}: {
  id: string
  kind: JjimPropKind
  position: [number, number, number]
  rotationY?: number
}) {
  const body = useRef<RapierRigidBody>(null)
  const s = SPEC[kind]
  const held = useDraggable(id, s.label, body, { dragHeight: s.hold })
  useBuoyancy(body, { halfHeight: s.half, floatiness: s.float })
  const friction = s.friction ?? 0.7
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
      {'box' in s.shape ? (
        <CuboidCollider args={s.shape.box} friction={friction} restitution={0.05} />
      ) : 'ball' in s.shape ? (
        <BallCollider args={[s.shape.ball]} friction={friction} restitution={0.1} />
      ) : (
        <CylinderCollider args={s.shape.cylinder} friction={friction} restitution={0.05} />
      )}
      <ModelBoundary label={MODEL[kind]}>
        <GltfVisual url={jjimModel(MODEL[kind])} />
      </ModelBoundary>
    </RigidBody>
  )
}
