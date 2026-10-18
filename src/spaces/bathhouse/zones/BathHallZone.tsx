import { Box, Ceiling, LAMP_WOMEN, Model, ModuleFloor, PARTITION_TOP, TileWall, WarmLamp } from '../BathKit'
import { Water } from '../Water'
import { SHOWER_Z } from '../createBathDecor'
import { Steam } from '../Steam'
import type { SpaceWorldProps } from '../../types'

const H = 6
/** 대욕조: 걸어 들어가는 얕은 탕 (바닥 -0.6, 수면 -0.12). */
const TUB_M = { x: [-10, 4] as [number, number], z: [-34, -27] as [number, number], bottom: -0.6, water: -0.12 }
/** 경사 1:4 */
const RAMP_ANGLE = Math.atan2(0.8, 3.2)
/** 열탕: 테두리가 높아 들어가지 않는다. */
const HOT_M = { x: [6, 11] as [number, number], z: [-34, -29] as [number, number], rim: 0.55 }

/** 여탕 욕실은 남탕 욕실을 칸막이 타일벽(x=-14) 기준으로 거울 반전한 것. */
const MIRROR_X = -14
type Side = 'men' | 'women'
const mirrorX = (side: Side) => (x: number) => (side === 'women' ? 2 * MIRROR_X - x : x)
const mirrorRange = (side: Side, [a, b]: [number, number]): [number, number] => {
  const m = mirrorX(side)
  return side === 'women' ? [m(b), m(a)] : [a, b]
}

/**
 * 욕실 — 원작의 먹거리 골목. 천장이 높고 넓으며 물리 오브젝트가 모이는 곳.
 * 남탕 x[-14,14] · z[-36,-10], 여탕 x[-42,-14] · z[-36,-10] (거울상, 칸막이 공유)
 */
export function BathHallZone({
  reduceMotion,
  quality,
  side = 'men',
}: Pick<SpaceWorldProps, 'reduceMotion' | 'quality'> & { side?: Side }) {
  const steam = quality === 'high' ? 1 : 0.35
  const mx = mirrorX(side)
  const rot = (r: number) => (side === 'women' ? -r : r)
  const women = side === 'women'
  const HALL = mirrorRange(side, [-14, 14])
  const TUB = { ...TUB_M, x: mirrorRange(side, TUB_M.x) }
  const HOT = { ...HOT_M, x: mirrorRange(side, HOT_M.x) }
  const id = (k: string) => (women ? `women-${k}` : k)
  const lampColor = women ? LAMP_WOMEN : undefined
  const tubCenter: [number, number, number] = [(TUB.x[0] + TUB.x[1]) / 2, 0, (TUB.z[0] + TUB.z[1]) / 2]
  const hotCenter: [number, number, number] = [(HOT.x[0] + HOT.x[1]) / 2, 0, (HOT.z[0] + HOT.z[1]) / 2]

  return (
    <group name={women ? 'bathhouse-women-hall' : 'bathhouse-hall'}>
      {/* 대욕조 구멍을 남기고 바닥을 네 조각으로 (1 m 타일 모듈) */}
      <ModuleFloor x={HALL} z={[-27, -10]} module="floor_tile_module" />
      <ModuleFloor x={HALL} z={[-36, -34]} module="floor_tile_module" />
      <ModuleFloor x={[HALL[0], TUB.x[0]]} z={TUB.z} module="floor_tile_module" />
      <ModuleFloor x={[TUB.x[1], HALL[1]]} z={TUB.z} module="floor_tile_module" />
      <Ceiling x={HALL} z={[-36, -10]} height={H} color="#cfd6d4" surface="Plaster" />

      {/* 대욕조 — 겉모습은 art/blender/bathhouse/tub.py, 충돌은 여기서 (바닥·안쪽 벽·경사로) */}
      <Model name="tub" position={tubCenter} />
      <Box position={[tubCenter[0], TUB.bottom - 0.1, tubCenter[2]]} size={[TUB.x[1] - TUB.x[0], 0.2, TUB.z[1] - TUB.z[0]]} visible={false} />
      {(
        [
          [[tubCenter[0], TUB.z[1]], [TUB.x[1] - TUB.x[0], 0.1]],
          [[tubCenter[0], TUB.z[0]], [TUB.x[1] - TUB.x[0], 0.1]],
          [[TUB.x[0], tubCenter[2]], [0.1, TUB.z[1] - TUB.z[0]]],
          [[TUB.x[1], tubCenter[2]], [0.1, TUB.z[1] - TUB.z[0]]],
        ] as const
      ).map(([[cx, cz], [w, d]]) => (
        <Box key={`${cx}:${cz}`} position={[cx, TUB.bottom / 2, cz]} size={[w, -TUB.bottom, d]} visible={false} />
      ))}
      {/* 경사로 — 플레이어 발 콜라이더는 계단을 못 오르므로 경사로. 윗면이 가장자리(y=0)에서 시작해 탕 바닥 아래로 묻힌다.
          tub 모델은 반전하지 않으므로 모델 로컬 x 0.8..3.2(중심 +2)에 맞춘다 */}
      <Box
        position={[tubCenter[0] + 2, -0.4 - 0.1 * Math.cos(RAMP_ANGLE), TUB.z[1] - 1.6]}
        size={[2.4, 0.2, Math.hypot(3.2, 0.8)]}
        rotation={[-RAMP_ANGLE, 0, 0]}
        visible={false}
      />
      <Water id={id('tub')} x={TUB.x} z={TUB.z} y={TUB.water} floor={TUB.bottom} reduceMotion={reduceMotion} />
      <Steam x={TUB.x} z={TUB.z} y={TUB.water} count={Math.round(90 * steam)} reduceMotion={reduceMotion} />

      {/* 열탕 — 높은 테두리, 콜라이더는 모델의 COL_* */}
      <Model name="hot_tub" position={hotCenter} />
      <Water
        id={id('hot')}
        x={[HOT.x[0] + 0.25, HOT.x[1] - 0.25]}
        z={[HOT.z[0] + 0.25, HOT.z[1] - 0.25]}
        y={HOT.rim - 0.08}
        floor={0}
        color="#5a9a94"
        reduceMotion={reduceMotion}
      />
      {/* 열탕은 김이 더 짙다 */}
      <Steam x={[HOT.x[0] + 0.3, HOT.x[1] - 0.3]} z={[HOT.z[0] + 0.3, HOT.z[1] - 0.3]} y={HOT.rim - 0.08} count={Math.round(60 * steam)} opacity={0.08} reduceMotion={reduceMotion} />

      {/* 좌식 샤워 — 서쪽 벽면(모델 뒷면이 벽 안쪽 면에 붙는다)과 가운데 등 맞댄 섬 */}
      {SHOWER_Z.map((z) => (
        <Model key={`w${z}`} name="shower_unit" position={[mx(-13.875), 0, z]} rotationY={rot(Math.PI / 2)} />
      ))}
      {[-20.6, -18, -15.4].map((z) => (
        <group key={`i${z}`}>
          <Model name="shower_unit" position={[mx(7), 0, z]} rotationY={Math.PI / 2} />
          <Model name="shower_unit" position={[mx(7), 0, z]} rotationY={-Math.PI / 2} />
        </group>
      ))}

      {women ? (
        <>
          {/* 여탕 벽: 서쪽 외벽, 북쪽(벽화). 동쪽은 남탕 서쪽 벽(칸막이)을 공유 */}
          {/* 서쪽 벽 — 보일러실로 가는 배관 복도 문(z -34~-32) */}
          <TileWall axis="z" at={mx(14)} from={-36} to={-10} gaps={[[-34, -32]]} />
          <TileWall axis="x" at={-36} from={HALL[0]} to={HALL[1]} />
          {/* 후지산 대신 새벽 바다와 섬 — art/blender/bathhouse/mural_sea.py */}
          <Model name="mural_sea" position={[mx(0), 3.6, -35.86]} />
        </>
      ) : (
        <>
          {/* 벽: 서쪽(여탕과의 칸막이 — 천장 1.8 m 아래에서 끊긴다), 동쪽(보일러실 문), 북쪽(벽화) */}
          <TileWall axis="z" at={MIRROR_X} from={-36} to={-10} partition />
          {/* 양쪽 탕의 김이 칸막이 위로 넘실댄다 */}
          <Steam x={[MIRROR_X - 1.2, MIRROR_X + 1.2]} z={[-34, -12]} y={PARTITION_TOP - 0.9} count={Math.round(70 * steam)} opacity={0.05} reduceMotion={reduceMotion} />
          <TileWall axis="z" at={14} from={-36} to={-10} gaps={[[-30, -28]]} />
          <TileWall axis="x" at={-36} from={-14} to={14} />
          <Model name="mural" position={[0, 3.6, -35.86]} />
        </>
      )}

      <WarmLamp position={[mx(-6), H - 0.5, -16]} intensity={7} distance={14} color={lampColor} />
      <WarmLamp position={[mx(6), H - 0.5, -16]} intensity={7} distance={14} color={lampColor} />
      <WarmLamp position={[mx(-4), H - 0.5, -30]} intensity={8} distance={14} color={lampColor} />
      <WarmLamp position={[mx(8), H - 0.5, -31]} intensity={6} distance={12} color={lampColor} />
    </group>
  )
}
