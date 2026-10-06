import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { PitchWobbleBed } from '../../../core/audio/PitchWobble'

/** 방송실 콘솔 위치 — 여기서 멀어질수록 잡음이 잦아든다. */
const SOURCE = new THREE.Vector3(-4, 1.5, -39.5)

/**
 * 방송실 잡음 루프. 놀이공원의 라이드 음악과 같은 피치 워블(디튠 + 느린 LFO)을
 * 그대로 쓴다 — 가사도 내레이션도 없이 톤만 반 박자 어긋나 있어야 한다.
 */
export function BroadcastNoise({ enabled }: { enabled: boolean }) {
  const bed = useRef<PitchWobbleBed | null>(null)
  const { camera } = useThree()

  useEffect(() => {
    if (!enabled) return
    const b = new PitchWobbleBed()
    b.sourceWorld = SOURCE.clone()
    bed.current = b
    void b.ensure()
    return () => {
      b.dispose()
      bed.current = null
    }
  }, [enabled])

  useFrame(() => {
    const b = bed.current
    if (!enabled || !b) return
    b.setDistanceVolume(camera.position.distanceTo(b.sourceWorld))
  })

  return null
}
