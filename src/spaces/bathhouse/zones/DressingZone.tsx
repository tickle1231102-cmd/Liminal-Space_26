import { useMemo } from 'react'
import { Box, Ceiling, Floor, PALETTE, Wall, WarmLamp, tileTexture } from '../BathKit'

const H = 3.2

/**
 * 반다이·탈의실 — 원작의 미드웨이. 배회의 중심축.
 * x[-10,10] · z[-10,8]
 */
export function DressingZone() {
  const floor = useMemo(() => tileTexture('#b39a74', '#7d6a50', 4, [5, 4]), [])

  return (
    <group name="bathhouse-dressing">
      <Floor x={[-10, 10]} z={[-10, 8]} map={floor} color="#ffffff" />
      <Ceiling x={[-10, 10]} z={[-10, 8]} height={H} />

      <Wall axis="z" at={-10} from={-10} to={8} height={H} />
      <Wall axis="z" at={10} from={-10} to={8} height={H} />

      {/* 반다이 — 남탕/여탕을 함께 내려다보는 높은 접수대 */}
      <Box position={[3.2, 0.6, 6.4]} size={[1.6, 1.2, 1.2]} color={PALETTE.woodDark} />
      <Box position={[3.2, 1.25, 6.4]} size={[1.8, 0.08, 1.4]} color={PALETTE.wood} />

      {/* 나무 락커 — 좌우 벽면 */}
      {[-9.55, 9.55].map((x) =>
        [-6, -2, 2].map((z) => (
          <Box key={`${x}:${z}`} position={[x, 1, z]} size={[0.7, 2, 3.4]} color={PALETTE.wood} />
        )),
      )}

      {/* 가운데 평상 두 개 */}
      <Box position={[-2.6, 0.22, -1]} size={[1.2, 0.44, 4]} color={PALETTE.wood} />
      <Box position={[2.6, 0.22, -1]} size={[1.2, 0.44, 4]} color={PALETTE.wood} />

      {/* 우유 냉장고 — 안쪽에서 희미하게 빛난다 */}
      <Box
        position={[-8.6, 0.9, 6.6]}
        size={[1, 1.8, 0.8]}
        color="#e8eef0"
        emissive="#cfe8ff"
        emissiveIntensity={0.25}
      />

      {/* 욕실로 이어지는 유리 미닫이 벽 (높이는 욕실 천장까지) */}
      <Wall
        axis="x"
        at={-10}
        from={-14}
        to={14}
        height={6}
        gaps={[[-2, 2]]}
        color={PALETTE.tileWhite}
      />

      <WarmLamp position={[0, H - 0.3, 3]} intensity={5} />
      <WarmLamp position={[0, H - 0.3, -5]} intensity={5} />
      <WarmLamp position={[-6, H - 0.3, -1]} intensity={3} />
      <WarmLamp position={[6, H - 0.3, -1]} intensity={3} />
    </group>
  )
}
