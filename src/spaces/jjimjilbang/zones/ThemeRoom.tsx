import { Box, Ceiling, Floor, LIGHT, Model, PALETTE, Wall, type Surface } from '../JjimKit'
import { ALLEY, DOORS, ROOMS, type RoomKind } from '../layout'

type Look = {
  wall: string
  wallSurface: Surface
  floor: string
  floorSurface: Surface
  ceilingSurface: Surface
  light: string
  intensity: number
  /** 골목 반대편 벽이 같은 무늬로 스스로 빛난다 (뒤에서 비추는 벽) */
  glow?: number
}

const LOOK: Record<RoomKind, Look> = {
  salt: { wall: PALETTE.salt, wallSurface: 'SaltBrick', floor: '#d9c8bd', floorSurface: 'Stone', ceilingSurface: 'Wood', light: LIGHT.salt, intensity: 9, glow: 0.55 },
  clay: { wall: PALETTE.hwangto, wallSurface: 'Hwangto', floor: '#9a7a52', floorSurface: 'Wood', ceilingSurface: 'Hwangto', light: LIGHT.clay, intensity: 8 },
  kiln: { wall: PALETTE.hwangto, wallSurface: 'ClayBrick', floor: '#8a6a4a', floorSurface: 'Hwangto', ceilingSurface: 'Charcoal', light: LIGHT.kiln, intensity: 10 },
  ice: { wall: PALETTE.ice, wallSurface: 'IcePanel', floor: '#b9c9cf', floorSurface: 'Stone', ceilingSurface: 'IcePanel', light: LIGHT.ice, intensity: 9 },
}

/**
 * 테마방 한 칸 — 골목 벽(x=±6)에 붙는다. 문은 AlleyZone의 벽이 뚫고, 여기는 나머지 세 벽과 방의 빛을 맡는다.
 * 방마다 재질과 빛 색이 달라 골목에서 문틈만 봐도 구분된다 (암염 분홍 · 황토 주황 · 불가마 빨강 · 얼음 청백).
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
  const glow = look.glow ? { color: look.light, intensity: look.glow } : undefined
  return (
    <group name={`jjimjilbang-room-${kind}`}>
      <Floor x={x} z={z} color={look.floor} surface={look.floorSurface} />
      <Ceiling x={x} z={z} height={h} color={look.wall} surface={look.ceilingSurface} />
      <Wall axis="x" at={z[0]} from={x[0]} to={x[1]} height={h} color={look.wall} surface={look.wallSurface} />
      <Wall axis="x" at={z[1]} from={x[0]} to={x[1]} height={h} color={look.wall} surface={look.wallSurface} />
      {kind === 'kiln' ? (
        <>
          {/* 아궁이 쪽 벽 — 철창 너머로 직원 통로에서 들여다보인다. 건너갈 수 없다 */}
          <Wall axis="z" at={far} from={z[0]} to={z[1]} height={h} color={look.wall} surface={look.wallSurface} gaps={[grille]} doorHeight={1.6} />
          <Box position={[far, 0.3, (grille[0] + grille[1]) / 2]} size={[0.25, 0.6, grille[1] - grille[0]]} color={look.wall} surface={look.wallSurface} />
          <Box position={[far, 1.1, (grille[0] + grille[1]) / 2]} size={[0.1, 1, grille[1] - grille[0]]} visible={false} />
          {[0.25, 0.75, 1.25, 1.75].map((d) => (
            <Box key={d} position={[far, 1.1, grille[0] + d]} size={[0.05, 1, 0.05]} color={PALETTE.steel} solid={false} />
          ))}
          {/* 벽돌 볼트 천장 (art/blender/jjimjilbang/kiln_dome.py) — 틈새의 붉은 빛은 바닥 가까이에서 올라온다 */}
          <Model name="kiln_dome" position={[cx, 0, cz]} />
          <pointLight position={[cx, 0.5, cz]} color={look.light} intensity={look.intensity} distance={13} decay={1.6} />
        </>
      ) : (
        <>
          <Wall axis="z" at={far} from={z[0]} to={z[1]} height={h} color={look.wall} surface={look.wallSurface} glow={glow} />
          <pointLight position={[cx, h - 0.5, cz]} color={look.light} intensity={look.intensity} distance={12} decay={1.6} />
        </>
      )}
      {/* 문 쪽으로 새는 빛 — 골목 바닥에 방의 색이 깔린다 */}
      <pointLight
        position={[west ? x[1] - 1.2 : x[0] + 1.2, 1.4, (ROOMS[kind].door[0] + ROOMS[kind].door[1]) / 2]}
        color={look.light}
        intensity={look.intensity * 0.8}
        distance={8}
        decay={1.6}
      />
    </group>
  )
}
