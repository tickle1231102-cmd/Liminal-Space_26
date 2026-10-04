import { Suspense, useMemo, useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { GltfAsset, ModuleRun, schoolModel } from '../GltfAsset'

export const CEILING_H = 3.4

/** art/blender/school/wall_module.py 의 원래 치수 (2 m × 3.4 m × 0.24 m). */
const WALL_MODULE = { length: 2, fit: { height: 3.4, thickness: 0.24 } }

/** 얇고 높은 슬랩 = 벽. 벽은 Blender 벽 모듈로, 나머지(기둥·선반 등)는 기본 박스로 그린다. */
function isWall([x, y, z]: [number, number, number]) {
  return y >= 2.4 && Math.min(x, z) <= 0.35 && Math.max(x, z) >= 1
}

/** 벽 한 면: 위치/크기는 기존 Slab과 같고(바닥 기준 y = 높이/2), 모듈을 길이·높이·두께에 맞게 늘린다. */
export function WallSlab({ position, size }: { position: [number, number, number]; size: [number, number, number] }) {
  const [px, , pz] = position
  const [w, h, d] = size
  const alongX = w >= d
  const half = (alongX ? w : d) / 2
  const from: [number, number] = alongX ? [px - half, pz] : [px, pz - half]
  const to: [number, number] = alongX ? [px + half, pz] : [px, pz + half]
  return (
    <Suspense fallback={null}>
      <ModuleRun
        url={schoolModel('wall_module')}
        from={from}
        to={to}
        module={WALL_MODULE.length}
        height={h}
        thickness={alongX ? d : w}
        fit={WALL_MODULE.fit}
      />
    </Suspense>
  )
}

/** 고정 콜라이더를 가진 벽/기둥 한 덩어리. 벽 모양이면 WallSlab으로 넘긴다. */
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
  if (isWall(size)) return <WallSlab position={position} size={size} />
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

const FLUORESCENT_LENGTH = 2.4 // art/blender/school/fluorescent.py

/**
 * 형광등 (art/blender/school/fluorescent.py). `flickerSeed`가 있으면 느리고 불규칙하게 점멸한다 —
 * 점프스케어가 아니라 "고쳐지지 않은 채 방치된" 인상을 위한 것이라 진폭을 얕게 둔다.
 * 등마다 "Tube" 재질을 복제해 따로 끄고/깜빡인다.
 */
export function Fluorescent(props: {
  position: [number, number, number]
  rotationY?: number
  length?: number
  on?: boolean
  flickerSeed?: number
  reduceMotion?: boolean
  intensity?: number
}) {
  return (
    <Suspense fallback={null}>
      <FluorescentModel {...props} />
    </Suspense>
  )
}

function FluorescentModel({
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
  const { scene } = useGLTF(schoolModel('fluorescent'))
  const light = useRef<THREE.PointLight>(null)
  const flicker = !reduceMotion && flickerSeed !== undefined
  // Tube is drawn unlit (like the old MeshBasicMaterial bar): a lit surface 0.15 m above the
  // point light blows out and leaves a black hole in bloom.
  const { root, tube } = useMemo(() => {
    const root = scene.clone(true)
    const tube = new THREE.MeshBasicMaterial({ color: on ? '#f2f6ff' : '#6b6f74', toneMapped: false })
    root.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (mesh.isMesh && (mesh.material as THREE.Material).name === 'Tube') mesh.material = tube
    })
    return { root, tube }
  }, [scene, on])
  const baseColor = useMemo(() => new THREE.Color(on ? '#f2f6ff' : '#6b6f74'), [on])

  useFrame(({ clock }) => {
    if (!on || !flicker) return
    const t = clock.elapsedTime + flickerSeed!
    const s = Math.sin(t * 11.3 + Math.sin(t * 2.1) * 3)
    const dip = s > 0.86 ? 0.25 : 1
    if (light.current) light.current.intensity = intensity * dip
    tube.color.copy(baseColor).multiplyScalar(dip)
  })

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <primitive object={root} scale={[length / FLUORESCENT_LENGTH, 1, 1]} />
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

/** 벽에 뚫린 문틀 (art/blender/school/door_frame.py, 1.8 m 기준) — 문짝은 없고 통행만 가능하다. */
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
    <Suspense fallback={null}>
      <GltfAsset
        url={schoolModel('door_frame')}
        position={position}
        rotationY={rotationY}
        scale={[width / 1.8, height / 2.2, 1]}
      />
    </Suspense>
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
