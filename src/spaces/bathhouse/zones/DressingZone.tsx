import { Ceiling, Model, ModuleFloor, TileWall, Wall, WarmLamp } from '../BathKit'

const H = 3.2

/**
 * 반다이·탈의실 — 원작의 미드웨이. 배회의 중심축.
 * x[-10,10] · z[-10,8]
 */
export function DressingZone() {
  return (
    <group name="bathhouse-dressing">
      <ModuleFloor x={[-10, 10]} z={[-10, 8]} module="floor_wood_module" />
      <Ceiling x={[-10, 10]} z={[-10, 8]} height={H} />

      <Wall axis="z" at={-10} from={-10} to={8} height={H} />
      <Wall axis="z" at={10} from={-10} to={8} height={H} />

      {/* 반다이 — 입구를 내려다보는 높은 접수대 (입구 쪽 -X를 본다) */}
      <Model name="bandai" position={[3.2, 0, 6.4]} rotationY={-Math.PI / 2} />

      {/* 나무 락커 — 좌우 벽 안쪽 면(±9.875)에 등을 댄다 */}
      {[-1, 1].map((side) =>
        [-6, -2, 2].map((z) => (
          <Model
            key={`${side}:${z}`}
            name="locker_bank"
            position={[side * 9.525, 0, z]}
            rotationY={side < 0 ? Math.PI / 2 : -Math.PI / 2}
          />
        )),
      )}

      {/* 가운데 긴 의자 두 개 */}
      <Model name="bench" position={[-2.6, 0, -1]} rotationY={Math.PI / 2} />
      <Model name="bench" position={[2.6, 0, -1]} rotationY={Math.PI / 2} />

      {/* 우유 냉장고 — 안쪽 조명이 탈의실 구석을 희미하게 밝힌다 */}
      <Model name="milk_fridge" position={[-9.475, 0, 6.6]} rotationY={Math.PI / 2} />

      {/* 욕실과의 경계 벽 — 욕실 쪽 면이 타일이라 같은 모듈을 쓴다 */}
      <TileWall axis="x" at={-10} from={-14} to={14} gaps={[[-2, 2]]} />

      <WarmLamp position={[0, H - 0.3, 3]} intensity={5} />
      <WarmLamp position={[0, H - 0.3, -5]} intensity={5} />
      <WarmLamp position={[-6, H - 0.3, -1]} intensity={3} />
      <WarmLamp position={[6, H - 0.3, -1]} intensity={3} />
    </group>
  )
}
