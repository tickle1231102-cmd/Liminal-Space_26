import { Box, Ceiling, Floor, Lamp, PALETTE, Wall } from '../JjimKit'
import { ALLEY, DOORS, ENTRANCE } from '../layout'

const { x: X, z: Z, h: H } = ENTRANCE
/** 카펫이 장판으로 바뀌는 선 */
const CARPET_Z = 18

/**
 * 지하 카펫 복도·카운터·신발장 — 원작의 정문 광장. 엘리베이터 문은 열리지 않는다.
 * 동쪽 카운터 뒤 문이 직원 통로 연결부로 이어진다(고리 동선의 끝). x[-5,5] · z[12,26]
 */
export function EntranceZone() {
  return (
    <group name="jjimjilbang-entrance">
      <Floor x={X} z={[CARPET_Z, Z[1]]} color={PALETTE.carpet} />
      <Floor x={X} z={[Z[0], CARPET_Z]} />
      <Ceiling x={X} z={Z} height={H} />

      <Wall axis="z" at={X[0]} from={Z[0]} to={Z[1]} height={H} />
      <Wall axis="z" at={X[1]} from={Z[0]} to={Z[1]} height={H} gaps={[DOORS.counterBack]} />
      {/* 엘리베이터 벽 — 문은 닫혀 있다 */}
      <Wall axis="x" at={Z[1]} from={X[0]} to={X[1]} height={H} color={PALETTE.woodDark} />
      <Box position={[0, 1.1, Z[1] - 0.16]} size={[2, 2.2, 0.06]} color={PALETTE.steel} roughness={0.35} solid={false} />
      <Box position={[0, 2.35, Z[1] - 0.16]} size={[0.5, 0.14, 0.04]} color="#1a1a1a" emissive="#ff6a3a" emissiveIntensity={1.2} solid={false} />
      {/* 찜질 골목 쪽 벽 (골목 폭에 맞춘다) */}
      <Wall axis="x" at={Z[0]} from={ALLEY.x[0]} to={ALLEY.x[1]} height={ALLEY.h} gaps={[DOORS.entranceToAlley]} />

      {/* 신발장 — 서쪽 벽을 채운다 */}
      <Box position={[X[0] + 0.35, 1, 16.5]} size={[0.45, 2, 7]} color={PALETTE.wood} />
      {/* 카운터 — 동쪽. 뒤 문(z 13~15)은 카운터 북쪽 끝 너머에 있다 */}
      <Box position={[X[1] - 1.6, 0.55, 19]} size={[0.8, 1.1, 5]} color={PALETTE.woodDark} />
      {/* 접힌 찜질복 더미 */}
      <Box position={[X[1] - 1.6, 1.22, 20.4]} size={[0.5, 0.24, 0.7]} color="#e08a3c" solid={false} />
      <Box position={[X[1] - 1.6, 1.22, 19.4]} size={[0.5, 0.24, 0.7]} color="#e6a3b0" solid={false} />

      <Lamp position={[0, H - 0.05, 22]} />
      <Lamp position={[0, H - 0.05, 15]} />
    </group>
  )
}
