import { Box, Ceiling, Floor, Lamp, LIGHT, ModelRow, PALETTE, Wall } from '../JjimKit'
import { DOORS, SLEEP } from '../layout'
import { useLitCave } from '../JjimProps'

const { x: X, z: Z, h: H } = SLEEP
/** 토굴 모듈(art/blender/jjimjilbang/cave_bank.py): 폭 2 m, 깊이 2.2 m, 2단. 원점 = 앞면 가운데 */
const CAVE_D = 2.2
const WALL_T = 0.125
/** 북벽 줄 — 남쪽(+z)을 본다 */
const NORTH_FRONT = Z[0] + WALL_T + CAVE_D
const NORTH_X = [18, 20, 22, 24, 26]
/** 동벽 줄 — 서쪽(-x)을 본다 */
const EAST_FRONT = X[1] - WALL_T - CAVE_D
const EAST_Z = [-36, -34, -32, -30, -28, -26]
const CAVES = [
  ...NORTH_X.map((x) => ({ position: [x, 0, NORTH_FRONT] as [number, number, number], rotationY: 0 })),
  ...EAST_Z.map((z) => ({ position: [EAST_FRONT, 0, z] as [number, number, number], rotationY: -Math.PI / 2 })),
]
/** 굴 바닥에서 등까지 높이: 아랫단·윗단 (cave_bank.py FLOORS + 0.45) */
const TIER_Y = [0.57, 1.75]

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
      <Floor x={X} z={Z} color="#b39d6c" />
      <Ceiling x={X} z={Z} height={H} color={PALETTE.hwangto} surface="Hwangto" />
      <Wall axis="x" at={Z[0]} from={X[0]} to={X[1]} height={H} color={PALETTE.hwangto} surface="Hwangto" />
      <Wall axis="z" at={X[1]} from={Z[0]} to={Z[1]} height={H} color={PALETTE.hwangto} surface="Hwangto" />
      <Wall axis="x" at={Z[1]} from={X[0]} to={X[1]} height={H} color={PALETTE.hwangto} surface="Hwangto" gaps={[DOORS.sleepToStaff]} />

      <ModelRow name="cave_bank" items={CAVES} />
      {FILLS.map(([x0, x1, z0, z1]) => (
        <Box
          key={`${x0}:${z0}`}
          position={[(x0 + x1) / 2, H / 2, (z0 + z1) / 2]}
          size={[x1 - x0, H, z1 - z0]}
          color={PALETTE.hwangto}
          surface="Hwangto"
        />
      ))}
      <pointLight position={litPos} color={LIGHT.clay} intensity={1.6} distance={3.5} decay={1.6} />

      <Lamp position={[21.5, H - 0.05, -31]} color={LIGHT.dim} intensity={2} distance={12} />
    </group>
  )
}
