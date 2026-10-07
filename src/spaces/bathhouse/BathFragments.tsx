import { useMemo } from 'react'
import * as THREE from 'three'
import { Box } from './BathKit'

/**
 * 센토의 내러티브 파편(PRD 08·13절). 설명하거나 완결짓지 않는다 — 화면에 띄우는 수집 UI도 없다.
 * text는 기록용 원문.
 */
export const BATH_FRAGMENTS = [
  { id: 'price-board', text: '料金表 — 大人 480円 · 営業 15:00–24:00 · 平成 二十年 改定 (날짜가 오래됐다)' },
  { id: 'closed-sign', text: '本日休業 — 영업 중인데 휴업 팻말이 걸려 있다' },
  { id: 'lost-found', text: '忘れ物 — 10月7日 · 黄色の桶 一つ (노란 바가지 하나)' },
  { id: 'bandai-coins', text: '반다이 쟁반에 거스름돈이 그대로 남아 있다' },
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
      {/* 겐칸: 탈의실 벽의 요금표 */}
      <Plate position={[-3.6, 1.75, 8.14]} size={[0.6, 0.8]} map={price} />
      {/* 영업 중인데 바깥 유리문 안쪽에 휴업 팻말 */}
      <Plate position={[1.4, 1.5, 19.75]} rotationY={Math.PI} size={[0.2, 0.5]} map={closed} />
      {/* 반다이 옆 분실물 상자와 메모 */}
      <Box position={[4.9, 0.18, 4.7]} size={[0.5, 0.36, 0.4]} color="#9a7a52" />
      <mesh position={[4.9, 0.365, 4.7]} rotation={[-Math.PI / 2, 0, 0.2]}>
        <planeGeometry args={[0.24, 0.18]} />
        <meshStandardMaterial map={note} roughness={0.9} />
      </mesh>
      {/* 반다이 쟁반 위 거스름돈 */}
      {[
        [2.72, 6.78],
        [2.78, 6.84],
        [2.7, 6.86],
        [2.8, 6.76],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 1.248 + i * 0.002, z]}>
          <cylinderGeometry args={[0.012, 0.012, 0.003, 16]} />
          <meshStandardMaterial color={i % 2 ? '#b8b4a8' : '#b08850'} metalness={1} roughness={0.35} />
        </mesh>
      ))}
      {/* 탈의실 시계 — 2:47에서 멈췄다 */}
      <group position={[-5, 2.65, 7.86]} rotation={[0, Math.PI, 0]}>
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
