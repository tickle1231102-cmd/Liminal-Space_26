import { useMemo } from 'react'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import type { Range } from './layout'

/**
 * 찜질방 화이트박스 키트 (1단계). 2단계에서 표면 재질·Blender 모델(art/blender/jjimjilbang)이 겉모습을 맡는다.
 * 좌표는 Three 기준(y 위, 플레이어는 -Z 방향으로 들어간다).
 */
export const PALETTE = {
  jangpan: '#c9b27a',
  carpet: '#5a2f33',
  plaster: '#d9d0bd',
  wood: '#8c6b47',
  woodDark: '#584231',
  hwangto: '#a8623c',
  salt: '#e6b3a6',
  charcoal: '#3b3835',
  ice: '#cfe3ea',
  concrete: '#77746e',
  steel: '#7f8589',
  stone: '#8e8a80',
}

/** 방마다 다른 빛 (PRD 15절 톤 관리 메모) */
export const LIGHT = {
  fluorescent: '#fff1c9',
  salt: '#ff9aa8',
  clay: '#ff9a5c',
  kiln: '#ff4a2a',
  ice: '#bfe6ff',
  tv: '#7fa8ff',
  dim: '#c9b48a',
}

type Vec3 = [number, number, number]

type BoxProps = {
  position: Vec3
  size: Vec3
  color?: string
  roughness?: number
  emissive?: string
  emissiveIntensity?: number
  /** false면 충돌 없이 보이기만 한다 */
  solid?: boolean
  rotation?: Vec3
  /** false면 콜라이더만 두고 그리지 않는다 */
  visible?: boolean
}

/** 고정 콜라이더를 가진 박스 한 덩어리. */
export function Box({
  position,
  size,
  color = PALETTE.plaster,
  roughness = 0.85,
  emissive,
  emissiveIntensity = 0,
  solid = true,
  rotation,
  visible = true,
}: BoxProps) {
  if (!visible) {
    return (
      <RigidBody type="fixed" colliders={false} position={position} rotation={rotation}>
        <CuboidCollider args={[size[0] / 2, size[1] / 2, size[2] / 2]} />
      </RigidBody>
    )
  }
  const mesh = (
    <mesh castShadow receiveShadow position={solid ? undefined : position} rotation={solid ? undefined : rotation}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={roughness} emissive={emissive ?? '#000000'} emissiveIntensity={emissiveIntensity} />
    </mesh>
  )
  if (!solid) return mesh
  return (
    <RigidBody type="fixed" colliders="cuboid" position={position} rotation={rotation}>
      {mesh}
    </RigidBody>
  )
}

/** 바닥 슬랩: 윗면이 y = top. */
export function Floor({ x, z, top = 0, color = PALETTE.jangpan }: { x: Range; z: Range; top?: number; color?: string }) {
  return (
    <Box
      position={[(x[0] + x[1]) / 2, top - 0.1, (z[0] + z[1]) / 2]}
      size={[x[1] - x[0], 0.2, z[1] - z[0]]}
      color={color}
      roughness={0.6}
    />
  )
}

/** 천장: 보이기만 하는 판. */
export function Ceiling({ x, z, height, color = PALETTE.plaster }: { x: Range; z: Range; height: number; color?: string }) {
  return (
    <mesh position={[(x[0] + x[1]) / 2, height + 0.05, (z[0] + z[1]) / 2]} receiveShadow>
      <boxGeometry args={[x[1] - x[0], 0.1, z[1] - z[0]]} />
      <meshStandardMaterial color={color} roughness={0.95} />
    </mesh>
  )
}

export const DOOR_H = 2.2

/**
 * 직선 벽. axis='x'면 z=at 위에서 x 방향으로, 'z'면 x=at 위에서 z 방향으로 뻗는다.
 * gaps는 문 구간 — doorHeight 위로는 상인방을 채운다.
 */
export function Wall({
  axis,
  at,
  from,
  to,
  height,
  gaps = [],
  doorHeight = DOOR_H,
  thickness = 0.25,
  color = PALETTE.plaster,
}: {
  axis: 'x' | 'z'
  at: number
  from: number
  to: number
  height: number
  gaps?: Range[]
  doorHeight?: number
  thickness?: number
  color?: string
}) {
  const key = gaps.flat().join(',')
  const pieces = useMemo(() => {
    const out: { a: number; b: number; y0: number; y1: number }[] = []
    let cursor = from
    for (const [g0, g1] of [...gaps].sort((p, q) => p[0] - q[0])) {
      if (g0 > cursor) out.push({ a: cursor, b: g0, y0: 0, y1: height })
      if (height > doorHeight) out.push({ a: g0, b: g1, y0: doorHeight, y1: height })
      cursor = g1
    }
    if (to > cursor) out.push({ a: cursor, b: to, y0: 0, y1: height })
    return out
    // gaps는 내용(key)으로 비교한다 — 호출부가 매번 새 배열을 넘긴다
  }, [from, to, height, doorHeight, key])

  return (
    <>
      {pieces.map(({ a, b, y0, y1 }) => {
        const len = b - a
        const mid = (a + b) / 2
        const h = y1 - y0
        const pos: Vec3 = axis === 'x' ? [mid, y0 + h / 2, at] : [at, y0 + h / 2, mid]
        const size: Vec3 = axis === 'x' ? [len, h, thickness] : [thickness, h, len]
        return <Box key={`${a}:${y0}`} position={pos} size={size} color={color} />
      })}
    </>
  )
}

/** 천장 등 — 작은 발광 판과 그림자 없는 포인트 라이트. */
export function Lamp({
  position,
  color = LIGHT.fluorescent,
  intensity = 6,
  distance = 14,
}: {
  position: Vec3
  color?: string
  intensity?: number
  distance?: number
}) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[1.2, 0.06, 0.3]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </mesh>
      <pointLight position={[0, -0.25, 0]} color={color} intensity={intensity} distance={distance} decay={1.6} />
    </group>
  )
}
