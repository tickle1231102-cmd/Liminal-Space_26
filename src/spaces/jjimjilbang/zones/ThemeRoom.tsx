import { Box, Ceiling, Floor, LIGHT, PALETTE, Wall } from '../JjimKit'
import { ALLEY, DOORS, ROOMS, type RoomKind } from '../layout'

const LOOK: Record<RoomKind, { wall: string; floor: string; light: string; intensity: number }> = {
  salt: { wall: PALETTE.salt, floor: '#d9c8bd', light: LIGHT.salt, intensity: 5 },
  clay: { wall: PALETTE.hwangto, floor: '#9a7a52', light: LIGHT.clay, intensity: 4 },
  kiln: { wall: PALETTE.charcoal, floor: '#8a6a4a', light: LIGHT.kiln, intensity: 5 },
  ice: { wall: PALETTE.ice, floor: '#b9c9cf', light: LIGHT.ice, intensity: 5 },
}

/**
 * 테마방 한 칸 — 골목 벽(x=±6)에 붙는다. 문은 AlleyZone의 벽이 뚫고, 여기는 나머지 세 벽과 방의 빛을 맡는다.
 * 방마다 빛 색이 달라 골목에서 문틈만 봐도 구분된다.
 */
export function ThemeRoom({ kind }: { kind: RoomKind }) {
  const { x, z, h } = ROOMS[kind]
  const look = LOOK[kind]
  const west = x[1] <= ALLEY.x[0]
  /** 골목 반대편 벽 */
  const far = west ? x[0] : x[1]
  const cx = (x[0] + x[1]) / 2
  const cz = (z[0] + z[1]) / 2
  const grille = DOORS.staffToFurnace
  return (
    <group name={`jjimjilbang-room-${kind}`}>
      <Floor x={x} z={z} color={look.floor} />
      <Ceiling x={x} z={z} height={h} color={look.wall} />
      <Wall axis="x" at={z[0]} from={x[0]} to={x[1]} height={h} color={look.wall} />
      <Wall axis="x" at={z[1]} from={x[0]} to={x[1]} height={h} color={look.wall} />
      {kind === 'kiln' ? (
        <>
          {/* 아궁이 쪽 벽 — 철창 너머로 직원 통로에서 들여다보인다. 건너갈 수 없다 */}
          <Wall axis="z" at={far} from={z[0]} to={z[1]} height={h} color={look.wall} gaps={[grille]} doorHeight={1.6} />
          <Box position={[far, 0.3, (grille[0] + grille[1]) / 2]} size={[0.25, 0.6, grille[1] - grille[0]]} color={look.wall} />
          <Box position={[far, 1.1, (grille[0] + grille[1]) / 2]} size={[0.1, 1, grille[1] - grille[0]]} visible={false} />
          {[0.25, 0.75, 1.25, 1.75].map((d) => (
            <Box key={d} position={[far, 1.1, grille[0] + d]} size={[0.05, 1, 0.05]} color={PALETTE.steel} solid={false} />
          ))}
        </>
      ) : (
        <Wall axis="z" at={far} from={z[0]} to={z[1]} height={h} color={look.wall} />
      )}
      {/* 방의 빛 — 반대편 벽의 발광 판과 포인트 라이트 하나 */}
      <Box
        position={[far + (west ? 0.16 : -0.16), h * 0.55, cz + (kind === 'kiln' ? -3 : 0)]}
        size={[0.06, h * 0.5, 2.4]}
        color={look.light}
        emissive={look.light}
        emissiveIntensity={1.6}
        solid={false}
      />
      <pointLight position={[cx, h - 0.5, cz]} color={look.light} intensity={look.intensity} distance={12} decay={1.6} />
    </group>
  )
}
