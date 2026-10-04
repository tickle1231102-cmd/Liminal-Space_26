import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { Suspense } from 'react'
import { NeonBar } from './Atmosphere'
import { GltfAsset, GltfInstances, ModuleRun, parkModel } from './GltfAsset'

const FIXTURES_Z = [-14, -7, 0, 7, 14]
const CRATES: [number, number, number][] = [
  [-2.2, 0, -8],
  [2.1, 0, 6],
  [-1.8, 0, 14],
  [1.6, 0, -14],
]

/** Backstage corridors — densest liminal feel. Modules from art/blender/park/backstage_*.py etc. */
export function BackstageZone() {
  const lit = FIXTURES_Z.filter((_, i) => i % 2 === 0)
  const dead = FIXTURES_Z.filter((_, i) => i % 2 === 1)

  return (
    <group name="backstage" position={[-42, 0, -10]}>
      <RigidBody type="fixed" colliders={false} position={[0, 0, 0]}>
        <CuboidCollider args={[16, 0.5, 22]} position={[0, -0.5, 0]} friction={1.2} />
      </RigidBody>
      <mesh receiveShadow position={[0, -0.25, 0]}>
        <boxGeometry args={[28, 0.5, 40]} />
        <meshStandardMaterial color="#10131a" roughness={0.95} />
      </mesh>
      {/* Ceiling slab */}
      <mesh position={[0, 4.5, 0]}>
        <boxGeometry args={[8.2, 0.2, 38]} />
        <meshStandardMaterial color="#0e1218" roughness={1} />
      </mesh>

      <Suspense fallback={null}>
        {/* Corridor walls (4 m modules) */}
        {([-4.2, 4.2] as const).map((x) => (
          <ModuleRun
            key={x}
            url={parkModel('backstage_wall')}
            from={[x, -19]}
            to={[x, 19]}
            module={4}
            height={4.6}
            thickness={0.45}
          />
        ))}
        {/* Uneven fluorescents: lit / dead fixtures alternate */}
        <GltfInstances url={parkModel('fluorescent')} items={lit.map((z) => ({ position: [0, 4.4, z] }))} />
        <GltfInstances url={parkModel('fluorescent_dead')} items={dead.map((z) => ({ position: [0, 4.4, z] }))} />
        {CRATES.map((p, i) => (
          <GltfAsset key={i} url={parkModel('road_case')} position={p} rotationY={i * 0.4 - 0.6} />
        ))}
      </Suspense>
      {lit.map((z) => (
        <pointLight key={z} position={[0, 4.25, z]} intensity={3.5} distance={10} color="#c8d4ff" decay={2} />
      ))}

      <NeonBar position={[-3.9, 2.8, -4]} rotation={[0, 0, Math.PI / 2]} color="#5ec8e8" size={[1.2, 0.04, 0.04]} />
      <mesh position={[0, 1.6, -18]} rotation={[0, 0, 0]}>
        <planeGeometry args={[2.4, 1.2]} />
        <meshStandardMaterial color="#2a3140" emissive="#445566" emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}
