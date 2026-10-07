/**
 * 물 영역 레지스트리 — 공간이 탕·웅덩이 같은 물 영역을 등록하면 플레이어(이동 감속)와
 * 부력 오브젝트가 조회한다. 축 정렬 상자(xz 범위 + 수면 높이)만 지원한다.
 */
import { useEffect } from 'react'

export type WaterVolume = {
  id: string
  x: [number, number]
  z: [number, number]
  /** 수면 y */
  surface: number
  /** 바닥 y (깊이 계산용) */
  floor: number
}

const volumes = new Map<string, WaterVolume>()

export function waterAt(x: number, z: number): WaterVolume | null {
  for (const v of volumes.values()) {
    if (x >= v.x[0] && x <= v.x[1] && z >= v.z[0] && z <= v.z[1]) return v
  }
  return null
}

/** 점 (x, y, z)가 물에 잠긴 깊이(m). 물 밖이면 0. */
export function submergedDepth(x: number, y: number, z: number): number {
  const v = waterAt(x, z)
  return v ? Math.max(0, v.surface - y) : 0
}

export function useWaterVolume(v: WaterVolume) {
  const { id, surface, floor } = v
  const [x0, x1] = v.x
  const [z0, z1] = v.z
  useEffect(() => {
    volumes.set(id, { id, x: [x0, x1], z: [z0, z1], surface, floor })
    return () => void volumes.delete(id)
  }, [id, x0, x1, z0, z1, surface, floor])
}
