import { useMemo } from 'react'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { GltfAsset, GltfInstances, spaceModel } from '../../core/world/GltfAsset'
import { ModelBoundary } from '../../core/world/ModelBoundary'
import { getQuality } from '../../core/world/quality'
import type { Range } from './layout'

/**
 * 찜질방 키트 — 박스로 방 셸을 짓고, 겉은 공용 표면 재질(art/blender/jjimjilbang/surfaces.py)을 입힌다.
 * 랜드마크와 소품은 Blender 모델(Model / ModelRow)이 맡는다. 색(color)은 재질 로딩 전과 모델이 빠졌을 때의 대체값이다.
 * 좌표는 Three 기준(y 위, 플레이어는 -Z 방향으로 들어간다).
 */

/** 저사양 프리셋이면 512px 텍스처 변형(<name>.mobile.glb — scripts/build-assets.mjs)을 쓴다 */
export const jjimModel = (name: string) => spaceModel('jjimjilbang', getQuality() === 'low' ? `${name}.mobile` : name)

/** art/blender/jjimjilbang/surfaces.py 의 재질 이름 (Surf_<name>) */
export type Surface =
  | 'Jangpan'
  | 'Carpet'
  | 'Plaster'
  | 'Concrete'
  | 'Hwangto'
  | 'ClayBrick'
  | 'SaltBrick'
  | 'Charcoal'
  | 'Stone'
  | 'IcePanel'
  | 'Wood'
  | 'WoodDark'

type Vec3 = [number, number, number]

/**
 * 텍스처 한 장이 덮는 길이(m). 기본 1. 회벽·흙벽·콘크리트는 무늬가 없는 얼룩이라 1 m로 반복하면
 * 큰 벽에서 격자처럼 읽힌다 — 3 m로 늘려 반복이 눈에 띄지 않게 한다.
 */
const PERIOD: Partial<Record<Surface, number>> = { Plaster: 3, Concrete: 3, Hwangto: 3, Charcoal: 3 }

/** 박스의 넓은 면에서 텍스처가 반복될 횟수 (1 주기 = 1 m). 가장 얇은 축을 뺀 두 변을 면의 U·V 순서대로. */
function faceRepeat([sx, sy, sz]: Vec3): [number, number] {
  if (sy <= sx && sy <= sz) return [sx, sz]
  if (sx <= sz) return [sz, sy]
  return [sx, sy]
}

/** 공용 표면 재질을 박스 크기에 맞춰 타일링한 복제본. glow를 주면 같은 무늬로 스스로 빛난다(뒤에서 비추는 암염 벽). */
function useSurface(surface: Surface, size: Vec3, glow?: { color: string; intensity: number }) {
  const { scene } = useGLTF(jjimModel('surfaces'))
  const period = PERIOD[surface] ?? 1
  const [u, v] = faceRepeat(size).map((n) => n / period)
  const glowColor = glow?.color
  const glowIntensity = glow?.intensity
  return useMemo(() => {
    let src: THREE.MeshStandardMaterial | null = null
    scene.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined
      if (m && m.name === `Surf_${surface}`) src = m
    })
    if (!src) return null
    const mat = (src as THREE.MeshStandardMaterial).clone()
    for (const key of ['map', 'normalMap', 'roughnessMap', 'metalnessMap'] as const) {
      const t = mat[key]
      if (!t) continue
      const c = t.clone()
      c.wrapS = c.wrapT = THREE.RepeatWrapping
      c.repeat.set(u, v)
      c.needsUpdate = true
      mat[key] = c
    }
    if (glowColor) {
      mat.emissive = new THREE.Color(glowColor)
      mat.emissiveMap = mat.map
      mat.emissiveIntensity = glowIntensity ?? 1
    }
    return mat
  }, [scene, surface, u, v, glowColor, glowIntensity])
}

function SurfacedMesh({ surface, size, glow }: { surface: Surface; size: Vec3; glow?: { color: string; intensity: number } }) {
  const material = useSurface(surface, size, glow)
  return material ? <primitive object={material} attach="material" /> : null
}

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
  /** false면 콜라이더만 두고 그리지 않는다 (Blender 모델이 겉모습을 맡을 때) */
  visible?: boolean
  /** 공용 PBR 표면 재질 (로딩 중에는 color로 그린다) */
  surface?: Surface
  /** surface와 함께: 같은 무늬로 발광 */
  glow?: { color: string; intensity: number }
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
  surface,
  glow,
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
      {surface && (
        <ModelBoundary label="surfaces">
          <SurfacedMesh surface={surface} size={size} glow={glow} />
        </ModelBoundary>
      )}
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
export function Floor({
  x,
  z,
  top = 0,
  color = PALETTE.jangpan,
  surface = 'Jangpan',
}: {
  x: Range
  z: Range
  top?: number
  color?: string
  surface?: Surface
}) {
  return (
    <Box
      position={[(x[0] + x[1]) / 2, top - 0.1, (z[0] + z[1]) / 2]}
      size={[x[1] - x[0], 0.2, z[1] - z[0]]}
      color={color}
      roughness={0.6}
      surface={surface}
    />
  )
}

/** 천장: 보이기만 하는 판. */
export function Ceiling({
  x,
  z,
  height,
  color = PALETTE.plaster,
  surface = 'Plaster',
}: {
  x: Range
  z: Range
  height: number
  color?: string
  surface?: Surface
}) {
  return (
    <Box
      position={[(x[0] + x[1]) / 2, height + 0.05, (z[0] + z[1]) / 2]}
      size={[x[1] - x[0], 0.1, z[1] - z[0]]}
      color={color}
      roughness={0.95}
      surface={surface}
      solid={false}
    />
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
  surface = 'Plaster',
  glow,
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
  surface?: Surface
  glow?: { color: string; intensity: number }
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
        return <Box key={`${a}:${y0}`} position={pos} size={size} color={color} surface={surface} glow={glow} />
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

/** Blender 모델 하나 배치 (COL_* 콜라이더 포함). */
export function Model({ name, position, rotationY = 0 }: { name: string; position: Vec3; rotationY?: number }) {
  return (
    <ModelBoundary label={name}>
      <GltfAsset url={jjimModel(name)} position={position} rotationY={rotationY} />
    </ModelBoundary>
  )
}

/** 같은 모델 여러 개 — 인스턴싱으로 재질당 드로우콜 하나. 각 사본은 모델의 COL_* 콜라이더를 가진다. */
export function ModelRow({ name, items }: { name: string; items: { position: Vec3; rotationY?: number }[] }) {
  return (
    <ModelBoundary label={name}>
      <GltfInstances url={jjimModel(name)} items={items} solid />
    </ModelBoundary>
  )
}
