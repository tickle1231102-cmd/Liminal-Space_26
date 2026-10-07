import { Suspense, useRef } from 'react'
import { CuboidCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { GltfVisual } from '../../core/world/GltfAsset'
import { useBuoyancy } from '../../core/physics/useBuoyancy'
import { bathModel } from './BathKit'

const SPEC = {
  rubber_duck: { half: [0.06, 0.05, 0.075] as const, mass: 0.05, floatiness: 3.2 },
  oke: { half: [0.11, 0.06, 0.11] as const, mass: 0.25, floatiness: 2.2 },
}

/** 물에 뜨는 소품 — 부딪히면 밀리고, 탕에 들어가면 부력으로 떠오른다. (상호작용 등록은 4단계) */
export function FloatingProp({
  kind,
  position,
  rotationY = 0,
}: {
  kind: keyof typeof SPEC
  position: [number, number, number]
  rotationY?: number
}) {
  const body = useRef<RapierRigidBody>(null)
  const s = SPEC[kind]
  useBuoyancy(body, { halfHeight: s.half[1], floatiness: s.floatiness })
  return (
    <RigidBody ref={body} colliders={false} position={position} rotation={[0, rotationY, 0]} mass={s.mass}>
      <CuboidCollider args={[...s.half]} friction={0.6} restitution={0.1} />
      <Suspense fallback={null}>
        <GltfVisual url={bathModel(kind)} />
      </Suspense>
    </RigidBody>
  )
}
