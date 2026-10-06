import { useMemo } from 'react'
import * as THREE from 'three'
import { Box, Ceiling, Floor, PALETTE, Wall, WarmLamp, tileTexture } from '../BathKit'

const H = 3

/** 남색 노렌에 흰 'ゆ' — 탈의실로 들어가는 입구 표시. */
function norenTexture() {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 192
  const g = c.getContext('2d')!
  g.fillStyle = '#1f2f4f'
  g.fillRect(0, 0, 256, 192)
  g.fillStyle = '#f2efe6'
  g.font = 'bold 110px serif'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.fillText('ゆ', 128, 100)
  // 세 폭으로 갈라진 틈
  g.fillStyle = '#0c1220'
  for (const x of [85, 171]) g.fillRect(x - 1, 40, 2, 152)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/**
 * 노렌 입구·신발장(겐칸) — 원작의 정문 광장. 바깥 유리문은 열리지 않는다.
 * x[-6,6] · z[8,20]
 */
export function GenkanZone() {
  const floor = useMemo(() => tileTexture('#8d8a82', '#5d5a54', 6, [3, 3]), [])
  const noren = useMemo(() => norenTexture(), [])

  return (
    <group name="bathhouse-genkan">
      <Floor x={[-6, 6]} z={[8, 20]} map={floor} color="#ffffff" />
      <Ceiling x={[-6, 6]} z={[8, 20]} height={H} color={PALETTE.wood} />

      <Wall axis="z" at={-6} from={8} to={20} height={H} />
      <Wall axis="z" at={6} from={8} to={20} height={H} />
      {/* 바깥 유리 미닫이 — 너머는 어둡다 */}
      <Wall axis="x" at={20} from={-6} to={6} height={H} color={PALETTE.woodDark} />
      <Box position={[0, 1.3, 19.8]} size={[4, 2.2, 0.06]} color="#0d1114" roughness={0.1} solid={false} />

      {/* 탈의실 쪽 벽과 노렌 */}
      <Wall axis="x" at={8} from={-10} to={10} height={3.2} gaps={[[-1.5, 1.5]]} />
      <mesh position={[0, 1.85, 8.18]}>
        <planeGeometry args={[3, 0.9]} />
        <meshStandardMaterial map={noren} side={THREE.DoubleSide} roughness={0.95} />
      </mesh>

      {/* 나무 열쇠 신발장 두 줄 */}
      {[-5.45, 5.45].map((x) =>
        [10.5, 14, 17.5].map((z) => (
          <Box key={`${x}:${z}`} position={[x, 0.95, z]} size={[0.8, 1.9, 3]} color={PALETTE.wood} />
        )),
      )}

      {/* 신발 벗는 단 */}
      <Box position={[0, 0.08, 9.2]} size={[3.4, 0.16, 1.4]} color={PALETTE.woodDark} solid={false} />

      <WarmLamp position={[0, H - 0.3, 17]} intensity={4} />
      <WarmLamp position={[0, H - 0.3, 11]} intensity={4} />
    </group>
  )
}
