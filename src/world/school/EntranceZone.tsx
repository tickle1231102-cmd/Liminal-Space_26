import { Suspense, useMemo, type ReactNode } from 'react'
import {
  CEILING_H,
  CeilingSlab,
  FloorSlab,
  Fluorescent,
  Slab,
  WallPanel,
  WallWithGap,
} from './SchoolKit'
import { GltfAsset, schoolModel } from '../GltfAsset'
import { linoleumMap, lockerLabelTexture, noticeTexture } from './schoolTextures'
import { useSchoolLights } from './SchoolProps'

/**
 * 현관·신발장 (원작의 정문 광장). 진입점이자 톤 설정 구역.
 * 바깥으로 나가는 유리문은 열리지 않고, 그 너머는 아무것도 보이지 않는다.
 */
export function EntranceZone({
  reduceMotion,
  children,
}: {
  reduceMotion: boolean
  children?: ReactNode
}) {
  const lino = useMemo(() => linoleumMap(9), [])
  const labels = useMemo(() => lockerLabelTexture(), [])
  const notice = useMemo(
    () => noticeTexture('하교 지도 안내', '3월 2일 (금) — 19:00 완료'),
    [],
  )
  const lights = useSchoolLights('entrance')

  return (
    <group name="school-entrance">
      <FloorSlab center={[0, 13]} width={18} depth={18} map={lino} color="#a8a496" />
      <CeilingSlab center={[0, 13]} width={18} depth={18} />

      {/* 바깥 유리문 — 통과할 수 없고 너머는 비어 있다 */}
      <Suspense fallback={null}>
        <GltfAsset url={schoolModel('glass_front')} position={[0, 0, 22]} />
      </Suspense>

      {/* 좌우 벽 */}
      <Slab position={[-9, CEILING_H / 2, 13]} size={[0.3, CEILING_H, 18]} color="#c0bcae" />
      <Slab position={[9, CEILING_H / 2, 13]} size={[0.3, CEILING_H, 18]} color="#c0bcae" />

      {/* 중앙 복도로 이어지는 개구부 */}
      <WallWithGap z={4} from={-9} to={9} gapFrom={-3} gapTo={3} />

      {/* 신발장 — 좌우 두 줄, 이름표 일부가 뜯겨 있다 */}
      {([-7.2, 7.2] as const).map((x) =>
        [8.5, 12.5, 16.5].map((z) => (
          <group key={`${x}:${z}`}>
            <Suspense fallback={null}>
              <GltfAsset url={schoolModel('shoe_locker')} position={[x, 0, z]} rotationY={x > 0 ? Math.PI : 0} />
            </Suspense>
            <WallPanel
              position={[x > 0 ? x - 0.72 : x + 0.72, 1.1, z]}
              rotationY={x > 0 ? -Math.PI / 2 : Math.PI / 2}
              size={[3.0, 1.5]}
              map={labels}
            />
          </group>
        )),
      )}

      {/* 게시판 — 날짜가 어긋난 공지문 */}
      <WallPanel position={[-5.5, 1.75, 3.82]} size={[1.5, 1.5]} map={notice} emissiveIntensity={0.16} />

      {/* 형광등 두 줄 */}
      {[8, 12, 16, 20].map((z, i) => (
        <Fluorescent
          key={z}
          position={[0, CEILING_H - 0.12, z]}
          length={3.2}
          on={lights[i]?.on ?? true}
          flickerSeed={lights[i]?.flickerSeed}
          reduceMotion={reduceMotion}
        />
      ))}

      {children}
    </group>
  )
}
