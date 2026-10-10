import { ModelBoundary } from '../../../core/world/ModelBoundary'
import { Noren } from '../Noren'
import { Box, Ceiling, Model, ModuleFloor, PALETTE, Wall, WarmLamp } from '../BathKit'

const H = 3

/**
 * 노렌 입구·신발장(겐칸) — 원작의 정문 광장. 바깥 유리문은 열리지 않는다.
 * x[-6,6] · z[8,20]
 */
export function GenkanZone({ reduceMotion }: { reduceMotion: boolean }) {

  return (
    <group name="bathhouse-genkan">
      <ModuleFloor x={[-6, 6]} z={[8, 20]} module="floor_stone_module" />
      <Ceiling x={[-6, 6]} z={[8, 20]} height={H} color={PALETTE.wood} surface="CeilingWood" />

      <Wall axis="z" at={-6} from={8} to={20} height={H} surface="Plaster" />
      <Wall axis="z" at={6} from={8} to={20} height={H} surface="Plaster" />
      {/* 바깥 유리 미닫이 — 너머는 어둡다 */}
      <Wall axis="x" at={20} from={-6} to={6} height={H} color={PALETTE.woodDark} surface="WoodDark" />
      <Box position={[0, 1.3, 19.8]} size={[4, 2.2, 0.06]} color="#0d1114" roughness={0.1} solid={false} />

      {/* 탈의실 쪽 벽과 노렌 */}
      <Wall axis="x" at={8} from={-10} to={10} height={3.2} gaps={[[-1.5, 1.5]]} surface="Plaster" />
      <ModelBoundary label="noren">
        <Noren position={[0, 2.3, 8]} reduceMotion={reduceMotion} />
      </ModelBoundary>

      {/* 나무 열쇠 신발장 두 줄 — 벽 안쪽 면(±5.875)에 등을 대고 안쪽을 본다 */}
      {[-1, 1].map((side) =>
        [10.5, 14, 17.5].map((z) => (
          <Model
            key={`${side}:${z}`}
            name="shoe_locker"
            position={[side * 5.475, 0, z]}
            rotationY={side < 0 ? Math.PI / 2 : -Math.PI / 2}
          />
        )),
      )}

      {/* 신발 벗는 단 */}
      <Box position={[0, 0.08, 9.2]} size={[3.4, 0.16, 1.4]} color={PALETTE.woodDark} solid={false} surface="WoodDark" />

      <WarmLamp position={[0, H - 0.3, 17]} intensity={4} />
      <WarmLamp position={[0, H - 0.3, 11]} intensity={4} />
    </group>
  )
}
