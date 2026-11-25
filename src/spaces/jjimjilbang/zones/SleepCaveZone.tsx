import { Box, Ceiling, Floor, Lamp, LIGHT, PALETTE, Wall } from '../JjimKit'
import { DOORS, SLEEP } from '../layout'

const { x: X, z: Z, h: H } = SLEEP
/** 토굴 한 칸: 폭 2 m, 깊이 2.2 m, 2단 */
const CAVE_W = 2
const CAVE_D = 2.2
const NORTH_X = [17, 19, 21, 23, 25, 27]
const EAST_Z = [-37, -35, -33, -31, -29, -27, -25]

/**
 * 토굴 수면실 — 백스테이지. 낮은 천장 아래 2단 벌집 굴이 북벽과 동벽에 반복된다.
 * 화이트박스에서는 칸막이와 선반뿐이라 굴 안으로는 들어가지 못한다. x[16,30] · z[-40,-24]
 */
export function SleepCaveZone() {
  const northZ = Z[0] + CAVE_D / 2
  const eastX = X[1] - CAVE_D / 2
  return (
    <group name="jjimjilbang-sleep">
      <Floor x={X} z={Z} color="#b39d6c" />
      <Ceiling x={X} z={Z} height={H} color={PALETTE.hwangto} />
      <Wall axis="x" at={Z[0]} from={X[0]} to={X[1]} height={H} color={PALETTE.hwangto} />
      <Wall axis="z" at={X[1]} from={Z[0]} to={Z[1]} height={H} color={PALETTE.hwangto} />
      <Wall axis="x" at={Z[1]} from={X[0]} to={X[1]} height={H} color={PALETTE.hwangto} gaps={[DOORS.sleepToStaff]} />

      {/* 북벽 굴 — 칸막이와 중간 선반 */}
      {NORTH_X.map((x) => (
        <Box key={x} position={[x, H / 2, northZ]} size={[0.2, H, CAVE_D]} color={PALETTE.hwangto} />
      ))}
      <Box
        position={[(NORTH_X[0] + NORTH_X[NORTH_X.length - 1]) / 2, H / 2, northZ]}
        size={[NORTH_X[NORTH_X.length - 1] - NORTH_X[0], 0.12, CAVE_D]}
        color={PALETTE.wood}
      />
      {/* 동벽 굴 */}
      {EAST_Z.map((z) => (
        <Box key={z} position={[eastX, H / 2, z]} size={[CAVE_D, H, 0.2]} color={PALETTE.hwangto} />
      ))}
      <Box
        position={[eastX, H / 2, (EAST_Z[0] + EAST_Z[EAST_Z.length - 1]) / 2]}
        size={[CAVE_D, 0.12, EAST_Z[EAST_Z.length - 1] - EAST_Z[0]]}
        color={PALETTE.wood}
      />
      {/* 굴 하나만 안쪽 등이 켜져 있다 (3단계에서 시드로 고른다) */}
      <pointLight position={[NORTH_X[2] + CAVE_W / 2, 0.7, northZ]} color={LIGHT.clay} intensity={1.2} distance={4} decay={1.6} />

      <Lamp position={[22, H - 0.05, -31]} color={LIGHT.dim} intensity={2} distance={12} />
    </group>
  )
}
