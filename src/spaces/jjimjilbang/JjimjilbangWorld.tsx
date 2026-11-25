import { CuboidCollider, RigidBody } from '@react-three/rapier'
import type { SpaceWorldProps } from '../types'

/** 전체 평면 범위 (docs/space-jjimjilbang-plan.md 2절 배치도) */
const X: [number, number] = [-16, 30]
const Z: [number, number] = [-40, 26]

/**
 * 새벽의 찜질방 — docs/space-jjimjilbang-plan.md.
 * 0단계: 공간 등록과 스폰 확인용 빈 바닥만 있다. 구역(zones/)은 1단계 화이트박스에서 채운다.
 */
export default function JjimjilbangWorld(_props: SpaceWorldProps) {
  const w = X[1] - X[0]
  const d = Z[1] - Z[0]
  return (
    <>
      <color attach="background" args={['#14110d']} />
      <fog attach="fog" args={['#2b2620', 10, 50]} />
      <ambientLight intensity={0.5} color="#f0e2c4" />
      <hemisphereLight args={['#f4e6c8', '#2a241c', 0.6]} />
      <RigidBody type="fixed" colliders={false} position={[(X[0] + X[1]) / 2, -0.1, (Z[0] + Z[1]) / 2]}>
        <CuboidCollider args={[w / 2, 0.1, d / 2]} />
        <mesh receiveShadow>
          <boxGeometry args={[w, 0.2, d]} />
          <meshStandardMaterial color="#c9b27a" roughness={0.6} />
        </mesh>
      </RigidBody>
    </>
  )
}
