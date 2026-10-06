import { MeshReflectorMaterial } from '@react-three/drei'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { Suspense, useMemo, type ReactNode } from 'react'
import { asphaltMap, neonSignTexture, roughnessNoise } from '../procTextures'
import { NeonBar } from '../Atmosphere'
import { GltfAsset, GltfInstances, ModuleRun, parkModel } from '../../../core/world/GltfAsset'

const BOLLARDS: [number, number, number][] = [-34, -28, -22, -16, -10, -4, 2, 8, 14].flatMap((z) =>
  [-3.9, 3.9].map((x): [number, number, number] => [x, 0, z]),
)

/** Perimeter fence line; panel module = W in art/blender/park/fence_panel.py */
function FenceRun({ from, to }: { from: [number, number]; to: [number, number] }) {
  return <ModuleRun url={parkModel('fence_panel')} from={from} to={to} module={2} height={2.3} thickness={0.28} />
}

export function PlazaZone({ children }: { children?: ReactNode }) {
  const asphalt = useMemo(() => asphaltMap(10), [])
  const rough = useMemo(() => roughnessNoise(8), [])
  const sign = useMemo(() => neonSignTexture('OPEN', '#140818', '#ff6ad5'), [])
  const sign2 = useMemo(() => neonSignTexture('TICKETS', '#0a1218', '#5ec8e8'), [])
  const signMidway = useMemo(() => neonSignTexture('MIDWAY', '#061018', '#5ec8e8'), [])

  return (
    <group name="plaza">
      <Suspense fallback={null}>
      {/* Explicit ground collider — do not rely on invisible mesh alone */}
      <RigidBody type="fixed" colliders={false} position={[0, 0, 0]}>
        <CuboidCollider args={[40, 0.5, 40]} position={[0, -0.5, 0]} friction={1.2} restitution={0} />
      </RigidBody>

      {/* Wet asphalt reflector */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[60, 60]} />
        <MeshReflectorMaterial
          map={asphalt}
          roughnessMap={rough}
          blur={[300, 80]}
          resolution={512}
          mixBlur={0.7}
          mixStrength={0.28}
          mirror={0.18}
          depthScale={0.45}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.2}
          color="#4a556c"
          metalness={0.25}
          roughness={0.82}
        />
      </mesh>

      {/* Ticket booth (art/blender/park/ticket_booth.py) */}
      <GltfAsset url={parkModel('ticket_booth')} position={[-10, 0, -8]} />
      {/* Neon signs */}
      <mesh position={[-10, 3.9, -6.2]}>
        <planeGeometry args={[2.2, 0.7]} />
        <meshStandardMaterial
          map={sign}
          emissiveMap={sign}
          emissive="#ffffff"
          emissiveIntensity={1.1}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[-7.6, 2.2, -8]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.6, 0.55]} />
        <meshStandardMaterial
          map={sign2}
          emissiveMap={sign2}
          emissive="#ffffff"
          emissiveIntensity={0.9}
          toneMapped={false}
        />
      </mesh>
      <NeonBar position={[-10, 3.55, -6.25]} color="#ff6ad5" size={[2.6, 0.06, 0.06]} />

      {/* Fountain (art/blender/park/fountain.py) */}
      <GltfAsset url={parkModel('fountain')} />
      <pointLight position={[0, 2.3, 0]} intensity={4} distance={10} color="#9ed0ff" />

      {/* Benches (art/blender/park/bench.py) */}
        <GltfAsset url={parkModel('bench')} position={[4.2, 0, 4.2]} rotationY={-Math.PI / 4} />
        <GltfAsset url={parkModel('bench')} position={[-4.2, 0, 4.2]} rotationY={Math.PI / 4} />

      {/* Lamp posts */}
      {[
        [-6, 8],
        [6, 8],
        [-6, -6],
        [8, -2],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <GltfAsset url={parkModel('lamp_post')} />
          <pointLight position={[0, 3.3, 0]} intensity={9} distance={16} color="#ffd8a0" />
        </group>
      ))}

      {/* Perimeter fences — south side opens onto the gate toward midway / ferris */}
      <FenceRun from={[-28, 28]} to={[28, 28]} />
      <FenceRun from={[-28, -28]} to={[-5.05, -28]} />
      <FenceRun from={[5.05, -28]} to={[28, -28]} />
      <FenceRun from={[-28, -28]} to={[-28, 28]} />
      <FenceRun from={[28, -28]} to={[28, 28]} />

      {/* Gate arch (art/blender/park/gate_arch.py); neon + sign stay in code */}
      <GltfAsset url={parkModel('gate_arch')} position={[0, 0, -28]} />
      <NeonBar position={[0, 3.65, -27.7]} color="#5ec8e8" size={[9.5, 0.08, 0.08]} />
      <NeonBar position={[-4.8, 2.2, -27.7]} color="#ff6ad5" size={[0.08, 2.4, 0.08]} rotation={[0, 0, 0]} />
      <NeonBar position={[4.8, 2.2, -27.7]} color="#ff6ad5" size={[0.08, 2.4, 0.08]} />
      <mesh position={[0, 3.95, -27.65]}>
        <planeGeometry args={[3.2, 0.55]} />
        <meshStandardMaterial
          map={signMidway}
          emissiveMap={signMidway}
          emissive="#ffffff"
          emissiveIntensity={1.15}
          toneMapped={false}
        />
      </mesh>
      <pointLight position={[0, 3.2, -26]} intensity={14} distance={18} color="#7ad8f0" decay={2} />

      {/* Path spawn → gate → midway (ferris) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, -8]} receiveShadow>
        <planeGeometry args={[7.2, 56]} />
        <meshStandardMaterial
          map={asphalt}
          color="#7a869c"
          roughness={0.72}
          metalness={0.06}
          emissive="#3a4558"
          emissiveIntensity={0.22}
        />
      </mesh>
      {/* Center dashed guide all the way to midway */}
      {[-36, -30, -24, -18, -12, -6, 0, 6, 12].map((z) => (
        <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.055, z]}>
          <planeGeometry args={[0.4, 1.6]} />
          <meshStandardMaterial
            color="#ffe6a8"
            emissive="#ffc06a"
            emissiveIntensity={1.1}
            toneMapped={false}
          />
        </mesh>
      ))}
      {/* Path edge strips */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-3.5, 0.05, -8]}>
        <planeGeometry args={[0.22, 56]} />
        <meshStandardMaterial color="#ffd28a" emissive="#ffb86a" emissiveIntensity={1.35} toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3.5, 0.05, -8]}>
        <planeGeometry args={[0.22, 56]} />
        <meshStandardMaterial color="#ffd28a" emissive="#ffb86a" emissiveIntensity={1.35} toneMapped={false} />
      </mesh>
      {/* Chevron arrows on path (point toward -Z / ferris) */}
      {[-32, -20, -10, 2].map((z) => (
        <group key={`chev-${z}`} position={[0, 0.06, z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.35]}>
            <planeGeometry args={[1.1, 0.35]} />
            <meshStandardMaterial color="#5ec8e8" emissive="#5ec8e8" emissiveIntensity={1.4} toneMapped={false} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, Math.PI / 4]} position={[-0.35, 0, 0.15]}>
            <planeGeometry args={[0.7, 0.28]} />
            <meshStandardMaterial color="#5ec8e8" emissive="#5ec8e8" emissiveIntensity={1.4} toneMapped={false} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, -Math.PI / 4]} position={[0.35, 0, 0.15]}>
            <planeGeometry args={[0.7, 0.28]} />
            <meshStandardMaterial color="#5ec8e8" emissive="#5ec8e8" emissiveIntensity={1.4} toneMapped={false} />
          </mesh>
        </group>
      ))}
      {/* Path bollard lights through gate */}
      <GltfInstances url={parkModel('bollard')} items={BOLLARDS.map((p) => ({ position: p }))} />
      {BOLLARDS.map(([x, , z]) => (
        <pointLight key={`${x}-${z}`} position={[x, 1, z]} intensity={4.5} distance={8} color="#ffe0b0" decay={2} />
      ))}

      </Suspense>
      {children}
    </group>
  )
}
