import { useMemo } from 'react'
import * as THREE from 'three'
import { Box, Ceiling, Floor, PALETTE, Wall, WarmLamp, tileTexture } from '../BathKit'

const H = 6
/** 대욕조: 걸어 들어가는 얕은 탕 (바닥 -0.6, 수면 -0.12). */
const TUB = { x: [-10, 4] as [number, number], z: [-34, -27] as [number, number], bottom: -0.6, water: -0.12 }
/** 경사 1:4 */
const RAMP_ANGLE = Math.atan2(0.8, 3.2)
/** 열탕: 테두리가 높아 들어가지 않는다. */
const HOT = { x: [6, 11] as [number, number], z: [-34, -29] as [number, number], rim: 0.55 }

/** 후지산 벽화 자리표시 — 2단계에서 타일 벽화 모델로 교체. */
function muralTexture() {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 256
  const g = c.getContext('2d')!
  const sky = g.createLinearGradient(0, 0, 0, 256)
  sky.addColorStop(0, '#5f9cc4')
  sky.addColorStop(1, '#cfe3ea')
  g.fillStyle = sky
  g.fillRect(0, 0, 512, 256)
  g.fillStyle = '#3d5f86'
  g.beginPath()
  g.moveTo(80, 230)
  g.lineTo(256, 50)
  g.lineTo(432, 230)
  g.fill()
  g.fillStyle = '#f4f6f7'
  g.beginPath()
  g.moveTo(205, 102)
  g.lineTo(256, 50)
  g.lineTo(307, 102)
  g.lineTo(280, 92)
  g.lineTo(256, 108)
  g.lineTo(232, 92)
  g.fill()
  g.fillStyle = '#4e7c5a'
  g.fillRect(0, 222, 512, 34)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function Water({
  x,
  z,
  y,
}: {
  x: [number, number]
  z: [number, number]
  y: number
}) {
  return (
    <mesh position={[(x[0] + x[1]) / 2, y, (z[0] + z[1]) / 2]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[x[1] - x[0], z[1] - z[0]]} />
      <meshStandardMaterial
        color="#5fa6a8"
        transparent
        opacity={0.55}
        roughness={0.05}
        metalness={0.1}
        depthWrite={false}
      />
    </mesh>
  )
}

/**
 * 욕실 — 원작의 먹거리 골목. 천장이 높고 넓으며 물리 오브젝트가 모이는 곳.
 * x[-14,14] · z[-36,-10]
 */
export function BathHallZone() {
  const floor = useMemo(() => tileTexture(PALETTE.tileWhite, '#9aa3a0', 8, [7, 7]), [])
  const wall = useMemo(() => tileTexture(PALETTE.tileBlue, '#e8ecea', 10, [6, 2]), [])
  const tubTile = useMemo(() => tileTexture(PALETTE.tileGreen, '#d9e2dc', 8, [3, 1]), [])
  const mural = useMemo(() => muralTexture(), [])

  return (
    <group name="bathhouse-hall">
      {/* 대욕조 구멍을 남기고 바닥을 네 조각으로 */}
      <Floor x={[-14, 14]} z={[-27, -10]} map={floor} color="#ffffff" />
      <Floor x={[-14, 14]} z={[-36, -34]} map={floor} color="#ffffff" />
      <Floor x={[-14, TUB.x[0]]} z={TUB.z} map={floor} color="#ffffff" />
      <Floor x={[TUB.x[1], 14]} z={TUB.z} map={floor} color="#ffffff" />
      <Ceiling x={[-14, 14]} z={[-36, -10]} height={H} color="#cfd6d4" />

      {/* 대욕조: 바닥, 안쪽 벽, 들어가는 계단 */}
      <Floor x={TUB.x} z={TUB.z} top={TUB.bottom} map={tubTile} color="#ffffff" />
      {(
        [
          [[(TUB.x[0] + TUB.x[1]) / 2, TUB.z[1]], [TUB.x[1] - TUB.x[0], 0.1]],
          [[(TUB.x[0] + TUB.x[1]) / 2, TUB.z[0]], [TUB.x[1] - TUB.x[0], 0.1]],
          [[TUB.x[0], (TUB.z[0] + TUB.z[1]) / 2], [0.1, TUB.z[1] - TUB.z[0]]],
          [[TUB.x[1], (TUB.z[0] + TUB.z[1]) / 2], [0.1, TUB.z[1] - TUB.z[0]]],
        ] as const
      ).map(([[cx, cz], [w, d]]) => (
        <Box
          key={`${cx}:${cz}`}
          position={[cx, TUB.bottom / 2, cz]}
          size={[w, -TUB.bottom, d]}
          color={PALETTE.tileGreen}
        />
      ))}
      {/* 들어가는 경사로 — 플레이어 발 콜라이더는 계단을 못 오르므로 경사로 처리 */}
      {/* 윗면이 욕조 가장자리(y=0)에서 시작해 탕 바닥 아래로 묻히도록 길게 — 끝단 턱에 발이 걸리지 않게 */}
      <Box
        position={[-1, -0.4 - 0.1 * Math.cos(RAMP_ANGLE), TUB.z[1] - 1.6]}
        size={[2.4, 0.2, Math.hypot(3.2, 0.8)]}
        rotation={[-RAMP_ANGLE, 0, 0]}
        color={PALETTE.tileGreen}
      />
      <Water x={TUB.x} z={TUB.z} y={TUB.water} />

      {/* 열탕 — 높은 테두리 */}
      <Box position={[(HOT.x[0] + HOT.x[1]) / 2, HOT.rim / 2, HOT.z[1]]} size={[HOT.x[1] - HOT.x[0], HOT.rim, 0.25]} color={PALETTE.tileGreen} />
      <Box position={[HOT.x[0], HOT.rim / 2, (HOT.z[0] + HOT.z[1]) / 2]} size={[0.25, HOT.rim, HOT.z[1] - HOT.z[0]]} color={PALETTE.tileGreen} />
      <Box position={[HOT.x[1], HOT.rim / 2, (HOT.z[0] + HOT.z[1]) / 2]} size={[0.25, HOT.rim, HOT.z[1] - HOT.z[0]]} color={PALETTE.tileGreen} />
      <Water x={HOT.x} z={HOT.z} y={HOT.rim - 0.08} />

      {/* 좌식 샤워 열 — 서쪽 벽면과 가운데 섬 */}
      {[-24, -21, -18, -15, -12].map((z) => (
        <group key={`w${z}`}>
          <Box position={[-13.6, 0.55, z]} size={[0.5, 1.1, 2.6]} color={PALETTE.tileWhite} />
          <Box position={[-13.25, 0.95, z]} size={[0.18, 0.5, 0.36]} color="#cfd4d6" solid={false} />
        </group>
      ))}
      <Box position={[7, 0.6, -18]} size={[0.6, 1.2, 9]} color={PALETTE.tileWhite} />

      {/* 벽: 서쪽, 동쪽(보일러실 문), 북쪽(벽화) */}
      <Wall axis="z" at={-14} from={-36} to={-10} height={H} map={wall} color="#ffffff" />
      <Wall axis="z" at={14} from={-36} to={-10} height={H} gaps={[[-30, -27.5]]} map={wall} color="#ffffff" />
      <Wall axis="x" at={-36} from={-14} to={14} height={H} map={wall} color="#ffffff" />
      <mesh position={[0, 3.6, -35.86]}>
        <planeGeometry args={[18, 4.4]} />
        <meshStandardMaterial map={mural} roughness={0.4} />
      </mesh>

      <WarmLamp position={[-6, H - 0.5, -16]} intensity={7} distance={14} />
      <WarmLamp position={[6, H - 0.5, -16]} intensity={7} distance={14} />
      <WarmLamp position={[-4, H - 0.5, -30]} intensity={8} distance={14} />
      <WarmLamp position={[8, H - 0.5, -31]} intensity={6} distance={12} />
    </group>
  )
}
