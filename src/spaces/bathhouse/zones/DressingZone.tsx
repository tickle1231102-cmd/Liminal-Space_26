import { Ceiling, Model, ModelRow, ModuleFloor, TileWall, Wall, WarmLamp } from '../BathKit'

const H = 3.2
/**
 * 반다이 — 남탕·여탕 칸막이(x=-10) 위에 걸터앉아 두 탈의실을 함께 내려다본다.
 * 등은 겐칸 벽(z=8)에 대고 앞(쟁반 쪽)은 욕실 방향(-z). 모델 COL_Booth z폭 1.4 → 6.475~7.875.
 * 계산대 위 격자 칸막이(COL_Divider)가 넘어가는 길을 막는다 (art/blender/bathhouse/bandai.py).
 */
const LOCKERS = [-1, 1].flatMap((side) =>
  [-6, -2, 2].map((z) => ({
    position: [side * 9.525, 0, z] as [number, number, number],
    rotationY: side < 0 ? Math.PI / 2 : -Math.PI / 2,
  })),
)
const BENCHES = [-2.6, 2.6].map((x) => ({ position: [x, 0, -1] as [number, number, number], rotationY: Math.PI / 2 }))
export const BANDAI: [number, number, number] = [-10, 0, 7.225]
/** 칸막이가 반다이 앞면에서 끊기는 지점 — 그 위로는 격자 너머 반대편 탈의실이 보인다 */
const PARTITION_GAP: [number, number] = [6.6, 8]

/**
 * 반다이·탈의실 — 원작의 미드웨이. 배회의 중심축.
 * x[-10,10] · z[-10,8]
 */
export function DressingZone() {
  return (
    <group name="bathhouse-dressing">
      <ModuleFloor x={[-10, 10]} z={[-10, 8]} module="floor_wood_module" />
      <Ceiling x={[-10, 10]} z={[-10, 8]} height={H} surface="CeilingWood" />

      {/* 서쪽 벽 = 여탕과의 칸막이. 반다이 자리만 비우고 위는 상인방 */}
      <Wall axis="z" at={-10} from={-10} to={8} height={H} gaps={[PARTITION_GAP]} surface="Plaster" />
      <Wall axis="z" at={10} from={-10} to={8} height={H} surface="Plaster" />

      <Model name="bandai" position={BANDAI} rotationY={Math.PI} />

      {/* 나무 락커 — 좌우 벽 안쪽 면(±9.875)에 등을 댄다 */}
      <ModelRow name="locker_bank" items={LOCKERS} />

      {/* 가운데 긴 의자 두 개 */}
      <ModelRow name="bench" items={BENCHES} />

      {/* 우유 냉장고 — 반다이가 있던 동쪽 구석, 겐칸 벽에 등을 댄다. 안쪽 조명이 구석을 희미하게 밝힌다 */}
      <Model name="milk_fridge" position={[3.2, 0, 7.475]} rotationY={Math.PI} />

      {/* 욕실과의 경계 벽 — 욕실 쪽 면이 타일이라 같은 모듈을 쓴다 */}
      <TileWall axis="x" at={-10} from={-14} to={14} gaps={[[-2, 2]]} />

      <WarmLamp position={[0, H - 0.3, 3]} intensity={5} />
      <WarmLamp position={[0, H - 0.3, -5]} intensity={5} />
      <WarmLamp position={[-6, H - 0.3, -1]} intensity={3} />
      <WarmLamp position={[6, H - 0.3, -1]} intensity={3} />
    </group>
  )
}
