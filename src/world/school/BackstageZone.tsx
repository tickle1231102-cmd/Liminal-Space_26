import { useMemo, type ReactNode } from 'react'
import {
  Baseboard,
  CEILING_H,
  CeilingSlab,
  Doorway,
  FloorSlab,
  Fluorescent,
  Slab,
  WallPanel,
} from './SchoolKit'
import { gymFloorMap, linoleumMap, noticeTexture } from './schoolTextures'
import { useSchoolLights } from './SchoolProps'
import { BACKSTAGE_GAP } from './CorridorZone'

/**
 * 강당·체육관 뒤편·방송실 (원작의 백스테이지). 리미널 효과가 가장 짙은 구역.
 * 아무도 없는 코트에 경기 중처럼 조명이 켜져 있고, 방송실 콘솔만 살아 있다.
 */
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
      <Slab position={[cx, gymH / 2, cz - depth / 2]} size={[width, gymH, 0.3]} color="#b9b3a2" />
      <Slab position={[cx, gymH / 2, cz + depth / 2]} size={[width, gymH, 0.3]} color="#b9b3a2" />
      <Slab position={[cx - width / 2, gymH / 2, cz]} size={[0.3, gymH, depth]} color="#b9b3a2" />
      <Slab position={[cx + width / 2, gymH / 2, cz - 8]} size={[0.3, gymH, 10]} color="#b9b3a2" />
      <Slab position={[cx + width / 2, gymH / 2, cz + 7]} size={[0.3, gymH, 12]} color="#b9b3a2" />
      <Baseboard position={[cx, 0.08, cz - depth / 2 + 0.2]} length={width} />

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

      {/* 농구 골대 양 끝 */}
      {([-1, 1] as const).map((s) => (
        <group key={`hoop${s}`} position={[cx, 0, cz + s * 10.5]}>
          <Slab position={[0, 1.7, 0]} size={[0.16, 3.4, 0.16]} color="#5e676d" metalness={0.6} roughness={0.35} />
          <Slab position={[0, 3.3, -s * 0.5]} size={[1.8, 1.1, 0.08]} color="#e6e2d6" roughness={0.5} />
          <mesh position={[0, 2.95, -s * 0.85]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.22, 0.26, 20]} />
            <meshStandardMaterial color="#d4642a" roughness={0.6} />
          </mesh>
        </group>
      ))}

      {/* 접혀 있는 관중석 */}
      <Slab position={[cx - 10.4, 0.9, cz]} size={[2.6, 1.8, depth - 4]} color="#7d6a52" roughness={0.85} />

      {/* 체육관 조명 — 경기 중처럼 전부 켜져 있다 */}
      {[-8, 0, 8].map((dz) =>
        [-6, 6].map((dx) => (
          <group key={`${dx}:${dz}`} position={[cx + dx, gymH - 0.4, cz + dz]}>
            <mesh>
              <boxGeometry args={[1.1, 0.16, 1.1]} />
              <meshBasicMaterial color="#fff6e0" toneMapped={false} />
            </mesh>
            <pointLight position={[0, -0.4, 0]} intensity={16} distance={18} decay={2} color="#ffeccc" />
          </group>
        )),
      )}

      {/* 방송실 — 체육관 뒤편으로 이어지는 작은 방 */}
      <group name="broadcast-room">
        <FloorSlab center={[cx + 15, cz]} width={8} depth={7} map={lino} color="#a8a496" />
        <CeilingSlab center={[cx + 15, cz]} width={8} depth={7} y={2.9} />
        <Slab position={[cx + 15, 1.45, cz - 3.5]} size={[8, 2.9, 0.24]} color="#b6b2a4" />
        <Slab position={[cx + 15, 1.45, cz + 3.5]} size={[8, 2.9, 0.24]} color="#b6b2a4" />
        <Slab position={[cx + 19, 1.45, cz]} size={[0.24, 2.9, 7]} color="#b6b2a4" />

        {/* 콘솔 — 유일하게 계속 살아 있는 장비 */}
        <Slab position={[cx + 17.6, 0.5, cz]} size={[1.0, 1.0, 4.2]} color="#39424a" metalness={0.45} roughness={0.45} />
        {[-1.2, 0, 1.2].map((dz) => (
          <mesh key={dz} position={[cx + 17.1, 1.02, cz + dz]}>
            <boxGeometry args={[0.22, 0.04, 0.6]} />
            <meshStandardMaterial color="#8ef0c8" emissive="#6ae0b0" emissiveIntensity={1.4} toneMapped={false} />
          </mesh>
        ))}
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
