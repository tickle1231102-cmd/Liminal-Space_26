import { useMemo } from 'react'
import * as THREE from 'three'
import { useAnomalyStreak } from '../../core/anomaly/store'

const KANJI = ['〇', '一', '二', '三', '四', '五', '六', '七', '八']
const SERIF = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif'

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

function arrow(g: CanvasRenderingContext2D, x: number, y: number, up: boolean) {
  g.save()
  g.translate(x, y)
  if (!up) g.rotate(Math.PI)
  g.beginPath()
  g.moveTo(0, -34)
  g.lineTo(26, 0)
  g.lineTo(10, 0)
  g.lineTo(10, 34)
  g.lineTo(-10, 34)
  g.lineTo(-10, 0)
  g.lineTo(-26, 0)
  g.closePath()
  g.fill()
  g.restore()
}

/**
 * 이변 찾기 모드(PRD 14절)에서만 겐칸에 걸리는 두 가지 — 평소 배회에서는 없다.
 * - 나무 열쇠패: 연속으로 맞힌 횟수(〇~八). HUD가 아니라 공간 안 사물로만 보여 준다.
 * - 그림 안내판: 같은 모습이면 앞으로(↑), 달라졌으면 돌아간다(↓). 글자 없이 그림으로만.
 */
export function BathAnomalySigns() {
  const streak = useAnomalyStreak()
  const tag = useMemo(
    () =>
      streak === null
        ? null
        : canvasTex(128, 256, (g) => {
            g.fillStyle = '#b98a52'
            g.fillRect(0, 0, 128, 256)
            g.fillStyle = '#8a6238'
            for (let y = 12; y < 256; y += 23) g.fillRect(0, y, 128, 1)
            g.fillStyle = '#2a1a10'
            g.beginPath()
            g.arc(64, 30, 9, 0, Math.PI * 2)
            g.fill()
            g.textAlign = 'center'
            g.font = `bold 110px ${SERIF}`
            g.fillText(KANJI[Math.min(streak, KANJI.length - 1)]!, 64, 190)
          }),
    [streak],
  )
  const rule = useMemo(
    () =>
      canvasTex(256, 320, (g) => {
        g.fillStyle = '#e9dcc0'
        g.fillRect(0, 0, 256, 320)
        g.strokeStyle = '#5a3a22'
        g.lineWidth = 8
        g.strokeRect(8, 8, 240, 304)
        g.beginPath()
        g.moveTo(24, 160)
        g.lineTo(232, 160)
        g.lineWidth = 2
        g.stroke()
        // 윗칸: 노렌 그대로 → 앞으로
        const noren = (y: number, odd: boolean) => {
          g.fillStyle = '#5a3a22'
          g.fillRect(36, y - 34, 84, 6)
          g.fillStyle = '#28446e'
          ;[0, 1, 2].forEach((i) => g.fillRect(38 + i * 28, y - 28, 24, odd && i === 1 ? 34 : 56))
          if (odd) {
            g.fillStyle = '#b02a18'
            g.fillRect(66, y + 12, 24, 16)
          }
        }
        noren(84, false)
        noren(244, true)
        g.fillStyle = '#2a1a10'
        arrow(g, 182, 84, true)
        g.fillStyle = '#b02a18'
        arrow(g, 182, 244, false)
      }),
    [],
  )
  if (streak === null || !tag) return null
  return (
    <group name="bathhouse-anomaly-signs">
      {/* 탈의실 벽(z=8), 요금표 오른쪽 — 출발점에서 정면으로 보인다 */}
      <mesh position={[0.15, 1.65, 8.14]}>
        <boxGeometry args={[0.26, 0.52, 0.02]} />
        <meshStandardMaterial attach="material-4" map={tag} roughness={0.6} />
        {[0, 1, 2, 3, 5].map((i) => (
          <meshStandardMaterial key={i} attach={`material-${i}`} color="#8a6238" />
        ))}
      </mesh>
      <mesh position={[1.5, 1.65, 8.14]}>
        <boxGeometry args={[0.52, 0.65, 0.02]} />
        <meshStandardMaterial attach="material-4" map={rule} roughness={0.6} />
        {[0, 1, 2, 3, 5].map((i) => (
          <meshStandardMaterial key={i} attach={`material-${i}`} color="#3b2a1c" />
        ))}
      </mesh>
    </group>
  )
}
