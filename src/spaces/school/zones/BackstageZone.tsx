import { Suspense, useMemo, type ReactNode } from 'react'
import {
  CEILING_H,
  CeilingSlab,
  Doorway,
  FloorSlab,
  Fluorescent,
  Slab,
  WallSlab,
  WallPanel,
} from '../SchoolKit'
import { GltfAsset, GltfInstances, schoolModel } from '../../../core/world/GltfAsset'
import { gymFloorMap, linoleumMap, noticeTexture } from '../schoolTextures'
import { useSchoolLights } from '../SchoolProps'
import { BACKSTAGE_GAP } from './CorridorZone'

/**
 * 강당·체육관 뒤편·방송실 (원작의 백스테이지). 리미널 효과가 가장 짙은 구역.
 * 아무도 없는 코트에 경기 중처럼 조명이 켜져 있고, 방송실 콘솔만 살아 있다.
 */
const GYM_LIGHTS: Array<[number, number]> = [-8, 0, 8].flatMap((dz) => [-6, 6].map((dx): [number, number] => [dx, dz]))

export function BackstageZone({
  reduceMotion,
  children,
}: {
  reduceMotion: boolean
  children?: ReactNode
}) {
  const wood = useMemo(() => gymFloorMap(10), [])
  const lino = useMemo(() => linoleumMap(6), [])
  const notice = useMemo(() => noticeTexture('방송 순서', '종례 — 하교 — 소등'), [])
  const lights = useSchoolLights('backstage')

  const cx = -21
  const cz = -39.5
  const width = 24
  const depth = 26
  const gymH = 6.6

  return (
    <group name="school-backstage">
      {/* 복도에서 들어오는 통로 */}
      <FloorSlab center={[-6.5, -41]} width={5} depth={BACKSTAGE_GAP[1] - BACKSTAGE_GAP[0]} map={lino} color="#a8a496" />
      <CeilingSlab center={[-6.5, -41]} width={5} depth={6} />
      <Slab position={[-6.5, CEILING_H / 2, BACKSTAGE_GAP[0]]} size={[5, CEILING_H, 0.24]} color="#c0bcae" />
      <Slab position={[-6.5, CEILING_H / 2, BACKSTAGE_GAP[1]]} size={[5, CEILING_H, 0.24]} color="#c0bcae" />
      <Doorway position={[-9.6, 0, -41.9]} rotationY={Math.PI / 2} width={1.9} />

      {/* 체육관 본체 */}
      <FloorSlab center={[cx, cz]} width={width} depth={depth} map={wood} color="#b2905c" />
      <CeilingSlab center={[cx, cz]} width={width} depth={depth} y={gymH} />
      <WallSlab position={[cx, gymH / 2, cz - depth / 2]} size={[width, gymH, 0.3]} module="gym" />
      <WallSlab position={[cx, gymH / 2, cz + depth / 2]} size={[width, gymH, 0.3]} module="gym" />
      <WallSlab position={[cx - width / 2, gymH / 2, cz]} size={[0.3, gymH, depth]} module="gym" />
      <WallSlab position={[cx + width / 2, gymH / 2, cz - 8]} size={[0.3, gymH, 10]} module="gym" />
      <WallSlab position={[cx + width / 2, gymH / 2, cz + 7]} size={[0.3, gymH, 12]} module="gym" />

      {/* 코트 라인 — 거시 구조, 재시드해도 고정 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, 0.02, cz]}>
        <ringGeometry args={[2.0, 2.12, 48]} />
        <meshStandardMaterial color="#e8e2d0" roughness={0.8} />
      </mesh>
      {([-1, 1] as const).map((s) => (
        <mesh key={s} rotation={[-Math.PI / 2, 0, 0]} position={[cx, 0.02, cz + s * 9]}>
          <planeGeometry args={[18, 0.14]} />
          <meshStandardMaterial color="#e8e2d0" roughness={0.8} />
        </mesh>
      ))}

      <Suspense fallback={null}>
        {/* 농구 골대 양 끝 — 백보드가 코트 안쪽을 본다 */}
        {([-1, 1] as const).map((s) => (
          <GltfAsset
            key={`hoop${s}`}
            url={schoolModel('basketball_hoop')}
            position={[cx, 0, cz + s * 10.5]}
            rotationY={s > 0 ? 0 : Math.PI}
          />
        ))}
        {/* 접혀 있는 관중석 */}
        <GltfAsset url={schoolModel('bleachers')} position={[cx - 10.4, 0, cz]} />
        {/* 체육관 조명 — 경기 중처럼 전부 켜져 있다 */}
        <GltfInstances url={schoolModel('gym_light')} items={GYM_LIGHTS.map(([dx, dz]) => ({ position: [cx + dx, gymH - 0.4, cz + dz] }))} />
      </Suspense>
      {GYM_LIGHTS.map(([dx, dz]) => (
        <pointLight key={`${dx}:${dz}`} position={[cx + dx, gymH - 0.8, cz + dz]} intensity={16} distance={18} decay={2} color="#ffeccc" />
      ))}

      {/* 방송실 — 체육관 뒤편으로 이어지는 작은 방 */}
      <group name="broadcast-room">
        <FloorSlab center={[cx + 15, cz]} width={8} depth={7} map={lino} color="#a8a496" />
        <CeilingSlab center={[cx + 15, cz]} width={8} depth={7} y={2.9} />
        <Slab position={[cx + 15, 1.45, cz - 3.5]} size={[8, 2.9, 0.24]} color="#b6b2a4" />
        <Slab position={[cx + 15, 1.45, cz + 3.5]} size={[8, 2.9, 0.24]} color="#b6b2a4" />
        <Slab position={[cx + 19, 1.45, cz]} size={[0.24, 2.9, 7]} color="#b6b2a4" />

        {/* 콘솔 — 유일하게 계속 살아 있는 장비 */}
        <Suspense fallback={null}>
          <GltfAsset url={schoolModel('broadcast_console')} position={[cx + 17.6, 0, cz]} />
        </Suspense>
        <pointLight position={[cx + 17, 1.5, cz]} intensity={3.5} distance={6} decay={2} color="#8ef0c8" />
        <WallPanel
          position={[cx + 15, 1.8, cz - 3.3]}
          size={[1.4, 1.4]}
          map={notice}
          emissiveIntensity={0.16}
        />
        <Fluorescent
          position={[cx + 15, 2.76, cz]}
          length={2.2}
          on={lights[6]?.on ?? true}
          flickerSeed={lights[6]?.flickerSeed}
          reduceMotion={reduceMotion}
          intensity={7}
        />
      </group>

      {/* 방송실로 가는 짧은 복도 */}
      <FloorSlab center={[cx + 10.5, cz]} width={5} depth={4} map={lino} color="#a8a496" />
      <CeilingSlab center={[cx + 10.5, cz]} width={5} depth={4} y={2.9} />

      {children}
    </group>
  )
}
