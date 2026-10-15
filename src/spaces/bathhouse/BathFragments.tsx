import { useMemo } from 'react'
import * as THREE from 'three'
import { Box } from './BathKit'
import { BANDAI } from './zones/DressingZone'

/**
 * 센토의 내러티브 파편(PRD 08·13절). 설명하거나 완결짓지 않는다 — 화면에 띄우는 수집 UI도 없다.
 * text는 기록용 원문.
 */
export const BATH_FRAGMENTS = [
  { id: 'price-board', text: '料金表 — 大人 480円 · 営業 15:00–24:00 · 平成 二十年 改定 (날짜가 오래됐다)' },
  { id: 'closed-sign', text: '本日休業 — 영업 중인데 휴업 팻말이 걸려 있다' },
  { id: 'lost-found', text: '忘れ物 — 10月7日 · 黄色の桶 一つ (노란 바가지 하나)' },
  { id: 'bandai-coins', text: '반다이 양쪽 쟁반에 거스름돈이 그대로 남아 있다 — 남탕 쪽과 여탕 쪽 금액이 다르다' },
  { id: 'clock', text: '탈의실 시계는 2시 47분에 멈춰 있다' },
  { id: 'missing-key', text: '락커 열쇠 하나가 빠져 있다 (locker_bank.py)' },
] as const

function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  draw(c.getContext('2d')!)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

const SERIF = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif'

function Plate({
  position,
  rotationY = 0,
  size,
  map,
}: {
  position: [number, number, number]
  rotationY?: number
  size: [number, number]
  map: THREE.Texture
}) {
  return (
    <mesh position={position} rotation={[0, rotationY, 0]}>
      <boxGeometry args={[size[0], size[1], 0.025]} />
      <meshStandardMaterial attach="material-4" map={map} roughness={0.55} />
      <meshStandardMaterial attach="material-0" color="#3b2a1c" />
      <meshStandardMaterial attach="material-1" color="#3b2a1c" />
      <meshStandardMaterial attach="material-2" color="#3b2a1c" />
      <meshStandardMaterial attach="material-3" color="#3b2a1c" />
      <meshStandardMaterial attach="material-5" color="#3b2a1c" />
    </mesh>
  )
}

/**
 * 반다이 쟁반 위 거스름돈. 쟁반은 모델 로컬 (±0.45, 윗면 1.24, 0.42) — 반다이가 PI 돌아 있어
 * 로컬 -x가 남탕(동), +x가 여탕(서)이다. 두 쟁반의 금액은 일부러 맞지 않는다.
 */
const TRAY_TOP = 1.24
const trayCenter = (localX: number): [number, number] => [BANDAI[0] - localX, BANDAI[2] - 0.42]
const COINS: { at: [number, number]; d: [number, number]; r: number; color: string }[] = [
  // 남탕 쪽: 동전 넷
  ...([[-0.03, -0.02], [0.03, 0.04], [-0.05, 0.06], [0.05, -0.04]] as const).map(([dx, dz], i) => ({
    at: trayCenter(-0.45),
    d: [dx, dz] as [number, number],
    r: 0.012,
    color: i % 2 ? '#b8b4a8' : '#b08850',
  })),
  // 여탕 쪽: 큰 은화 하나와 작은 동전 하나
  { at: trayCenter(0.45), d: [-0.02, 0.01], r: 0.0135, color: '#c9c6bc' },
  { at: trayCenter(0.45), d: [0.05, -0.03], r: 0.01, color: '#d4d6d8' },
]

export function BathFragments() {
  const price = useMemo(
    () =>
      canvasTex(384, 512, (g) => {
        g.fillStyle = '#e9dcc0'
        g.fillRect(0, 0, 384, 512)
        g.strokeStyle = '#5a3a22'
        g.lineWidth = 10
        g.strokeRect(10, 10, 364, 492)
        g.fillStyle = '#2a1a10'
        g.textAlign = 'center'
        g.font = `bold 64px ${SERIF}`
        g.fillText('料 金', 192, 100)
        g.font = `40px ${SERIF}`
        ;['大人　480円', '中人　180円', '小人　 80円'].forEach((t, i) => g.fillText(t, 192, 190 + i * 64))
        g.font = `30px ${SERIF}`
        g.fillText('営業 15:00〜24:00', 192, 410)
        g.font = `22px ${SERIF}`
        g.fillStyle = '#6a5a48'
        g.fillText('平成二十年 改定', 192, 470)
      }),
    [],
  )
  const closed = useMemo(
    () =>
      canvasTex(160, 400, (g) => {
        g.fillStyle = '#c9a676'
        g.fillRect(0, 0, 160, 400)
        g.fillStyle = '#1c120a'
        g.textAlign = 'center'
        g.font = `bold 78px ${SERIF}`
        ;['本', '日', '休', '業'].forEach((t, i) => g.fillText(t, 80, 90 + i * 88))
      }),
    [],
  )
  const note = useMemo(
    () =>
      canvasTex(256, 192, (g) => {
        g.fillStyle = '#f2ecdf'
        g.fillRect(0, 0, 256, 192)
        g.fillStyle = '#2b3550'
        g.font = `30px ${SERIF}`
        g.fillText('忘れ物', 20, 50)
        g.font = `22px ${SERIF}`
        g.fillText('10月7日', 20, 100)
        g.fillText('黄色の桶　一つ', 20, 145)
      }),
    [],
  )
  const clock = useMemo(
    () =>
      canvasTex(256, 256, (g) => {
        g.fillStyle = '#f4efe2'
        g.beginPath()
        g.arc(128, 128, 124, 0, Math.PI * 2)
        g.fill()
        g.fillStyle = '#1a1a1a'
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2
          g.fillRect(128 + Math.sin(a) * 100 - 3, 128 - Math.cos(a) * 100 - 8, 6, 16)
        }
        const hand = (a: number, len: number, w: number) => {
          g.save()
          g.translate(128, 128)
          g.rotate(a)
          g.fillRect(-w / 2, -len, w, len + 10)
          g.restore()
        }
        // 2:47에 멈춤
        hand(((2 + 47 / 60) / 12) * Math.PI * 2, 60, 9)
        hand((47 / 60) * Math.PI * 2, 92, 5)
      }),
    [],
  )

  return (
    <group name="bathhouse-fragments">
      {/* 겐칸: 탈의실 벽의 요금표 — 남탕 노렌 오른쪽 */}
      <Plate position={[-1.2, 1.75, 8.14]} size={[0.6, 0.8]} map={price} />
      {/* 영업 중인데 바깥 유리문 안쪽에 휴업 팻말 */}
      <Plate position={[1.4, 1.5, 19.75]} rotationY={Math.PI} size={[0.2, 0.5]} map={closed} />
      {/* 반다이 옆(남탕 쪽) 분실물 상자와 메모 */}
      <Box position={[-8.6, 0.18, 7.4]} size={[0.5, 0.36, 0.4]} color="#9a7a52" />
      <mesh position={[-8.6, 0.365, 7.4]} rotation={[-Math.PI / 2, 0, 0.2]}>
        <planeGeometry args={[0.24, 0.18]} />
        <meshStandardMaterial map={note} roughness={0.9} />
      </mesh>
      {/* 반다이 쟁반 위 거스름돈 */}
      {COINS.map(({ at, d, r, color }, i) => (
        <mesh key={i} position={[at[0] + d[0], TRAY_TOP + 0.002 + (i % 2) * 0.002, at[1] + d[1]]}>
          <cylinderGeometry args={[r, r, 0.003, 16]} />
          <meshStandardMaterial color={color} metalness={1} roughness={0.35} />
        </mesh>
      ))}
      {/* 탈의실 시계 — 남탕 노렌 위, 2:47에서 멈췄다 */}
      <group position={[-4.1, 2.65, 7.86]} rotation={[0, Math.PI, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.24, 0.24, 0.05, 32]} />
          <meshStandardMaterial color="#5a3a22" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.027]}>
          <circleGeometry args={[0.215, 32]} />
          <meshStandardMaterial map={clock} roughness={0.3} />
        </mesh>
      </group>
    </group>
  )
}
