import { Box, Ceiling, Floor, Lamp, LIGHT, PALETTE, Wall } from '../JjimKit'
import { DOORS, ENTRANCE, LAUNDRY, LINK, ROOMS, STAFF } from '../layout'

const H = STAFF.h
const FLOOR = PALETTE.concrete
const WALL = '#a9a59b'

/**
 * 직원 통로·세탁실·아궁이 알코브 — 백스테이지. 수면실 남쪽 문에서 내려와 카운터 뒤 문으로 나간다(고리 동선).
 * 통로 x[17,21] · z[-24,15.5], 세탁실 x[21,30] · z[-24,-10], 연결부 x[5,17] · z[12.5,15.5]
 */
export function StaffZone() {
  const furnace = DOORS.staffToFurnace
  const kilnBack = ROOMS.kiln.x[1]
  return (
    <group name="jjimjilbang-staff">
      {/* 통로 */}
      <Floor x={STAFF.x} z={STAFF.z} color={FLOOR} />
      <Ceiling x={STAFF.x} z={STAFF.z} height={H} color={WALL} />
      <Wall axis="z" at={STAFF.x[0]} from={STAFF.z[0]} to={LINK.z[0]} height={H} color={WALL} gaps={[furnace]} />
      <Wall axis="z" at={STAFF.x[1]} from={STAFF.z[0]} to={STAFF.z[1]} height={H} color={WALL} gaps={[DOORS.staffToLaundry]} />
      <Wall axis="x" at={STAFF.z[1]} from={LINK.x[0]} to={STAFF.x[1]} height={H} color={WALL} />

      {/* 아궁이 알코브 — 불가마 뒷벽(철창)까지 한 걸음. 옆은 막혀 있다 */}
      <Floor x={[kilnBack, STAFF.x[0]]} z={furnace} color={FLOOR} />
      <Box position={[(kilnBack + STAFF.x[0]) / 2, H / 2, furnace[0] - 0.1]} size={[STAFF.x[0] - kilnBack, H, 0.2]} color={PALETTE.charcoal} />
      <Box position={[(kilnBack + STAFF.x[0]) / 2, H / 2, furnace[1] + 0.1]} size={[STAFF.x[0] - kilnBack, H, 0.2]} color={PALETTE.charcoal} />
      <pointLight position={[kilnBack + 0.5, 1, (furnace[0] + furnace[1]) / 2]} color={LIGHT.kiln} intensity={1.5} distance={5} decay={1.6} />

      {/* 연결부 — 카운터 뒤 문으로 */}
      <Floor x={[ENTRANCE.x[1], LINK.x[1]]} z={LINK.z} color={FLOOR} />
      <Ceiling x={LINK.x} z={LINK.z} height={H} color={WALL} />
      <Wall axis="x" at={LINK.z[0]} from={LINK.x[0]} to={LINK.x[1]} height={H} color={WALL} />

      {/* 세탁실 */}
      <Floor x={LAUNDRY.x} z={LAUNDRY.z} color={FLOOR} />
      <Ceiling x={LAUNDRY.x} z={LAUNDRY.z} height={H} color={WALL} />
      <Wall axis="x" at={LAUNDRY.z[1]} from={LAUNDRY.x[0]} to={LAUNDRY.x[1]} height={H} color={WALL} />
      <Wall axis="z" at={LAUNDRY.x[1]} from={LAUNDRY.z[0]} to={LAUNDRY.z[1]} height={H} color={WALL} />
      {/* 세탁기 열과 찜질복 더미 */}
      {[-22.5, -21, -19.5].map((z) => (
        <Box key={z} position={[LAUNDRY.x[1] - 0.6, 0.5, z]} size={[0.9, 1, 0.9]} color="#dfe3e4" />
      ))}
      <Box position={[26, 0.35, -12]} size={[2.4, 0.7, 1.6]} color="#e08a3c" />

      <Lamp position={[19, H - 0.05, -16]} intensity={3} distance={12} />
      <Lamp position={[19, H - 0.05, 0]} intensity={3} distance={12} />
      <Lamp position={[19, H - 0.05, 13]} intensity={3} distance={12} />
      <Lamp position={[11, H - 0.05, 14]} intensity={3} distance={12} />
      <Lamp position={[25.5, H - 0.05, -17]} intensity={4} distance={12} />
    </group>
  )
}
