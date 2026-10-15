import { useMemo } from 'react'
import * as THREE from 'three'
import { Box, Ceiling, Model, ModuleFloor, PALETTE, Wall, WarmLamp } from '../BathKit'

const H = 3

/** 노렌 — 남탕은 남색 바탕에 '男', 여탕은 붉은 바탕에 '女'. */
function norenTexture(bg: string, char: string, slit: string) {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 192
  const g = c.getContext('2d')!
  g.fillStyle = bg
  g.fillRect(0, 0, 256, 192)
  g.fillStyle = '#f2efe6'
  g.font = 'bold 110px serif'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.fillText(char, 128, 100)
  // 세 폭으로 갈라진 틈
  g.fillStyle = slit
  for (const x of [85, 171]) g.fillRect(x - 1, 40, 2, 152)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/**
 * 노렌 입구·신발장(겐칸) — 원작의 정문 광장. 바깥 유리문은 열리지 않는다.
 * 남탕(男)·여탕(女) 노렌은 북서쪽 모서리에서 갈라지고, 그 안쪽 칸막이 위에 반다이가 걸터앉는다.
 * x[-6,6] · z[8,20]
 */
export function GenkanZone() {
  const noren = useMemo(() => norenTexture('#1f2f4f', '男', '#0c1220'), [])
  const norenWomen = useMemo(() => norenTexture('#8a2a2a', '女', '#3a0f10'), [])

  return (
    <group name="bathhouse-genkan">
      <ModuleFloor x={[-6, 6]} z={[8, 20]} module="floor_stone_module" />
      <Ceiling x={[-6, 6]} z={[8, 20]} height={H} color={PALETTE.wood} surface="CeilingWood" />

      {/* 서쪽 벽 — 여탕 통로(z 8.6~11.4)로 이어지는 붉은 노렌 */}
      <Wall axis="z" at={-6} from={8} to={20} height={H} gaps={[[8.6, 11.4]]} surface="Plaster" />
      <mesh position={[-6.18, 1.85, 10]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[2.8, 0.9]} />
        <meshStandardMaterial map={norenWomen} side={THREE.DoubleSide} roughness={0.95} />
      </mesh>
      <Wall axis="z" at={6} from={8} to={20} height={H} surface="Plaster" />
      {/* 바깥 유리 미닫이 — 너머는 어둡다 */}
      <Wall axis="x" at={20} from={-6} to={6} height={H} color={PALETTE.woodDark} surface="WoodDark" />
      <Box position={[0, 1.3, 19.8]} size={[4, 2.2, 0.06]} color="#0d1114" roughness={0.1} solid={false} />

      {/* 남탕 탈의실 쪽 벽과 노렌 — 여탕 노렌과 모서리를 맞대고 반다이 쪽으로 붙는다 */}
      <Wall axis="x" at={8} from={-10} to={10} height={3.2} gaps={[[-5.6, -2.6]]} surface="Plaster" />
      <mesh position={[-4.1, 1.85, 8.18]}>
        <planeGeometry args={[3, 0.9]} />
        <meshStandardMaterial map={noren} side={THREE.DoubleSide} roughness={0.95} />
      </mesh>

      {/* 나무 열쇠 신발장 두 줄 — 벽 안쪽 면(±5.875)에 등을 대고 안쪽을 본다. 서쪽 첫 칸은 여탕 통로 자리 */}
      {[-1, 1].map((side) =>
        (side < 0 ? [14, 17.5] : [10.5, 14, 17.5]).map((z) => (
          <Model
            key={`${side}:${z}`}
            name="shoe_locker"
            position={[side * 5.475, 0, z]}
            rotationY={side < 0 ? Math.PI / 2 : -Math.PI / 2}
          />
        )),
      )}

      {/* 신발 벗는 단 — 두 노렌 앞 모서리를 한 장으로 덮는다 */}
      <Box position={[-4.1375, 0.08, 9.8625]} size={[3.475, 0.16, 3.475]} color={PALETTE.woodDark} solid={false} surface="WoodDark" />

      <WarmLamp position={[0, H - 0.3, 17]} intensity={4} />
      <WarmLamp position={[0, H - 0.3, 11]} intensity={4} />
    </group>
  )
}
