import { Box, Ceiling, Floor, Model, PALETTE, Wall, WarmLamp } from '../BathKit'

const H = 2.6

/**
 * 보일러실·사우나 — 원작의 백스테이지. 천장이 낮고 배관이 지나가는 가장 짙은 구역.
 * x[14,26] · z[-36,-20]
 */
export function BoilerZone() {
  return (
    <group name="bathhouse-boiler">
      <Floor x={[14, 26]} z={[-36, -20]} color={PALETTE.concrete} surface="Concrete" />
      <Ceiling x={[14, 26]} z={[-36, -20]} height={H} color="#4a4844" surface="Concrete" />

      <Wall axis="z" at={26} from={-36} to={-20} height={H} color="#7a756c" surface="Concrete" />
      <Wall axis="x" at={-36} from={14} to={26} height={H} color="#7a756c" surface="Concrete" />
      <Wall axis="x" at={-20} from={14} to={26} height={H} color="#7a756c" surface="Concrete" />

      {/* 보일러 본체 — art/blender/bathhouse/boiler.py */}
      <Model name="boiler" position={[22.5, 0, -32]} />

      {/* 천장을 지나는 배관 */}
      {[-0.5, 0.1, 0.7].map((dx, i) => (
        <mesh key={i} position={[20 + dx, H - 0.25 - i * 0.08, -28]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 16, 10]} />
          <meshStandardMaterial color="#8a7f6c" roughness={0.6} metalness={0.4} />
        </mesh>
      ))}

      {/* 사우나 부스 — 문은 열려 있다 */}
      <Wall axis="x" at={-24} from={16} to={21} height={2.3} gaps={[[17, 18.2]]} color={PALETTE.woodDark} surface="Hinoki" />
      <Wall axis="z" at={21} from={-24} to={-20.2} height={2.3} color={PALETTE.woodDark} surface="Hinoki" />
      <Box position={[18.5, 0.25, -21]} size={[4.6, 0.5, 1]} color={PALETTE.wood} surface="Hinoki" />
      <WarmLamp position={[18.5, 2, -22]} intensity={2.5} distance={5} color="#ff9a5a" />

      <WarmLamp position={[18, H - 0.25, -30]} intensity={2.4} distance={9} color="#ffb070" />
    </group>
  )
}
