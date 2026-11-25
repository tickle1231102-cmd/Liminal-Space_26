import { useMemo } from 'react'
import * as THREE from 'three'
import { GltfVisual } from '../../core/world/GltfAsset'
import { ModelBoundary } from '../../core/world/ModelBoundary'
import { jjimModel } from './JjimKit'
import { useLitCave } from './JjimProps'
import { CAVES, DOORS, ENTRANCE, HALL, HALL_FIX, ROOMS, SLEEP } from './layout'

/**
 * 찜질방의 내러티브 파편(PRD 08·15절). 설명하거나 완결짓지 않는다 — 화면에 띄우는 수집 UI도 없다.
 * 글자는 숫자와 짧은 표지뿐. text는 기록용 원문.
 */
export const JJIM_FRAGMENTS = [
  { id: 'price-board', text: '요금표 — 주간 05:00~20:00 9,000 · 야간 22:00~05:00 11,000 (20시와 22시 사이가 비어 있다) · 2월 30일 개정' },
  { id: 'ledger', text: '카운터 장부 — 입장 칸에는 숫자가 쌓여 있고 퇴장 칸은 전부 비어 있다' },
  { id: 'lost-bracelet', text: '분실물 상자의 열쇠 팔찌 417번 — 신발장은 280번까지뿐이다' },
  { id: 'clocks', text: '시계 넷이 전부 다른 시각이다 — 골목 4:02 · 황토방 1:35 · 홀 9:50 · 수면실 4:47' },
  { id: 'tab-note', text: '매점 외상 메모 — 식혜 개수만 바를 정 자로 빼곡하다' },
  { id: 'comic', text: '서가 앞에 만화책 한 권이 펼친 채 엎어져 있다 — 서가에는 한 권 자리가 비었다' },
  { id: 'quiet-sign', text: '정숙 팻말 — 수면실 문 옆에 하나, 등이 켜진 토굴 앞에 하나 더' },
  { id: 'yangmeori', text: '양머리 수건 하나가 매트 위에 가지런히 놓여 있다' },
] as const

const SANS = '"Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif'
const FRAME = '#3b2a1c'

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

type Vec3 = [number, number, number]

/** 벽에 거는 판 — rotationY 0이면 +z를 본다. */
function Plate({ position, rotationY = 0, size, map, depth = 0.025 }: { position: Vec3; rotationY?: number; size: [number, number]; map: THREE.Texture; depth?: number }) {
  return (
    <mesh position={position} rotation={[0, rotationY, 0]}>
      <boxGeometry args={[size[0], size[1], depth]} />
      <meshStandardMaterial attach="material-4" map={map} roughness={0.6} />
      {[0, 1, 2, 3, 5].map((i) => (
        <meshStandardMaterial key={i} attach={`material-${i}`} color={FRAME} />
      ))}
    </mesh>
  )
}

/** 평평하게 놓인 종이 — facing은 읽는 사람이 바라보는 방향의 yaw(0 = -z를 보며 읽는다). */
function Sheet({ position, facing = 0, size, map }: { position: Vec3; facing?: number; size: [number, number]; map: THREE.Texture }) {
  return (
    <group position={position} rotation={[0, facing, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={size} />
        <meshStandardMaterial map={map} roughness={0.85} />
      </mesh>
    </group>
  )
}

function clockFace(hour: number, minute: number) {
  return canvasTex(256, 256, (g) => {
    g.fillStyle = FRAME
    g.fillRect(0, 0, 256, 256)
    g.fillStyle = '#f4efe2'
    g.beginPath()
    g.arc(128, 128, 120, 0, Math.PI * 2)
    g.fill()
    g.fillStyle = '#1a1a1a'
    for (let i = 0; i < 12; i++) {
      g.save()
      g.translate(128, 128)
      g.rotate((i / 12) * Math.PI * 2)
      g.fillRect(-3, -108, 6, i % 3 ? 12 : 22)
      g.restore()
    }
    const hand = (turn: number, len: number, w: number) => {
      g.save()
      g.translate(128, 128)
      g.rotate(turn * Math.PI * 2)
      g.fillRect(-w / 2, -len, w, len + 12)
      g.restore()
    }
    hand(((hour % 12) + minute / 60) / 12, 58, 8)
    hand(minute / 60, 92, 5)
    g.beginPath()
    g.arc(128, 128, 7, 0, Math.PI * 2)
    g.fill()
  })
}

/** 바를 정(正) 한 글자 = 다섯 획. n획까지만 긋는다 */
function tally(g: CanvasRenderingContext2D, x: number, y: number, s: number, n: number) {
  const strokes: [number, number, number, number][] = [
    [0, 0, 1, 0],
    [0.5, 0, 0.5, 1],
    [0.5, 0.5, 0.95, 0.5],
    [0.12, 0.45, 0.12, 1],
    [0, 1, 1, 1],
  ]
  g.beginPath()
  strokes.slice(0, n).forEach(([a, b, c, d]) => {
    g.moveTo(x + a * s, y + b * s)
    g.lineTo(x + c * s, y + d * s)
  })
  g.stroke()
}

/** 시계 넷 — 방마다 다른 시각에 서 있다 */
const CLOCKS: { at: Vec3; rotationY: number; time: [number, number] }[] = [
  { at: [0, 2.85, HALL.z[1] + 0.14], rotationY: 0, time: [4, 2] }, // 골목 북벽, 홀 문 위
  { at: [ROOMS.clay.x[0] + 0.14, 1.85, -5], rotationY: Math.PI / 2, time: [1, 35] }, // 황토방 서벽
  { at: [HALL.x[1] - 0.14, 3.2, -24], rotationY: -Math.PI / 2, time: [9, 50] }, // 홀 동벽
  { at: [24, 1.95, SLEEP.z[1] - 0.14], rotationY: Math.PI, time: [4, 47] }, // 수면실 남벽
]

export function JjimFragments() {
  const lit = useLitCave(CAVES.northX.length, CAVES.eastZ.length)

  const price = useMemo(
    () =>
      canvasTex(384, 512, (g) => {
        g.fillStyle = '#efe7d2'
        g.fillRect(0, 0, 384, 512)
        g.fillStyle = '#7a2b1c'
        g.fillRect(0, 0, 384, 96)
        g.fillStyle = '#f4ecd8'
        g.textAlign = 'center'
        g.font = `bold 54px ${SANS}`
        g.fillText('요 금 표', 192, 68)
        g.fillStyle = '#2a1a10'
        g.textAlign = 'left'
        g.font = `bold 34px ${SANS}`
        g.fillText('주간', 36, 180)
        g.fillText('야간', 36, 300)
        g.font = `26px ${SANS}`
        g.fillText('05:00 ~ 20:00', 36, 220)
        g.fillText('22:00 ~ 05:00', 36, 340)
        g.textAlign = 'right'
        g.font = `bold 40px ${SANS}`
        g.fillText('9,000', 350, 200)
        g.fillText('11,000', 350, 320)
        g.strokeStyle = '#8a7a66'
        g.lineWidth = 2
        g.beginPath()
        g.moveTo(30, 250)
        g.lineTo(354, 250)
        g.moveTo(30, 380)
        g.lineTo(354, 380)
        g.stroke()
        g.textAlign = 'center'
        g.fillStyle = '#6a5a48'
        g.font = `22px ${SANS}`
        g.fillText('24시간 연중무휴', 192, 430)
        g.fillText('2월 30일 개정', 192, 470)
      }),
    [],
  )

  const ledger = useMemo(
    () =>
      canvasTex(256, 192, (g) => {
        g.fillStyle = '#ece6d4'
        g.fillRect(0, 0, 256, 192)
        g.strokeStyle = '#8c98b4'
        g.lineWidth = 1
        for (let y = 44; y < 192; y += 21) {
          g.beginPath()
          g.moveTo(8, y)
          g.lineTo(248, y)
          g.stroke()
        }
        g.beginPath()
        g.moveTo(128, 10)
        g.lineTo(128, 186)
        g.stroke()
        g.fillStyle = '#1e2740'
        g.font = `bold 20px ${SANS}`
        g.textAlign = 'center'
        g.fillText('입장', 68, 34)
        g.fillText('퇴장', 190, 34)
        g.font = `17px ${SANS}`
        ;['21:40  2', '22:15  4', '23:02  1', '23:50  3', '00:31  2', '01:18  5', '02:44  1'].forEach((t, i) => g.fillText(t, 68, 60 + i * 21))
      }),
    [],
  )

  const tag = useMemo(
    () =>
      canvasTex(128, 64, (g) => {
        g.fillStyle = '#e8a23a'
        g.fillRect(0, 0, 128, 64)
        g.fillStyle = '#1c120a'
        g.font = 'bold 46px sans-serif'
        g.textAlign = 'center'
        g.fillText('417', 64, 49)
      }),
    [],
  )

  const tab = useMemo(
    () =>
      canvasTex(192, 256, (g) => {
        g.fillStyle = '#f3efcf'
        g.fillRect(0, 0, 192, 256)
        g.fillStyle = '#26324a'
        g.font = `bold 24px ${SANS}`
        g.fillText('식혜', 16, 36)
        g.strokeStyle = '#26324a'
        g.lineWidth = 3
        g.lineCap = 'round'
        // 다섯 줄 가득, 마지막 글자만 세 획에서 멈췄다
        for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) tally(g, 18 + c * 42, 56 + r * 38, 26, r === 4 && c === 3 ? 3 : 5)
      }),
    [],
  )

  const quiet = useMemo(
    () =>
      canvasTex(192, 96, (g) => {
        g.fillStyle = '#e9e2cf'
        g.fillRect(0, 0, 192, 96)
        g.strokeStyle = '#2a1a10'
        g.lineWidth = 5
        g.strokeRect(5, 5, 182, 86)
        g.fillStyle = '#2a1a10'
        g.font = `bold 54px ${SANS}`
        g.textAlign = 'center'
        g.fillText('정 숙', 96, 68)
      }),
    [],
  )

  const clocks = useMemo(() => CLOCKS.map((c) => clockFace(c.time[0], c.time[1])), [])

  // 등이 켜진 굴 앞의 두 번째 팻말 — 왼쪽 기둥, 굴 입구 높이
  const signY = CAVES.floors[lit.tier]! + 0.72
  const litSign: { at: Vec3; rotationY: number } =
    lit.bank === 'north'
      ? { at: [CAVES.northX[lit.index]! - 0.87, signY, CAVES.northFront + 0.015], rotationY: 0 }
      : { at: [CAVES.eastFront - 0.015, signY, CAVES.eastZ[lit.index]! + 0.87], rotationY: -Math.PI / 2 }

  const counterX = ENTRANCE.x[1] - 1.6
  const [matX, matZ] = HALL_FIX.towelMat
  const matRot = 0.4

  return (
    <group name="jjimjilbang-fragments">
      {/* 요금표 — 엘리베이터에서 내려 왼쪽 벽 */}
      <Plate position={[ENTRANCE.x[0] + 0.14, 1.6, 22.6]} rotationY={Math.PI / 2} size={[0.75, 1.0]} map={price} />

      {/* 카운터 장부 — counter.py의 장부 위. 손님 쪽(서쪽)에서 동쪽을 보며 읽는다 */}
      <Sheet position={[counterX + 0.05, 1.127, 19.3]} facing={-Math.PI / 2} size={[0.2, 0.27]} map={ledger} />

      {/* 분실물 상자와 열쇠 팔찌 — 카운터 북쪽 끝 */}
      <group position={[counterX, 1.1, 16.78]}>
        <mesh position={[0, 0.03, 0]}>
          <boxGeometry args={[0.3, 0.06, 0.22]} />
          <meshStandardMaterial color="#8c6b47" roughness={0.8} />
        </mesh>
        <mesh position={[0.04, 0.067, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.032, 0.006, 6, 16]} />
          <meshStandardMaterial color="#1f4d80" roughness={0.6} />
        </mesh>
        <Sheet position={[-0.06, 0.062, -0.02]} facing={-Math.PI / 2 + 0.3} size={[0.07, 0.035]} map={tag} />
      </group>

      {/* 방마다 다른 시계 */}
      {CLOCKS.map((c, i) => (
        <Plate key={i} position={c.at} rotationY={c.rotationY} size={[0.42, 0.42]} map={clocks[i]!} depth={0.04} />
      ))}

      {/* 매점 외상 메모 — 카운터 위, 손님 쪽(남쪽)에서 읽는다 */}
      <Sheet position={[HALL_FIX.snackBar[0] + 1.6, 1.103, HALL_FIX.snackBar[1] + 0.2]} facing={0.15} size={[0.15, 0.2]} map={tab} />

      {/* 엎어진 만화책 — 서가 앞 바닥에 ∧ 모양으로 */}
      <group position={[HALL_FIX.comicShelf[0] - 1.1, 0, HALL_FIX.comicShelf[1] - 1.1]} rotation={[0, 0.5, 0]}>
        {([-1, 1] as const).map((s) => (
          <mesh key={s} position={[s * 0.062, 0.045, 0]} rotation={[0, 0, s * -0.62]}>
            <boxGeometry args={[0.15, 0.012, 0.2]} />
            <meshStandardMaterial color={s < 0 ? '#b32a24' : '#b9342c'} roughness={0.7} />
          </mesh>
        ))}
      </group>

      {/* 정숙 팻말 — 수면실 문 옆(홀 쪽)과, 등이 켜진 굴 앞에 하나 더 */}
      <Plate position={[HALL.x[1] - 0.14, 1.7, DOORS.hallToSleep[1] + 0.55]} rotationY={-Math.PI / 2} size={[0.44, 0.22]} map={quiet} />
      <Plate position={litSign.at} rotationY={litSign.rotationY} size={[0.2, 0.1]} map={quiet} depth={0.012} />

      {/* 양머리 수건 — 늘 같은 자리의 매트 위에 가지런히 */}
      <group position={[matX, 0, matZ]} rotation={[0, matRot, 0]}>
        <group position={[0, 0.03, 0]}>
          <ModelBoundary label="mat">
            <GltfVisual url={jjimModel('mat')} />
          </ModelBoundary>
        </group>
        <group position={[0, 0.115, 0.55]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.06, 0.16, 4, 10]} />
            <meshStandardMaterial color="#f1ede2" roughness={0.95} />
          </mesh>
          {([-1, 1] as const).map((s) => (
            <mesh key={s} position={[s * 0.15, 0.01, 0]}>
              <sphereGeometry args={[0.055, 10, 8]} />
              <meshStandardMaterial color="#f1ede2" roughness={0.95} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  )
}
