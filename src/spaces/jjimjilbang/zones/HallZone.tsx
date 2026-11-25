import { Box, Ceiling, Floor, Lamp, LIGHT, PALETTE, Wall } from '../JjimKit'
import { DOORS, HALL } from '../layout'

const { x: X, z: Z, h: H } = HALL
const MASSAGE_Z = [-32, -29, -26, -23, -20, -17]
const TV_X = [-3, 0, 3]

/**
 * 대청마루 홀 — 원작의 먹거리 골목. 천장이 높고 넓으며 물리 오브젝트가 모이는 곳(소품은 3단계).
 * 랜드마크: 북벽 TV, 북서 매점, 서벽 안마의자 열, 남동 만화 서가. x[-16,16] · z[-40,-12]
 */
export function HallZone() {
  return (
    <group name="jjimjilbang-hall">
      <Floor x={X} z={Z} />
      <Ceiling x={X} z={Z} height={H} />
      <Wall axis="x" at={Z[1]} from={X[0]} to={X[1]} height={H} gaps={[DOORS.alleyToHall]} doorHeight={2.6} />
      <Wall axis="x" at={Z[0]} from={X[0]} to={X[1]} height={H} />
      <Wall axis="z" at={X[0]} from={Z[0]} to={Z[1]} height={H} />
      <Wall axis="z" at={X[1]} from={Z[0]} to={Z[1]} height={H} gaps={[DOORS.hallToSleep]} />

      {/* TV 벽 — 화면조정 무늬 대신 푸른 발광 판 */}
      {TV_X.map((x) => (
        <Box key={x} position={[x, 2.6, Z[0] + 0.18]} size={[2.2, 1.3, 0.08]} color="#10141c" emissive={LIGHT.tv} emissiveIntensity={0.9} solid={false} />
      ))}
      {/* 매점 — 카운터와 식혜 냉장고 */}
      <Box position={[-11, 0.55, Z[0] + 3]} size={[7, 1.1, 0.9]} color={PALETTE.woodDark} surface="WoodDark" />
      <Box position={[-15, 1, Z[0] + 1]} size={[1.2, 2, 0.9]} color="#e8eef0" emissive="#dff4ff" emissiveIntensity={0.5} />
      {/* 안마의자 열 — 서벽 */}
      {MASSAGE_Z.map((z) => (
        <Box key={z} position={[X[0] + 1, 0.6, z]} size={[1.4, 1.2, 0.9]} color="#3a2f2a" />
      ))}
      {/* 만화 서가와 충전함 — 남동 */}
      <Box position={[12, 1, Z[1] - 0.45]} size={[5, 2, 0.5]} color={PALETTE.wood} surface="Wood" />
      <Box position={[X[1] - 0.4, 0.8, -16]} size={[0.5, 1.6, 1.4]} color={PALETTE.steel} />

      {/* 홀은 이 공간에서 가장 밝다 (PRD 15절: 어둡게 만들지 않는다) */}
      <Lamp position={[-8, H - 0.05, -20]} intensity={40} distance={30} />
      <Lamp position={[8, H - 0.05, -20]} intensity={40} distance={30} />
      <Lamp position={[-8, H - 0.05, -32]} intensity={40} distance={30} />
      <Lamp position={[8, H - 0.05, -32]} intensity={40} distance={30} />
    </group>
  )
}
