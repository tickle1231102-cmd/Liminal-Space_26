import { useMemo, useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import * as THREE from 'three'

export const CEILING_H = 3.4

/** 고정 콜라이더를 가진 벽/기둥 한 덩어리. */
export function Slab({
  position,
  size,
  color = '#c6c2b4',
  roughness = 0.88,
  metalness = 0.04,
  map,
  emissive,
  emissiveIntensity = 0,
}: {
  position: [number, number, number]
  size: [number, number, number]
  color?: string
  roughness?: number
  metalness?: number
  map?: THREE.Texture
  emissive?: string
  emissiveIntensity?: number
}) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial
          map={map}
          color={color}
          roughness={roughness}
          metalness={metalness}
          emissive={emissive ?? '#000'}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>
    </RigidBody>
  )
}

/**
 * 바닥 한 판 + 콜라이더. `width`는 X, `depth`는 Z.
 * 실내 공간의 기준 평면이며, 위층/계단 참에도 재사용한다.
 */
export function FloorSlab({
  center,
  width,
  depth,
  y = 0,
  map,
  color = '#b9b3a2',
}: {
  center: [number, number]
  width: number
  depth: number
  y?: number
  map?: THREE.Texture
  color?: string
}) {
  return (
    <group position={[center[0], y, center[1]]}>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider
          args={[width / 2, 0.25, depth / 2]}
          position={[0, -0.25, 0]}
          friction={1.15}
          restitution={0}
        />
      </RigidBody>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial map={map} color={color} roughness={0.7} metalness={0.06} />
      </mesh>
    </group>
  )
}

/** 천장판 — 위를 올려다봤을 때 하늘이 보이지 않게 실내를 닫는다. */
export function CeilingSlab({
  center,
  width,
  depth,
  y = CEILING_H,
}: {
  center: [number, number]
  width: number
  depth: number
  y?: number
}) {
  return (
    <mesh
      rotation={[Math.PI / 2, 0, 0]}
      position={[center[0], y, center[1]]}
      receiveShadow
    >
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial color="#9fa096" roughness={0.95} />
    </mesh>
  )
}

/**
 * 형광등. `flickerSeed`가 있으면 느리고 불규칙하게 점멸한다 —
 * 점프스케어가 아니라 "고쳐지지 않은 채 방치된" 인상을 위한 것이라 진폭을 얕게 둔다.
 */
export function Fluorescent({
  position,
  rotationY = 0,
  length = 2.4,
  on = true,
  flickerSeed,
  reduceMotion = false,
  intensity = 9,
}: {
  position: [number, number, number]
  rotationY?: number
  length?: number
  on?: boolean
  flickerSeed?: number
  reduceMotion?: boolean
  intensity?: number
}) {
  const light = useRef<THREE.PointLight>(null)
  const mat = useRef<THREE.MeshBasicMaterial>(null)
  const flicker = !reduceMotion && flickerSeed !== undefined
  const baseColor = useMemo(() => new THREE.Color(on ? '#f2f6ff' : '#6b6f74'), [on])

  useFrame(({ clock }) => {
    if (!on || !flicker) return
    const t = clock.elapsedTime + flickerSeed!
    const s = Math.sin(t * 11.3 + Math.sin(t * 2.1) * 3)
    const dip = s > 0.86 ? 0.25 : 1
    if (light.current) light.current.intensity = intensity * dip
    if (mat.current) mat.current.color.copy(baseColor).multiplyScalar(dip)
  })

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh>
        <boxGeometry args={[length, 0.08, 0.22]} />
        <meshBasicMaterial ref={mat} color={on ? '#f2f6ff' : '#6b6f74'} toneMapped={false} />
      </mesh>
      {on && (
        <pointLight
          ref={light}
          position={[0, -0.15, 0]}
          intensity={intensity}
          distance={11}
          decay={2}
          color="#dfe9ff"
        />
      )}
    </group>
  )
}

/** 벽에 뚫린 문틀 — 실제 문짝은 없고 통행만 가능하다. */
export function Doorway({
  position,
  rotationY = 0,
  width = 1.6,
  height = 2.2,
}: {
  position: [number, number, number]
  rotationY?: number
  width?: number
  height?: number
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <Slab position={[0, height / 2, 0]} size={[0.12, height, 0.12]} color="#8e8877" />
      <Slab position={[width, height / 2, 0]} size={[0.12, height, 0.12]} color="#8e8877" />
      <Slab position={[width / 2, height + 0.06, 0]} size={[width + 0.24, 0.12, 0.12]} color="#8e8877" />
    </group>
  )
}

/** 문이 없는 구간을 남기고 벽을 X축으로 쪼개 세운다. */
export function WallWithGap({
  z,
  from,
  to,
  gapFrom,
  gapTo,
  height = CEILING_H,
  thickness = 0.24,
  color = '#c3bfb0',
}: {
  z: number
  from: number
  to: number
  gapFrom: number
  gapTo: number
  height?: number
  thickness?: number
  color?: string
}) {
  const segments: Array<[number, number]> = [
    [from, gapFrom],
    [gapTo, to],
  ]
  return (
    <>
      {segments.map(([a, b]) =>
        b - a > 0.05 ? (
          <Slab
            key={`${a}-${b}`}
            position={[(a + b) / 2, height / 2, z]}
            size={[b - a, height, thickness]}
            color={color}
          />
        ) : null,
      )}
    </>
  )
}

/** 벽면 하단 걸레받이 — 복도 길이감을 만드는 수평선. */
export function Baseboard({
  position,
  length,
  rotationY = 0,
}: {
  position: [number, number, number]
  length: number
  rotationY?: number
}) {
  return (
    <mesh position={position} rotation={[0, rotationY, 0]}>
      <boxGeometry args={[length, 0.16, 0.06]} />
      <meshStandardMaterial color="#5c6a63" roughness={0.7} />
    </mesh>
  )
}

/** 벽에 붙는 평면 사인 — 텍스처만 갈아끼워 재사용한다. */
export function WallPanel({
  position,
  rotationY = 0,
  size,
  map,
  emissiveIntensity = 0.12,
}: {
  position: [number, number, number]
  rotationY?: number
  size: [number, number]
  map: THREE.Texture
  emissiveIntensity?: number
}) {
  return (
    <mesh position={position} rotation={[0, rotationY, 0]}>
      <planeGeometry args={size} />
      <meshStandardMaterial
        map={map}
        emissiveMap={map}
        emissive="#ffffff"
        emissiveIntensity={emissiveIntensity}
        roughness={0.9}
      />
    </mesh>
  )
}

export function ZoneGroup({ name, children }: { name: string; children: ReactNode }) {
  const key = useMemo(() => name, [name])
  return <group name={key}>{children}</group>
}
