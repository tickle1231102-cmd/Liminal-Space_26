import { Box, Ceiling, Floor, Lamp, Model, ModelRow, PALETTE, Wall } from '../JjimKit'
import { ALLEY, DOORS, ENTRANCE } from '../layout'

const { x: X, z: Z, h: H } = ENTRANCE
/** 카펫이 장판으로 바뀌는 선 */
const CARPET_Z = 18
/** 신발장 모듈(폭 1 m, 깊이 0.4 m) 일곱 칸 — 서쪽 벽 안쪽 면에 등을 대고 동쪽을 본다 */
const SHOE_LOCKERS = [13.5, 14.5, 15.5, 16.5, 17.5, 18.5, 19.5].map((z) => ({
  position: [X[0] + 0.125 + 0.2, 0, z] as [number, number, number],
  rotationY: Math.PI / 2,
}))

/**
 * 지하 카펫 복도·카운터·신발장 — 원작의 정문 광장. 엘리베이터 문은 열리지 않는다.
 * 동쪽 카운터 뒤 문이 직원 통로 연결부로 이어진다(고리 동선의 끝). x[-5,5] · z[12,26]
 */
export function EntranceZone() {
  return (
    <group name="jjimjilbang-entrance">
      <Floor x={X} z={[CARPET_Z, Z[1]]} color={PALETTE.carpet} surface="Carpet" />
      <Floor x={X} z={[Z[0], CARPET_Z]} />
      <Ceiling x={X} z={Z} height={H} />

      <Wall axis="z" at={X[0]} from={Z[0]} to={Z[1]} height={H} />
      <Wall axis="z" at={X[1]} from={Z[0]} to={Z[1]} height={H} gaps={[DOORS.counterBack]} />
      {/* 엘리베이터 벽 — 문은 닫혀 있다 */}
      <Wall axis="x" at={Z[1]} from={X[0]} to={X[1]} height={H} color={PALETTE.woodDark} surface="WoodDark" />
      <Box position={[0, 1.1, Z[1] - 0.16]} size={[2, 2.2, 0.06]} color={PALETTE.steel} roughness={0.35} solid={false} />
      <Box position={[0, 2.35, Z[1] - 0.16]} size={[0.5, 0.14, 0.04]} color="#1a1a1a" emissive="#ff6a3a" emissiveIntensity={1.2} solid={false} />
      {/* 찜질 골목 쪽 벽 (골목 폭에 맞춘다) */}
      <Wall axis="x" at={Z[0]} from={ALLEY.x[0]} to={ALLEY.x[1]} height={ALLEY.h} gaps={[DOORS.entranceToAlley]} />

      {/* 신발장 — 서쪽 벽을 채운다 (art/blender/jjimjilbang/shoe_locker.py) */}
      <ModelRow name="shoe_locker" items={SHOE_LOCKERS} />
      {/* 카운터 — 동쪽, 손님 쪽이 서쪽. 뒤 문(z 13~15)은 카운터 북쪽 끝 너머에 있다 (counter.py) */}
      <Model name="counter" position={[X[1] - 1.6, 0, 19]} rotationY={-Math.PI / 2} />

      <Lamp position={[0, H - 0.05, 22]} />
      <Lamp position={[0, H - 0.05, 15]} />
    </group>
  )
}
