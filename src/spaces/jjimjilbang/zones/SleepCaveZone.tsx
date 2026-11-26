import { DistanceLod } from '../../../core/world/DistanceLod'
import { Box, Ceiling, FillLight, Floor, Lamp, LIGHT, ModelRow, PALETTE, Wall } from '../JjimKit'
import { CAVES, DOORS, SLEEP } from '../layout'
import { useLitCave } from '../JjimProps'

const { x: X, z: Z, h: H } = SLEEP
const WALL_T = 0.125
const { northX: NORTH_X, eastZ: EAST_Z, northFront: NORTH_FRONT, eastFront: EAST_FRONT } = CAVES
const CAVE_ITEMS = [
  ...NORTH_X.map((x) => ({ position: [x, 0, NORTH_FRONT] as [number, number, number], rotationY: 0 })),
  ...EAST_Z.map((z) => ({ position: [EAST_FRONT, 0, z] as [number, number, number], rotationY: -Math.PI / 2 })),
]
/** 굴 안 등 높이: 아랫단·윗단 */
const TIER_Y = CAVES.floors.map((f) => f + 0.45)

/** 줄 끝과 모서리의 빈 틈을 메우는 흙벽 덩어리 [x0, x1, z0, z1] */
const FILLS: [number, number, number, number][] = [
  [X[0] + WALL_T, NORTH_X[0] - 1, Z[0] + WALL_T, NORTH_FRONT],
  [NORTH_X[NORTH_X.length - 1] + 1, X[1] - WALL_T, Z[0] + WALL_T, EAST_Z[0] - 1],
  [EAST_FRONT, X[1] - WALL_T, EAST_Z[EAST_Z.length - 1] + 1, Z[1] - WALL_T],
]

/**
 * 토굴 수면실 — 백스테이지. 낮은 천장 아래 2단 벌집 굴이 북벽과 동벽에 반복된다.
 * 굴은 들여다보기만 하고 들어가지 못한다. x[16,30] · z[-40,-24]
 */
export function SleepCaveZone() {
  // 굴 하나만 안쪽 등이 켜져 있다 — 어느 굴인지는 재시드마다 바뀐다. 들여다보면 다른 굴과 똑같다
  const lit = useLitCave(NORTH_X.length, EAST_Z.length)
  const litPos: [number, number, number] =
    lit.bank === 'north'
      ? [NORTH_X[lit.index]!, TIER_Y[lit.tier]!, NORTH_FRONT - 1.3]
      : [EAST_FRONT + 1.3, TIER_Y[lit.tier]!, EAST_Z[lit.index]!]
  return (
    <group name="jjimjilbang-sleep">
      {/* 홀 어디서든 문 너머로 보이므로 홀 전체를 덮는 거리까지는 그린다 */}
      <DistanceLod center={[(X[0] + X[1]) / 2, 0, (Z[0] + Z[1]) / 2]} near={46}>
      <Floor x={X} z={Z} color="#b39d6c" />
      <Ceiling x={X} z={Z} height={H} color={PALETTE.hwangto} surface="Hwangto" />
      <Wall axis="x" at={Z[0]} from={X[0]} to={X[1]} height={H} color={PALETTE.hwangto} surface="Hwangto" />
      <Wall axis="z" at={X[1]} from={Z[0]} to={Z[1]} height={H} color={PALETTE.hwangto} surface="Hwangto" />
      <Wall axis="x" at={Z[1]} from={X[0]} to={X[1]} height={H} color={PALETTE.hwangto} surface="Hwangto" gaps={[DOORS.sleepToStaff]} />

      <ModelRow name="cave_bank" items={CAVE_ITEMS} />
      {FILLS.map(([x0, x1, z0, z1]) => (
        <Box
          key={`${x0}:${z0}`}
          position={[(x0 + x1) / 2, H / 2, (z0 + z1) / 2]}
          size={[x1 - x0, H, z1 - z0]}
          color={PALETTE.hwangto}
          surface="Hwangto"
        />
      ))}
      </DistanceLod>
      <FillLight position={litPos} color={LIGHT.clay} intensity={1.6} distance={3.5} />

      <Lamp position={[21.5, H - 0.05, -31]} color={LIGHT.dim} intensity={2} distance={12} />
    </group>
  )
}
