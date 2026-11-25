import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { GltfVisual } from '../../core/world/GltfAsset'
import { ModelBoundary } from '../../core/world/ModelBoundary'
import { Box, LIGHT, ModelRow, jjimModel } from './JjimKit'
import { HALL, HALL_FIX, ROOMS, WASHERS } from './layout'
import { useActiveChair } from './JjimProps'

/**
 * 혼자 움직이는 것들(PRD 15절) — 안마의자 한 대, 불가마 온도계, 세탁기 한 대, TV 화면조정, 충전함 표시등.
 * 전부 느리고 규칙적이다. 조작할 수 없고 바라보기만 한다. reduceMotion이면 멈춘 채 남는다.
 */

function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  draw(c.getContext('2d')!)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/** 안마의자 열 — 시드로 고른 한 대만 혼자 작동한다(느린 주무름 + 등받이 표시등). */
export function MassageChairs({ reduceMotion }: { reduceMotion: boolean }) {
  const active = useActiveChair(HALL_FIX.massage.z.length)
  const { x, z } = HALL_FIX.massage
  const rest = z.filter((_, i) => i !== active).map((cz) => ({ position: [x, 0, cz] as [number, number, number], rotationY: Math.PI / 2 }))
  const group = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (!group.current || reduceMotion) return
    const t = clock.elapsedTime
    // 롤러가 오르내리는 4초 주기 — 몸체가 아주 조금 들썩인다
    group.current.position.y = Math.sin(t * Math.PI * 0.5) * 0.004 + Math.sin(t * 23) * 0.0008
    group.current.rotation.z = Math.sin(t * Math.PI * 0.5 + 1) * 0.006
  })
  return (
    <>
      <ModelRow name="massage_chair" items={rest} />
      <Box position={[x, 0.6, z[active]!]} size={[1.1, 1.2, 0.8]} visible={false} />
      <group position={[x, 0, z[active]!]} rotation={[0, Math.PI / 2, 0]}>
        <group ref={group}>
          <ModelBoundary label="massage_chair">
            <GltfVisual url={jjimModel('massage_chair')} />
          </ModelBoundary>
        </group>
        {/* 리모컨 표시등 — 켜져 있는 한 대 */}
        <mesh position={[0.41, 0.66, 0.262]}>
          <boxGeometry args={[0.02, 0.012, 0.004]} />
          <meshStandardMaterial color="#0c2a12" emissive="#49ff7a" emissiveIntensity={2.5} />
        </mesh>
      </group>
    </>
  )
}

/** 세탁기 열 — 한 대만 돌고 있다. 유리 뒤에서 빨랫감이 천천히 돈다. */
export function Washers({ reduceMotion }: { reduceMotion: boolean }) {
  const drum = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (drum.current && !reduceMotion) drum.current.rotation.z -= dt * 1.6
  })
  const items = WASHERS.z.map((z) => ({ position: [WASHERS.x, 0, z] as [number, number, number], rotationY: -Math.PI / 2 }))
  return (
    <>
      <ModelRow name="washer" items={items} />
      {/* 문 유리(washer.py: 높이 0.46, 앞면 +0.44) 바로 앞 — 서쪽을 본다 */}
      <group position={[WASHERS.x - 0.447, 0.46, WASHERS.z[WASHERS.running]!]} rotation={[0, -Math.PI / 2, 0]}>
        <group ref={drum}>
          <mesh position={[0.07, 0.04, 0]}>
            <circleGeometry args={[0.12, 12]} />
            <meshStandardMaterial color="#e08a3c" roughness={0.9} />
          </mesh>
          <mesh position={[-0.08, -0.06, 0]}>
            <circleGeometry args={[0.09, 12]} />
            <meshStandardMaterial color="#e6a3b0" roughness={0.9} />
          </mesh>
        </group>
        {/* 남은 시간 표시 — 줄지 않는다 */}
        <mesh position={[-0.25, 0.44, 0.003]}>
          <planeGeometry args={[0.12, 0.05]} />
          <meshStandardMaterial color="#061a0c" emissive="#58ff9a" emissiveIntensity={1.6} />
        </mesh>
      </group>
    </>
  )
}

/** 불가마 온도계 — 문 옆 안벽. 바늘이 아주 천천히 오르내린다(방은 뜨거워지지 않는다). */
export function KilnGauge({ reduceMotion }: { reduceMotion: boolean }) {
  const needle = useRef<THREE.Mesh>(null)
  const face = useMemo(
    () =>
      canvasTex(256, 256, (g) => {
        g.fillStyle = '#efe6d2'
        g.beginPath()
        g.arc(128, 128, 124, 0, Math.PI * 2)
        g.fill()
        g.strokeStyle = '#2a1a10'
        g.lineWidth = 3
        // 눈금: 아래 210°를 쓴다. 오른쪽 끝 구간만 붉다
        for (let i = 0; i <= 14; i++) {
          const a = Math.PI * (0.92 + (1.16 * i) / 14)
          const r0 = i % 2 ? 98 : 90
          g.strokeStyle = i >= 11 ? '#b02a18' : '#2a1a10'
          g.beginPath()
          g.moveTo(128 + Math.cos(a) * r0, 128 + Math.sin(a) * r0)
          g.lineTo(128 + Math.cos(a) * 110, 128 + Math.sin(a) * 110)
          g.stroke()
        }
        g.fillStyle = '#2a1a10'
        g.font = 'bold 26px sans-serif'
        g.textAlign = 'center'
        g.fillText('℃', 128, 190)
      }),
    [],
  )
  useFrame(({ clock }) => {
    if (!needle.current) return
    const t = reduceMotion ? 0 : clock.elapsedTime
    // 46초 주기로 붉은 구간 문턱까지 올랐다가 내려온다
    needle.current.rotation.z = -0.9 - 0.55 * Math.sin((t / 46) * Math.PI * 2)
  })
  const k = ROOMS.kiln
  return (
    <group position={[k.x[0] + 0.14, 1.55, k.door[1] + 1.1]} rotation={[0, Math.PI / 2, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.17, 0.17, 0.03, 24]} />
        <meshStandardMaterial color="#3a2a1c" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.017]}>
        <circleGeometry args={[0.15, 24]} />
        <meshStandardMaterial map={face} roughness={0.5} />
      </mesh>
      <mesh ref={needle} position={[0, 0, 0.022]}>
        <planeGeometry args={[0.012, 0.24]} />
        <meshStandardMaterial color="#b02a18" />
      </mesh>
    </group>
  )
}

/** TV 벽 — 화면조정 무늬를 무음으로 띄운다. 가까이 가야 잡음이 들린다(오디오). */
export function TvWall() {
  const bars = useMemo(
    () =>
      canvasTex(256, 144, (g) => {
        const cols = ['#c8c8c8', '#c8c832', '#32c8c8', '#32c832', '#c832c8', '#c83232', '#3232c8']
        cols.forEach((c, i) => {
          g.fillStyle = c
          g.fillRect((i * 256) / 7, 0, 256 / 7 + 1, 104)
        })
        const low = ['#3232c8', '#111', '#c832c8', '#111', '#32c8c8', '#111', '#c8c8c8']
        low.forEach((c, i) => {
          g.fillStyle = c
          g.fillRect((i * 256) / 7, 104, 256 / 7 + 1, 14)
        })
        g.fillStyle = '#0a0a0a'
        g.fillRect(0, 118, 256, 26)
        g.fillStyle = '#f0f0f0'
        g.fillRect(48, 118, 40, 26)
      }),
    [],
  )
  const z = HALL.z[0] + 0.125
  return (
    <>
      {HALL_FIX.tvX.map((x) => (
        <group key={x} position={[x, HALL_FIX.tvY, z]}>
          <Box position={[0, 0, 0.04]} size={[2.3, 1.38, 0.08]} color="#121212" roughness={0.4} solid={false} />
          <mesh position={[0, 0, 0.082]}>
            <planeGeometry args={[2.16, 1.24]} />
            <meshStandardMaterial color="#000" emissive="#ffffff" emissiveMap={bars} emissiveIntensity={0.75} roughness={0.2} />
          </mesh>
        </group>
      ))}
      {/* 세 화면이 바닥에 깔아 놓는 푸르스름한 빛 */}
      <pointLight position={[0, HALL_FIX.tvY, z + 1.5]} color={LIGHT.tv} intensity={5} distance={12} decay={1.6} />
    </>
  )
}

/** 충전함 표시등 — 문마다 작은 등이 제각기 느리게 깜빡인다. 안은 보이지 않는다. */
export function ChargingLeds({ reduceMotion }: { reduceMotion: boolean }) {
  const [cx, cz] = HALL_FIX.charging
  const mats = useMemo(
    () => [0, 1, 2].map(() => new THREE.MeshStandardMaterial({ color: '#1a0606', emissive: '#ff3b30', emissiveIntensity: 2 })),
    [],
  )
  useFrame(({ clock }) => {
    if (reduceMotion) return
    const t = clock.elapsedTime
    mats.forEach((m, i) => (m.emissiveIntensity = (t * (0.45 + i * 0.13) + i * 0.37) % 1 < 0.5 ? 2.2 : 0.15))
  })
  // charging_locker.py: 4 x 6 문, 폭 1.4 · 높이 1.6 · 깊이 0.45 — 서쪽(-x)을 본다
  const leds = useMemo(() => {
    const out: { y: number; dz: number; m: number }[] = []
    for (let r = 0; r < 6; r++) for (let c = 0; c < 4; c++) if ((r * 7 + c * 3) % 5 !== 0) out.push({ y: 0.12 + (r + 0.78) * (1.4 / 6), dz: -0.66 + (c + 0.5) * 0.33, m: (r + c) % 3 })
    return out
  }, [])
  return (
    <group position={[cx - 0.232, 0, cz]}>
      {leds.map((l, i) => (
        <mesh key={i} position={[0, l.y, l.dz]} material={mats[l.m]}>
          <boxGeometry args={[0.004, 0.012, 0.012]} />
        </mesh>
      ))}
    </group>
  )
}
