import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useWaterVolume } from '../../core/world/water'

/** 이음매 없는 잔물결 노멀맵 (정수 주파수 사인 합 → 반복해도 경계가 없다). */
function rippleNormalMap(size = 256, seed = 1) {
  let s = seed
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647)
  const waves = Array.from({ length: 10 }, () => ({
    fx: 1 + Math.floor(rnd() * 6),
    fy: 1 + Math.floor(rnd() * 6),
    ph: rnd() * Math.PI * 2,
    a: 0.4 + rnd(),
  }))
  const h = new Float32Array(size * size)
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      let v = 0
      for (const w of waves) v += (w.a / (w.fx + w.fy)) * Math.sin(((w.fx * x + w.fy * y) / size) * Math.PI * 2 + w.ph)
      h[y * size + x] = v
    }
  const data = new Uint8Array(size * size * 4)
  const k = 6
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const at = (xx: number, yy: number) => h[((yy + size) % size) * size + ((xx + size) % size)]
      const dx = (at(x + 1, y) - at(x - 1, y)) * k
      const dy = (at(x, y + 1) - at(x, y - 1)) * k
      const len = Math.hypot(dx, dy, 1)
      const i = (y * size + x) * 4
      data[i] = ((-dx / len) * 0.5 + 0.5) * 255
      data[i + 1] = ((-dy / len) * 0.5 + 0.5) * 255
      data[i + 2] = ((1 / len) * 0.5 + 0.5) * 255
      data[i + 3] = 255
    }
  const tex = new THREE.DataTexture(data, size, size)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.needsUpdate = true
  return tex
}

/**
 * 탕 수면. 노멀맵 두 장(normalMap · clearcoatNormalMap)을 서로 다른 방향으로 흘려
 * 겹치는 잔물결을 만들고, 환경 반사(BathAtmosphere의 라이트포머)를 비춘다.
 * 물 영역을 등록해 플레이어 감속·부력이 이 수면을 쓴다.
 */
export function Water({
  id,
  x,
  z,
  y,
  floor,
  color = '#4f9a9c',
  reduceMotion,
}: {
  id: string
  x: [number, number]
  z: [number, number]
  y: number
  floor: number
  color?: string
  reduceMotion: boolean
}) {
  useWaterVolume({ id, x, z, surface: y, floor })
  const w = x[1] - x[0]
  const d = z[1] - z[0]
  const { mat, a, b } = useMemo(() => {
    const a = rippleNormalMap(256, 7)
    const b = rippleNormalMap(256, 31)
    a.repeat.set(w / 3, d / 3)
    b.repeat.set(w / 1.7, d / 1.7)
    const mat = new THREE.MeshPhysicalMaterial({
      color,
      transparent: true,
      opacity: 0.62,
      roughness: 0.12,
      metalness: 0,
      normalMap: a,
      normalScale: new THREE.Vector2(0.35, 0.35),
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      clearcoatNormalMap: b,
      clearcoatNormalScale: new THREE.Vector2(0.5, 0.5),
      envMapIntensity: 1.4,
      depthWrite: false,
    })
    return { mat, a, b }
  }, [w, d, color])

  useFrame((_, dt) => {
    if (reduceMotion) return
    a.offset.x += dt * 0.012
    a.offset.y += dt * 0.008
    b.offset.x -= dt * 0.02
    b.offset.y += dt * 0.014
  })

  return (
    <mesh position={[(x[0] + x[1]) / 2, y, (z[0] + z[1]) / 2]} rotation={[-Math.PI / 2, 0, 0]} material={mat} renderOrder={2}>
      <planeGeometry args={[w, d]} />
    </mesh>
  )
}
