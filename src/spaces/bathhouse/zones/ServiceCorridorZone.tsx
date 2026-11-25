import { Box, Ceiling, Floor, PALETTE, Wall, WarmLamp } from '../BathKit'

const H = 2.4
const WALL = '#7a756c'
/** 철창 — 보일러실 북쪽 벽(z=-36)의 x 15~17 구간. 보이지만 지나갈 수 없다 */
const GRILLE: [number, number] = [15, 17]

/**
 * 배관 복도 — 여탕 욕실 서쪽 문(x=-42, z -34~-32)에서 두 벽화 뒤를 지나 보일러실까지 이어지는 낮은 콘크리트 통로.
 * 끝은 철창이라 보일러는 보이지만 들어갈 수 없다 — 남탕·여탕은 겐칸으로만 오간다.
 * 본선 x[-45,18]·z[-39,-36], 서쪽 다리 x[-45,-42]·z[-36,-31].
 */
export function ServiceCorridorZone() {
  return (
    <group name="bathhouse-service-corridor">
      <Floor x={[-45, 18]} z={[-39, -36]} color={PALETTE.concrete} surface="Concrete" />
      <Floor x={[-45, -42]} z={[-36, -31]} color={PALETTE.concrete} surface="Concrete" />
      <Ceiling x={[-45, 18]} z={[-39, -36]} height={H} color="#4a4844" surface="Concrete" />
      <Ceiling x={[-45, -42]} z={[-36, -31]} height={H} color="#4a4844" surface="Concrete" />

      {/* 바깥 벽. 남쪽은 두 욕실의 벽화 벽과 보일러실 북쪽 벽, 서쪽 다리의 동쪽은 여탕 욕실 서쪽 벽 */}
      <Wall axis="z" at={-45} from={-39} to={-31} height={H} color={WALL} surface="Concrete" />
      <Wall axis="x" at={-31} from={-45} to={-42} height={H} color={WALL} surface="Concrete" />
      <Wall axis="x" at={-39} from={-45} to={18} height={H} color={WALL} surface="Concrete" />
      <Wall axis="z" at={18} from={-39} to={-36} height={H} color={WALL} surface="Concrete" />

      {/* 천장을 따라 끝까지 가는 배관 세 줄 */}
      {[-38.6, -38.35, -38.1].map((z, i) => (
        <mesh key={z} position={[-13.5, H - 0.18 - i * 0.07, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.07 - i * 0.015, 0.07 - i * 0.015, 63, 10]} />
          <meshStandardMaterial color="#8a7f6c" roughness={0.6} metalness={0.4} />
        </mesh>
      ))}

      {/* 철창 — 세로 쇠살 + 충돌 판 */}
      <Box position={[(GRILLE[0] + GRILLE[1]) / 2, 1.15, -36]} size={[GRILLE[1] - GRILLE[0], 2.3, 0.08]} visible={false} />
      {Array.from({ length: 15 }, (_, i) => GRILLE[0] + 0.07 + i * ((GRILLE[1] - GRILLE[0] - 0.14) / 14)).map((x) => (
        <mesh key={x} position={[x, 1.15, -36]}>
          <cylinderGeometry args={[0.012, 0.012, 2.3, 6]} />
          <meshStandardMaterial color="#3a3836" roughness={0.5} metalness={0.7} />
        </mesh>
      ))}
      {[0.12, 1.2, 2.24].map((y) => (
        <Box key={y} position={[(GRILLE[0] + GRILLE[1]) / 2, y, -36]} size={[GRILLE[1] - GRILLE[0], 0.04, 0.05]} color="#3a3836" solid={false} />
      ))}

      {/* 드문드문 켜진 등 — 가운데 구간은 어둡다 */}
      <WarmLamp position={[-43.5, H - 0.25, -33]} intensity={2} distance={7} color="#ffc08a" />
      <WarmLamp position={[-30, H - 0.25, -37.5]} intensity={1.6} distance={7} color="#ffc08a" />
      <WarmLamp position={[4, H - 0.25, -37.5]} intensity={1.6} distance={7} color="#ffc08a" />
      <WarmLamp position={[16, H - 0.25, -37.5]} intensity={2.2} distance={7} color="#ffb070" />
    </group>
  )
}
