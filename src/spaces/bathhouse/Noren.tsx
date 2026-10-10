import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { bathModel } from './BathKit'

/**
 * 노렌 (art/blender/bathhouse/noren.py) — 세 폭이 각자 윗변을 축으로 흔들린다.
 * 평소엔 느리게 일렁이고, 플레이어가 지나가면 그 폭이 진행 방향으로 밀려 젖혀졌다 돌아온다.
 * position = 막대 중심. 충돌 없음.
 */
export function Noren({ position, reduceMotion }: { position: [number, number, number]; reduceMotion: boolean }) {
  const { scene } = useGLTF(bathModel('noren'))
  const root = useMemo(() => scene.clone(true), [scene])
  const panels = useMemo(
    () => [0, 1, 2].map((i) => root.getObjectByName(`Panel_${i}`)).filter((o): o is THREE.Object3D => !!o),
    [root],
  )
  const state = useRef(panels.map(() => ({ angle: 0, vel: 0 })))
  const local = useRef(new THREE.Vector3())

  useFrame(({ camera, clock }, dt) => {
    const step = Math.min(dt, 1 / 30)
    const t = clock.elapsedTime
    root.worldToLocal(local.current.copy(camera.position))
    const p = local.current
    panels.forEach((panel, i) => {
      const s = state.current[i]!
      // 플레이어가 이 폭을 지나면(가로 범위 안, 천 높이, 앞뒤 0.5 m 이내) 몸 반대쪽으로 민다
      const dx = Math.abs(p.x - panel.position.x)
      let push = 0
      if (dx < 0.6 && Math.abs(p.z) < 0.5 && p.y > -2.2) push = -Math.sign(p.z || 1) * (1 - Math.abs(p.z) / 0.5) * 1.1
      const idle = reduceMotion ? 0 : 0.035 * Math.sin(t * 0.7 + i * 1.3) + 0.015 * Math.sin(t * 1.9 + i)
      const target = push + idle
      // 감쇠 스프링 — 천이 젖혀졌다가 살짝 넘쳐 돌아온다
      s.vel += ((target - s.angle) * 38 - s.vel * 5.5) * step
      s.angle += s.vel * step
      panel.rotation.x = s.angle
    })
  })

  return <primitive object={root} position={position} />
}
