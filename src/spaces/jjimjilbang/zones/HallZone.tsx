import { Ceiling, Floor, Lamp, LIGHT, Model, Wall } from '../JjimKit'
import { ChargingLeds, MassageChairs, TvWall } from '../JjimMachines'
import { DOORS, HALL, HALL_FIX } from '../layout'

const { x: X, z: Z, h: H } = HALL

/**
 * 대청마루 홀 — 원작의 먹거리 골목. 천장이 높고 넓으며 물리 오브젝트가 모이는 곳.
 * 랜드마크: 북벽 TV, 북서 매점, 서벽 안마의자 열, 남동 만화 서가. x[-16,16] · z[-40,-12]
 */
export function HallZone({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <group name="jjimjilbang-hall">
      <Floor x={X} z={Z} />
      <Ceiling x={X} z={Z} height={H} />
      <Wall axis="x" at={Z[1]} from={X[0]} to={X[1]} height={H} gaps={[DOORS.alleyToHall]} doorHeight={2.6} />
      <Wall axis="x" at={Z[0]} from={X[0]} to={X[1]} height={H} />
      <Wall axis="z" at={X[0]} from={Z[0]} to={Z[1]} height={H} />
      <Wall axis="z" at={X[1]} from={Z[0]} to={Z[1]} height={H} gaps={[DOORS.hallToSleep]} />

      <TvWall />
      {/* 매점 — 불이 켜져 있다. 계란 바구니는 가득하고 식혜 냉장고는 비었다 */}
      <Model name="snack_bar" position={[HALL_FIX.snackBar[0], 0, HALL_FIX.snackBar[1]]} />
      <Model name="sikhye_fridge" position={[HALL_FIX.fridge[0], 0, HALL_FIX.fridge[1]]} />
      <pointLight position={[HALL_FIX.snackBar[0], 2.6, HALL_FIX.snackBar[1] - 1]} color={LIGHT.fluorescent} intensity={8} distance={10} decay={1.6} />
      <MassageChairs reduceMotion={reduceMotion} />
      {/* 만화 서가(북쪽을 본다)와 충전함(서쪽을 본다) — 남동 */}
      <Model name="comic_shelf" position={[HALL_FIX.comicShelf[0], 0, HALL_FIX.comicShelf[1]]} rotationY={Math.PI} />
      <Model name="charging_locker" position={[HALL_FIX.charging[0], 0, HALL_FIX.charging[1]]} rotationY={-Math.PI / 2} />
      <ChargingLeds reduceMotion={reduceMotion} />

      {/* 홀은 이 공간에서 가장 밝다 (PRD 15절: 어둡게 만들지 않는다) */}
      <Lamp position={[-8, H - 0.05, -20]} intensity={40} distance={30} />
      <Lamp position={[8, H - 0.05, -20]} intensity={40} distance={30} />
      <Lamp position={[-8, H - 0.05, -32]} intensity={40} distance={30} />
      <Lamp position={[8, H - 0.05, -32]} intensity={40} distance={30} />
    </group>
  )
}
