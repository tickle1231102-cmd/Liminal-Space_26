import { Water } from '../../../core/world/WaterSurface'
import { Box, Ceiling, DOOR_H, Floor, Lamp, LIGHT, PALETTE, Wall } from '../JjimKit'
import { ALLEY, CHANNEL, KILN_DOOR_H, ROOMS, type RoomKind } from '../layout'

const { x: X, z: Z, h: H } = ALLEY
const C = CHANNEL
/** 수로 옆 경사: 폭 run, 낙차 -bottom */
const RUN = C.half - C.flat
const SLOPE = Math.atan2(-C.bottom, RUN)
const SLOPE_LEN = Math.hypot(RUN, C.bottom)
const CHANNEL_LEN = C.z[1] - C.z[0]
const T = 0.2

/**
 * 찜질 골목 — 원작의 미드웨이. 한가운데 족욕 수로가 길잡이이고 양옆 벽에 테마방 문 네 개가 뚫린다.
 * x[-6,6] · z[-12,12]
 */
export function AlleyZone({ reduceMotion }: { reduceMotion: boolean }) {
  const midZ = (C.z[0] + C.z[1]) / 2
  return (
    <group name="jjimjilbang-alley">
      {/* 수로 구멍을 남기고 바닥을 네 조각으로 */}
      <Floor x={[X[0], -C.half]} z={Z} />
      <Floor x={[C.half, X[1]]} z={Z} />
      <Floor x={[-C.half, C.half]} z={[C.z[1], Z[1]]} />
      <Floor x={[-C.half, C.half]} z={[Z[0], C.z[0]]} />
      <Ceiling x={X} z={Z} height={H} />

      {/* 양옆 벽 — 테마방 문. 불가마만 낮은 아치 */}
      <Wall axis="z" at={X[0]} from={Z[0]} to={Z[1]} height={H} gaps={[ROOMS.clay.door, ROOMS.salt.door]} />
      <Wall axis="z" at={X[1]} from={Z[0]} to={ROOMS.kiln.z[0]} height={H} gaps={[ROOMS.ice.door]} />
      <Wall axis="z" at={X[1]} from={ROOMS.kiln.z[0]} to={Z[1]} height={H} gaps={[ROOMS.kiln.door]} doorHeight={KILN_DOOR_H} color={PALETTE.hwangto} surface="ClayBrick" />

      {/* 문 위 온도 표시판 — 방의 빛 색으로 켜져 있어 골목 끝에서도 어느 방인지 보인다 */}
      {(Object.keys(ROOMS) as RoomKind[]).map((kind) => {
        const r = ROOMS[kind]
        const west = r.x[1] <= X[0]
        const y = (kind === 'kiln' ? KILN_DOOR_H : DOOR_H) + 0.28
        return (
          <Box
            key={kind}
            position={[(west ? X[0] : X[1]) + (west ? 0.14 : -0.14), y, (r.door[0] + r.door[1]) / 2]}
            size={[0.04, 0.26, 0.7]}
            color="#15120f"
            emissive={LIGHT[kind]}
            emissiveIntensity={1.4}
            solid={false}
          />
        )
      })}

      {/* 족욕 수로 — 평평한 바닥, 양옆 경사, 양 끝 마구리 */}
      <Box position={[0, C.bottom - T / 2, midZ]} size={[C.flat * 2, T, CHANNEL_LEN]} color={PALETTE.stone} roughness={0.5} surface="Stone" />
      {([-1, 1] as const).map((s) => (
        <Box
          key={s}
          position={[s * (C.flat + RUN / 2 + (T / 2) * Math.sin(SLOPE)), C.bottom / 2 - (T / 2) * Math.cos(SLOPE), midZ]}
          rotation={[0, 0, s * SLOPE]}
          size={[SLOPE_LEN, T, CHANNEL_LEN]}
          color={PALETTE.stone}
          roughness={0.5}
          surface="Stone"
        />
      ))}
      {C.z.map((z, i) => (
        <Box key={z} position={[0, -0.25, z + (i === 0 ? -0.1 : 0.1)]} size={[C.half * 2, 0.5, 0.2]} color={PALETTE.stone} surface="Stone" />
      ))}
      {/* 돌다리 — 바닥 높이의 얇은 슬랩. 물은 그 아래로 지난다 */}
      {C.bridges.map((z) => (
        <Box key={z} position={[0, -0.05, z]} size={[C.half * 2, 0.1, C.bridgeWidth]} color={PALETTE.stone} roughness={0.7} surface="Stone" />
      ))}
      <Water
        id="jjim-foot-channel"
        x={[-C.half, C.half]}
        z={C.z}
        y={C.surface}
        floor={C.bottom}
        color="#6fa7a0"
        reduceMotion={reduceMotion}
      />

      <Lamp position={[0, H - 0.05, 6]} intensity={9} />
      <Lamp position={[0, H - 0.05, -6]} intensity={9} />
    </group>
  )
}
