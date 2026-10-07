import { useBeforePhysicsStep, type RapierRigidBody } from '@react-three/rapier'
import type { RefObject } from 'react'
import { waterAt } from '../world/water'

type BuoyancyOptions = {
  /** 물체를 상자로 근사했을 때 반높이(m) — 잠긴 비율 계산용 */
  halfHeight: number
  /** 완전히 잠겼을 때 부력 / 무게. 1보다 크면 뜬다 (오리 ≈ 3, 바가지 ≈ 2) */
  floatiness: number
  /** 물속 감쇠 — 출렁임이 빨리 잦아든다 */
  drag?: number
}

/**
 * 간단한 부력: 물리 스텝마다 잠긴 비율만큼 위로 힘을 주고, 물속에서는 감쇠를 올린다.
 * 렌더 프레임(useFrame)이 아니라 물리 스텝 직전에 계산해야 프레임레이트와 무관하게 안정적이다
 * (프레임마다 갱신하면 낡은 힘이 여러 스텝에 걸쳐 남아 튀어 오르거나 가라앉는다).
 * 물 영역은 core/world/water의 레지스트리에서 찾는다.
 */
export function useBuoyancy(body: RefObject<RapierRigidBody | null>, opts: BuoyancyOptions) {
  const { halfHeight, floatiness, drag = 4 } = opts
  useBeforePhysicsStep(() => {
    const rb = body.current
    if (!rb) return
    const p = rb.translation()
    const v = waterAt(p.x, p.z)
    const sub = v ? Math.min(1, Math.max(0, (v.surface - (p.y - halfHeight)) / (2 * halfHeight))) : 0
    rb.resetForces(false)
    if (sub <= 0) {
      rb.setLinearDamping(0.05)
      rb.setAngularDamping(0.05)
      return
    }
    // 부력 = floatiness · m · g · 잠긴 비율
    rb.addForce({ x: 0, y: floatiness * rb.mass() * 9.81 * sub, z: 0 }, true)
    rb.setLinearDamping(drag * sub)
    rb.setAngularDamping(drag * 0.6 * sub)
  })
}
