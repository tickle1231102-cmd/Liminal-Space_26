import { useMemo, type ReactNode } from 'react'
import {
  Baseboard,
  CEILING_H,
  CeilingSlab,
  FloorSlab,
  Fluorescent,
  Slab,
  WallPanel,
} from './SchoolKit'
import { noticeTexture, tileMap } from './schoolTextures'
import { useSchoolLights } from './SchoolProps'
import { CAFETERIA_GAP } from './CorridorZone'

/**
 * 급식실·매점 (원작의 먹거리 골목). 물리 오브젝트가 가장 많이 모이는 개방 공간.
 * 조리대는 불이 켜진 채 비어 있다 — 냄새가 나야 할 자리가 비어 있는 게 위화감의 핵심.
 */
export function CafeteriaZone({
  reduceMotion,
  children,
}: {
  reduceMotion: boolean
  children?: ReactNode
}) {
  const tile = useMemo(() => tileMap(16), [])
  const menu = useMemo(() => noticeTexture('오늘의 급식', '3월 2일 — 배식 완료'), [])
  const lights = useSchoolLights('cafeteria')

  const cx = 21.5
  const cz = -18
  const width = 24
  const depth = 26

  return (
    <group name="school-cafeteria">
      {/* 복도에서 들어오는 통로 */}
      <FloorSlab center={[6.75, -17]} width={5.5} depth={CAFETERIA_GAP[1] - CAFETERIA_GAP[0]} map={tile} color="#b3b0a4" />
      <CeilingSlab center={[6.75, -17]} width={5.5} depth={6} />
      <Slab position={[6.75, CEILING_H / 2, CAFETERIA_GAP[0]]} size={[5.5, CEILING_H, 0.24]} color="#c0bcae" />
      <Slab position={[6.75, CEILING_H / 2, CAFETERIA_GAP[1]]} size={[5.5, CEILING_H, 0.24]} color="#c0bcae" />

      <FloorSlab center={[cx, cz]} width={width} depth={depth} map={tile} color="#b3b0a4" />
      <CeilingSlab center={[cx, cz]} width={width} depth={depth} y={3.8} />

      {/* 사방 벽 — 복도 쪽 벽만 통로 폭만큼 나뉜다 */}
      <Slab position={[cx, 1.9, cz - depth / 2]} size={[width, 3.8, 0.3]} color="#c0bcae" />
      <Slab position={[cx, 1.9, cz + depth / 2]} size={[width, 3.8, 0.3]} color="#c0bcae" />
      <Slab position={[cx + width / 2, 1.9, cz]} size={[0.3, 3.8, depth]} color="#c0bcae" />
      <Slab position={[cx - width / 2, 1.9, -25.5]} size={[0.3, 3.8, 11]} color="#c0bcae" />
      <Slab position={[cx - width / 2, 1.9, -9.5]} size={[0.3, 3.8, 9]} color="#c0bcae" />
      <Baseboard position={[cx, 0.08, cz + depth / 2 - 0.2]} length={width} />

      {/* 창 — 바깥은 비어 있다 */}
      <mesh position={[cx + width / 2 - 0.2, 2.0, cz]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[depth - 3, 1.8]} />
        <meshStandardMaterial color="#0c1018" roughness={0.1} metalness={0.45} />
      </mesh>

      {/* 배식대 — 스테인리스, 조명만 켜진 빈 조리대 */}
      <group position={[cx - 6, 0, cz - 9]}>
        <Slab position={[0, 0.45, 0]} size={[10, 0.9, 1.1]} color="#aeb6bb" metalness={0.75} roughness={0.28} />
        <mesh position={[0, 0.92, 0]}>
          <boxGeometry args={[9.6, 0.05, 0.9]} />
          <meshStandardMaterial color="#c8d0d6" metalness={0.85} roughness={0.2} />
        </mesh>
        {/* 보온등 */}
        {[-3.5, 0, 3.5].map((x) => (
          <group key={x} position={[x, 2.1, 0]}>
            <mesh>
              <boxGeometry args={[1.6, 0.1, 0.4]} />
              <meshBasicMaterial color="#ffb877" toneMapped={false} />
            </mesh>
            <pointLight position={[0, -0.3, 0]} intensity={5} distance={7} decay={2} color="#ffb070" />
          </group>
        ))}
      </group>

      {/* 식탁 열 — 거시 구조라 재시드해도 고정 */}
      {[-6, -1, 4, 9].map((dz) =>
        [-5, 3].map((dx) => (
          <group key={`${dx}:${dz}`} position={[cx + dx, 0, cz + dz]}>
            <Slab position={[0, 0.72, 0]} size={[5.4, 0.08, 1.1]} color="#c2a067" roughness={0.7} />
            {([-2.3, 2.3] as const).map((x) => (
              <Slab key={x} position={[x, 0.36, 0]} size={[0.12, 0.72, 0.9]} color="#7b858c" metalness={0.5} roughness={0.4} />
            ))}
            {([-1.0, 1.0] as const).map((z) => (
              <Slab key={z} position={[0, 0.42, z]} size={[5.0, 0.07, 0.34]} color="#c2a067" roughness={0.7} />
            ))}
          </group>
        )),
      )}

      {/* 식판 반납대 + 메뉴판 */}
      <Slab position={[cx + 9, 0.55, cz + 10]} size={[2.4, 1.1, 1.0]} color="#8e979d" metalness={0.6} roughness={0.35} />
      <WallPanel position={[cx - 6, 2.4, cz - 9.7]} size={[2.0, 2.0]} map={menu} emissiveIntensity={0.18} />

      {/* 형광등 격자 */}
      {[-8, -2, 4, 10].map((dz, r) =>
        [-7, 7].map((dx, c) => {
          const l = lights[r * 2 + c]
          return (
            <Fluorescent
              key={`${dx}:${dz}`}
              position={[cx + dx, 3.66, cz + dz]}
              length={3.4}
              on={l?.on ?? true}
              flickerSeed={l?.flickerSeed}
              reduceMotion={reduceMotion}
              intensity={10}
            />
          )
        }),
      )}

      {children}
    </group>
  )
}
