import { Ceiling, LAMP_WOMEN, Model, ModelRow, ModuleFloor, PALETTE, TileWall, Wall, WarmLamp } from '../BathKit'

const H = 3.2
/** 화장대 한 칸 폭 (art/blender/bathhouse/vanity_mirror.py 2.4 x 0.5 m) — 칸을 이어 붙이면 줄눈이 맞는다 */
const VANITY_W = 2.4
const VANITIES = [-27, -27 + VANITY_W, -27 + VANITY_W * 2].map((x) => ({
  position: [x, 0, 11.625] as [number, number, number],
  rotationY: Math.PI,
}))
/** 헬멧형 드라이어 의자(hood_dryer.py) — 뒷면 z=-0.40이 서쪽 벽 안쪽 면(-29.875)에 닿는다 */
const DRYERS = [5.6, 6.6, 7.6].map((z) => ({ position: [-29.475, 0, z] as [number, number, number], rotationY: Math.PI / 2 }))
const LOCKERS = [-6, -2, 2].flatMap((z) => [
  { position: [-29.525, 0, z] as [number, number, number], rotationY: Math.PI / 2 },
  { position: [-10.475, 0, z] as [number, number, number], rotationY: -Math.PI / 2 },
])
const BENCHES = [-22.6, -17.4].map((x) => ({ position: [x, 0, -1] as [number, number, number], rotationY: Math.PI / 2 }))

/**
 * 여탕 탈의실 — 남탕 탈의실과 x=-10 칸막이벽을 공유하는 거울상 날개.
 * 겐칸 서쪽 붉은 노렌 → 통로 x[-10,-6]·z[8,12] → 탈의실 x[-30,-10]·z[-10,12].
 * 반다이는 칸막이 위(DressingZone의 BANDAI)에 걸터앉아 양쪽을 함께 본다.
 * 구조는 남탕과 같고 디테일만 다르다: 화장대 줄, 헬멧형 드라이어, 유아용 베드, 분홍빛이 조금 더 도는 전등.
 */
export function WomenDressingZone() {
  return (
    <group name="bathhouse-women-dressing">
      {/* 겐칸에서 들어오는 짧은 통로 — 노렌을 지나면 신을 벗은 마루 */}
      <ModuleFloor x={[-10, -6]} z={[8, 12]} module="floor_wood_module" />
      <Ceiling x={[-10, -6]} z={[8, 12]} height={H} color={PALETTE.wood} surface="CeilingWood" />

      <ModuleFloor x={[-30, -10]} z={[-10, 12]} module="floor_wood_module" />
      <Ceiling x={[-30, -10]} z={[-10, 12]} height={H} surface="CeilingWood" />

      {/* 서쪽 외벽, 통로까지 이어지는 북쪽 벽. 동쪽은 남탕 탈의실 벽(x=-10)을 공유한다 */}
      <Wall axis="z" at={-30} from={-10} to={12} height={H} surface="Plaster" />
      <Wall axis="x" at={12} from={-30} to={-6} height={H} surface="Plaster" />

      {/* 나무 락커 — 서쪽 벽과 칸막이벽 뒷면에 등을 댄다 */}
      <ModelRow name="locker_bank" items={LOCKERS} />
      <ModelRow name="bench" items={BENCHES} />

      {/* 화장대 줄 — 북쪽 벽 안쪽 면(11.875)에 등을 대고 방 안(-z)을 본다 */}
      <ModelRow name="vanity_mirror" items={VANITIES} />

      {/* 헬멧형 드라이어 의자 — 서쪽 벽에 등을 대고 방 안(+x)을 본다 */}
      <ModelRow name="hood_dryer" items={DRYERS} />

      {/* 유아용 베드 — 칸막이 뒷면, 락커와 반다이 사이. 긴 변이 벽을 따라간다 */}
      <Model name="baby_bed" position={[-10.45, 0, 5]} rotationY={-Math.PI / 2} />

      {/* 여탕 욕실과의 경계 — 문은 탈의실 가운데 */}
      <TileWall axis="x" at={-10} from={-42} to={-14} gaps={[[-22, -18]]} />

      <WarmLamp position={[-8, H - 0.3, 10]} intensity={3} color={LAMP_WOMEN} />
      <WarmLamp position={[-20, H - 0.3, 5]} intensity={5} color={LAMP_WOMEN} />
      <WarmLamp position={[-20, H - 0.3, -5]} intensity={5} color={LAMP_WOMEN} />
    </group>
  )
}
