import { Suspense, useMemo, type ReactNode } from 'react'
import type * as THREE from 'three'
import {
  CEILING_H,
  CeilingSlab,
  Doorway,
  FloorSlab,
  Fluorescent,
  Slab,
  WallPanel,
} from './SchoolKit'
import { GltfAsset, schoolModel } from '../GltfAsset'
import { chalkboardTexture, linoleumMap, noticeTexture } from './schoolTextures'
import { useSchoolLights } from './SchoolProps'

/** 복도에서 교실로 분기되는 지점 — 좌(-1) / 우(+1). */
const CLASSROOM_DOORS: Array<{ z: number; side: -1 | 1 }> = [
  { z: -2, side: -1 },
  { z: -8, side: 1 },
  { z: -14, side: -1 },
  { z: -30, side: -1 },
  { z: -36, side: 1 },
]

/** 급식실(우측) / 백스테이지(좌측)로 빠지는 개구부 — 고정 랜드마크. */
export const CAFETERIA_GAP: [number, number] = [-20, -14]
export const BACKSTAGE_GAP: [number, number] = [-44, -38]

function WallRun({
  x,
  gaps,
  from,
  to,
}: {
  x: number
  gaps: Array<[number, number]>
  from: number
  to: number
}) {
  const sorted = [...gaps].sort((a, b) => a[0] - b[0])
  const segments: Array<[number, number]> = []
  let cursor = from
  for (const [a, b] of sorted) {
    if (a > cursor) segments.push([cursor, a])
    cursor = Math.max(cursor, b)
  }
  if (cursor < to) segments.push([cursor, to])

  return (
    <>
      {segments.map(([a, b]) => (
        <Slab
          key={`${x}:${a}:${b}`}
          position={[x, CEILING_H / 2, (a + b) / 2]}
          size={[0.3, CEILING_H, b - a]}
          color="#c0bcae"
        />
      ))}
    </>
  )
}

/** 교실 — 복도에서 문 너머로 들여다보이는 얕은 방. */
function Classroom({
  side,
  z,
  lino,
  board,
  reduceMotion,
  lightOn,
  flickerSeed,
}: {
  side: -1 | 1
  z: number
  lino: THREE.Texture
  board: THREE.Texture
  reduceMotion: boolean
  lightOn: boolean
  flickerSeed?: number
}) {
  const cx = side * 9.5
  const depth = 7.5
  const width = 11
  return (
    <group name={`classroom-${z}`}>
      <FloorSlab center={[cx, z]} width={width} depth={depth} map={lino} color="#a8a496" />
      <CeilingSlab center={[cx, z]} width={width} depth={depth} />
      {/* 복도 반대쪽 외벽 + 창 */}
      <Slab position={[side * 15, CEILING_H / 2, z]} size={[0.3, CEILING_H, depth]} color="#bab6a8" />
      <mesh position={[side * 14.8, 1.8, z]} rotation={[0, side * -Math.PI / 2, 0]}>
        <planeGeometry args={[depth - 1.2, 1.6]} />
        <meshStandardMaterial color="#0c1018" roughness={0.1} metalness={0.45} />
      </mesh>
      {/* 앞뒤 벽 */}
      {([-1, 1] as const).map((s) => (
        <Slab
          key={s}
          position={[cx, CEILING_H / 2, z + (s * depth) / 2]}
          size={[width, CEILING_H, 0.3]}
          color="#c0bcae"
        />
      ))}
      {/* 칠판 — 다 못 지운 낙서 */}
      <WallPanel
        position={[cx, 1.75, z - depth / 2 + 0.18]}
        size={[4.2, 1.5]}
        map={board}
        emissiveIntensity={0.08}
      />
      <Fluorescent
        position={[cx, CEILING_H - 0.12, z]}
        length={3.0}
        on={lightOn}
        flickerSeed={flickerSeed}
        reduceMotion={reduceMotion}
        intensity={8}
      />
    </group>
  )
}

/**
 * 중앙 복도·계단 (원작의 미드웨이). 배회의 중심축이고 교실로 분기된다.
 * 계단은 올라가면 참에서 끊긴다 — 위층은 이 버전 범위 밖이다.
 */
export function CorridorZone({
  reduceMotion,
  children,
}: {
  reduceMotion: boolean
  children?: ReactNode
}) {
  const lino = useMemo(() => linoleumMap(14), [])
  const boardA = useMemo(
    () => chalkboardTexture(['3월 2일 (금)', '야간자율학습 —', '전원 잔류']),
    [],
  )
  const boardB = useMemo(() => chalkboardTexture(['오늘 청소 당번', '1  4  7  9', '— 지우지 말 것']), [])
  const notice = useMemo(() => noticeTexture('교내 방송 점검', '3월 2일 03:00~'), [])
  const lights = useSchoolLights('corridor')

  const doorGaps = (side: -1 | 1): Array<[number, number]> => {
    const gaps: Array<[number, number]> = CLASSROOM_DOORS.filter((d) => d.side === side).map(
      (d) => [d.z - 0.9, d.z + 0.9],
    )
    if (side === 1) gaps.push(CAFETERIA_GAP)
    else gaps.push(BACKSTAGE_GAP)
    return gaps
  }

  return (
    <group name="school-corridor">
      <FloorSlab center={[0, -21]} width={8} depth={50} map={lino} color="#a8a496" />
      <CeilingSlab center={[0, -21]} width={8} depth={50} />
      <Slab position={[0, CEILING_H / 2, -46]} size={[8, CEILING_H, 0.3]} color="#c0bcae" />

      <WallRun x={-4} from={-46} to={4} gaps={doorGaps(-1)} />
      <WallRun x={4} from={-46} to={4} gaps={doorGaps(1)} />

      {CLASSROOM_DOORS.map((d, i) => (
        <group key={d.z}>
          <Doorway position={[d.side * 4, 0, d.z - 0.9]} rotationY={Math.PI / 2} width={1.8} />
          <Classroom
            side={d.side}
            z={d.z}
            lino={lino}
            board={i % 2 === 0 ? boardA : boardB}
            reduceMotion={reduceMotion}
            lightOn={lights[i]?.on ?? true}
            flickerSeed={lights[i]?.flickerSeed}
          />
        </group>
      ))}

      {/* 중앙 계단 — 복도 중간의 고정 랜드마크 */}
      <group name="central-stairs" position={[0, 0, -24]}>
        <Suspense fallback={null}>
          <GltfAsset url={schoolModel('stairs')} />
        </Suspense>
      </group>

      {/* 복도 게시판 */}
      <WallPanel
        position={[-3.8, 1.8, -19]}
        rotationY={Math.PI / 2}
        size={[1.4, 1.4]}
        map={notice}
        emissiveIntensity={0.14}
      />

      {/* 복도 형광등 열 — 끝으로 갈수록 소실점을 만든다 */}
      {[2, -3, -8, -13, -18, -23, -28, -33, -38, -43].map((z, i) => (
        <Fluorescent
          key={z}
          position={[0, CEILING_H - 0.12, z]}
          rotationY={Math.PI / 2}
          length={2.6}
          on={lights[i]?.on ?? true}
          flickerSeed={lights[i]?.flickerSeed}
          reduceMotion={reduceMotion}
        />
      ))}

      {children}
    </group>
  )
}
