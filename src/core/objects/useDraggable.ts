import { useEffect, useRef, type RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { RapierRigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import { useInteraction } from '../player/InteractionContext'

type DragOptions = {
  /** 끌고 갈 때 손이 놓이는 높이 — 낮을수록 바닥에 붙어 미끄러지는 느낌 */
  dragHeight?: number
  /** 시선 앞 거리(m) */
  reach?: number
  /** 이보다 빠르게 휘두르면 손에서 놓친다 (PRD 04절 — 과도한 힘이면 놓침) */
  releaseSpeed?: number
}

/**
 * 밀기/끌기 공용 동작(PRD 04절 단일 상호작용 축). 상호작용 대상으로 등록하고,
 * 잡힌 동안 바디를 시선 앞 일정 높이로 끌고 다닌다. 반환값: 지금 잡혀 있는지.
 * 바디는 held일 때 type="kinematicPosition"이어야 한다.
 */
export function useDraggable(
  id: string,
  label: string,
  body: RefObject<RapierRigidBody | null>,
  { dragHeight = 0.45, reach = 1.25, releaseSpeed = 9 }: DragOptions = {},
) {
  const interaction = useInteraction()
  const { camera } = useThree()
  const target = useRef(new THREE.Vector3())
  const prev = useRef(new THREE.Vector3())
  const vel = useRef(new THREE.Vector3())
  const dir = useRef(new THREE.Vector3())
  const wasHeld = useRef(false)
  const lastT = useRef(0)

  useEffect(() => {
    interaction.register({ id, kind: 'push', label, body })
    return () => interaction.unregister(id)
  }, [id, label, interaction, body])

  const held = interaction.heldId === id

  useFrame(() => {
    const rb = body.current
    if (!rb || !held) {
      wasHeld.current = false
      return
    }

    dir.current.set(0, 0, -1).applyQuaternion(camera.quaternion)
    dir.current.y = 0
    if (dir.current.lengthSq() < 1e-4) return
    dir.current.normalize()

    target.current
      .set(camera.position.x, dragHeight, camera.position.z)
      .addScaledVector(dir.current, reach)

    // 휘두르기 속도 = 플레이어 기준 손 위치(시선 방향 오프셋)의 변화. 걷는 속도나 프레임 끊김에
    // 따른 따라잡기 이동은 세지 않는다 (PRD 04절 — 과도하게 휘두를 때만 놓친다).
    // 잡은 첫 프레임은 이전 값이 없으므로 속도 0에서 시작한다.
    const now = performance.now() / 1000
    const offset = dir.current
    if (!wasHeld.current) {
      prev.current.copy(offset)
      lastT.current = now
      wasHeld.current = true
    }
    const elapsed = Math.max(now - lastT.current, 1 / 120)
    lastT.current = now
    vel.current.copy(offset).sub(prev.current).multiplyScalar(reach / elapsed)
    prev.current.copy(offset)

    rb.setNextKinematicTranslation({ x: target.current.x, y: target.current.y, z: target.current.z })

    if (vel.current.length() > releaseSpeed) {
      interaction.setHeldId(null)
      rb.setLinvel({ x: vel.current.x * 0.3, y: 0, z: vel.current.z * 0.3 }, true)
    }
  })

  return held
}
