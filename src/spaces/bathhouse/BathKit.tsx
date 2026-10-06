import { Suspense, useMemo } from 'react'
import { ModuleRun, spaceModel } from '../../core/world/GltfAsset'
import { RigidBody } from '@react-three/rapier'
import * as THREE from 'three'

/**
 * 0단계 화이트박스 키트. 2단계에서 Blender 모델(art/blender/bathhouse)로 교체한다.
 * 좌표는 Three 기준(y 위, 플레이어는 -Z 방향으로 들어간다).
 */

export const PALETTE = {
  wood: '#8a6a48',
  woodDark: '#5a4330',
  plaster: '#d8d2c2',
  tileWhite: '#dfe3df',
  tileBlue: '#6f9fb4',
  tileGreen: '#8fb8a4',
  concrete: '#6c6a66',
  steel: '#7d8286',
}

type BoxProps = {
  position: [number, number, number]
  size: [number, number, number]
  color?: string
  map?: THREE.Texture
  roughness?: number
  metalness?: number
  emissive?: string
  emissiveIntensity?: number
  /** false면 충돌 없이 보이기만 한다 */
  solid?: boolean
  rotation?: [number, number, number]
}

/** 고정 콜라이더를 가진 박스 한 덩어리. */
export function Box({
  position,
  size,
  color = PALETTE.plaster,
  map,
  roughness = 0.8,
  metalness = 0,
  emissive,
  emissiveIntensity = 0,
  solid = true,
  rotation,
}: BoxProps) {
  const mesh = (
    <mesh castShadow receiveShadow position={solid ? undefined : position} rotation={solid ? undefined : rotation}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        map={map}
        color={color}
        roughness={roughness}
        metalness={metalness}
        emissive={emissive ?? '#000000'}
        emissiveIntensity={emissiveIntensity}
      />
    </mesh>
  )
  if (!solid) return mesh
  return (
    <RigidBody type="fixed" colliders="cuboid" position={position} rotation={rotation}>
      {mesh}
    </RigidBody>
  )
}

/** 바닥 슬랩: 윗면이 y = top. x·z 범위로 지정한다. */
export function Floor({
  x,
  z,
  top = 0,
  color = PALETTE.tileWhite,
  map,
}: {
  x: [number, number]
  z: [number, number]
  top?: number
  color?: string
  map?: THREE.Texture
}) {
  const w = x[1] - x[0]
  const d = z[1] - z[0]
  return (
    <Box
      position={[(x[0] + x[1]) / 2, top - 0.1, (z[0] + z[1]) / 2]}
      size={[w, 0.2, d]}
      color={color}
      map={map}
      roughness={0.35}
    />
  )
}

/** 천장: 보이기만 하는 판 (플레이어가 닿지 않는 높이). */
export function Ceiling({
  x,
  z,
  height,
  color = PALETTE.plaster,
}: {
  x: [number, number]
  z: [number, number]
  height: number
  color?: string
}) {
  return (
    <mesh position={[(x[0] + x[1]) / 2, height + 0.05, (z[0] + z[1]) / 2]} receiveShadow>
      <boxGeometry args={[x[1] - x[0], 0.1, z[1] - z[0]]} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  )
}

const DOOR_H = 2.3

/**
 * 직선 벽. axis='x'면 z=at 위에서 x 방향으로, 'z'면 x=at 위에서 z 방향으로 뻗는다.
 * gaps는 문 구간 — 높이 DOOR_H 위로는 상인방을 채운다.
 */
export function Wall({
  axis,
  at,
  from,
  to,
  height,
  gaps = [],
  thickness = 0.25,
  color = PALETTE.plaster,
  map,
}: {
  axis: 'x' | 'z'
  at: number
  from: number
  to: number
  height: number
  gaps?: [number, number][]
  thickness?: number
  color?: string
  map?: THREE.Texture
}) {
  const pieces = useMemo(() => {
    const out: { a: number; b: number; y0: number; y1: number }[] = []
    let cursor = from
    for (const [g0, g1] of [...gaps].sort((p, q) => p[0] - q[0])) {
      if (g0 > cursor) out.push({ a: cursor, b: g0, y0: 0, y1: height })
      out.push({ a: g0, b: g1, y0: DOOR_H, y1: height })
      cursor = g1
    }
    if (to > cursor) out.push({ a: cursor, b: to, y0: 0, y1: height })
    return out
  }, [from, to, height, gaps])

  return (
    <>
      {pieces.map(({ a, b, y0, y1 }) => {
        const len = b - a
        const mid = (a + b) / 2
        const h = y1 - y0
        const pos: [number, number, number] =
          axis === 'x' ? [mid, y0 + h / 2, at] : [at, y0 + h / 2, mid]
        const size: [number, number, number] =
          axis === 'x' ? [len, h, thickness] : [thickness, h, len]
        return <Box key={`${a}:${y0}`} position={pos} size={size} color={color} map={map} />
      })}
    </>
  )
}

/** 따뜻한 백열등: 발광 갓 + 그림자 없는 포인트 라이트. */
export function WarmLamp({
  position,
  intensity = 6,
  distance = 11,
  color = '#ffd2a1',
}: {
  position: [number, number, number]
  intensity?: number
  distance?: number
  color?: string
}) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.14, 12, 10]} />
        <meshStandardMaterial color="#fff1dc" emissive={color} emissiveIntensity={2.4} />
      </mesh>
      <pointLight color={color} intensity={intensity} distance={distance} decay={1.6} />
    </group>
  )
}

/** 캔버스 타일 텍스처 — 1단계에서 Blender 베이크 재질로 교체. */
export function tileTexture(base: string, grout: string, tiles = 8, repeat: [number, number] = [1, 1]) {
  const size = 256
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')!
  g.fillStyle = grout
  g.fillRect(0, 0, size, size)
  const cell = size / tiles
  for (let i = 0; i < tiles; i++) {
    for (let j = 0; j < tiles; j++) {
      const v = ((i * 7 + j * 13) % 5) * 3
      g.fillStyle = shade(base, v - 6)
      g.fillRect(i * cell + 1.5, j * cell + 1.5, cell - 3, cell - 3)
    }
  }
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(...repeat)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function shade(hex: string, delta: number) {
  const n = parseInt(hex.slice(1), 16)
  const ch = (s: number) => Math.max(0, Math.min(255, ((n >> s) & 255) + delta))
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`
}

export const bathModel = (name: string) => spaceModel('bathhouse', name)

/** art/blender/bathhouse/tile_wall_module.py — 2 m 모듈, 높이 6 m, 두께 0.25 m (원래 크기로 배치). */
const TILE_WALL = { url: bathModel('tile_wall_module'), length: 2, height: 6, thickness: 0.25 }

/**
 * 욕실 타일 벽. 구간 길이는 2 m 배수로 잡아야 타일 줄눈이 모듈 사이에서 이어진다.
 * 문 구간 위 상인방은 흰 타일 색 박스로 채운다(1단계 임시).
 */
export function TileWall({
  axis,
  at,
  from,
  to,
  gaps = [],
}: {
  axis: 'x' | 'z'
  at: number
  from: number
  to: number
  gaps?: [number, number][]
}) {
  const runs: [number, number][] = []
  let cursor = from
  for (const [g0, g1] of [...gaps].sort((p, q) => p[0] - q[0])) {
    if (g0 > cursor) runs.push([cursor, g0])
    cursor = g1
  }
  if (to > cursor) runs.push([cursor, to])
  const pt = (v: number): [number, number] => (axis === 'x' ? [v, at] : [at, v])
  const h = TILE_WALL.height
  return (
    <>
      <Suspense fallback={null}>
        {runs.map(([a, b]) => (
          <ModuleRun
            key={`${a}:${b}`}
            url={TILE_WALL.url}
            from={pt(a)}
            to={pt(b)}
            module={TILE_WALL.length}
            height={h}
            thickness={TILE_WALL.thickness}
            fit={{ height: h, thickness: TILE_WALL.thickness }}
          />
        ))}
      </Suspense>
      {gaps.map(([g0, g1]) => {
        const mid = (g0 + g1) / 2
        const lh = h - DOOR_H
        return (
          <Box
            key={`lintel${g0}`}
            position={axis === 'x' ? [mid, DOOR_H + lh / 2, at] : [at, DOOR_H + lh / 2, mid]}
            size={axis === 'x' ? [g1 - g0, lh, TILE_WALL.thickness] : [TILE_WALL.thickness, lh, g1 - g0]}
            color="#c9cdc8"
            roughness={0.3}
          />
        )
      })}
    </>
  )
}
