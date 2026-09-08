import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { NeonBar } from './Atmosphere'

/** Backstage corridors — densest liminal feel. */
export function BackstageZone() {
  return (
    <group name="backstage" position={[-42, 0, -10]}>
      <RigidBody type="fixed" colliders={false} position={[0, 0, 0]}>
        <CuboidCollider args={[16, 0.5, 22]} position={[0, -0.5, 0]} friction={1.2} />
      </RigidBody>
      <mesh receiveShadow position={[0, -0.25, 0]}>
        <boxGeometry args={[28, 0.5, 40]} />
        <meshStandardMaterial color="#10131a" roughness={0.95} />
      </mesh>

      {/* Corridor walls */}
      <RigidBody type="fixed" colliders="cuboid" position={[-4.2, 2.3, 0]}>
        <mesh>
          <boxGeometry args={[0.45, 4.6, 38]} />
          <meshStandardMaterial color="#1a2030" roughness={0.9} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid" position={[4.2, 2.3, 0]}>
        <mesh>
          <boxGeometry args={[0.45, 4.6, 38]} />
          <meshStandardMaterial color="#1a2030" roughness={0.9} />
        </mesh>
      </RigidBody>

      {/* Ceiling slabs */}
      <mesh position={[0, 4.5, 0]}>
        <boxGeometry args={[8.2, 0.2, 38]} />
        <meshStandardMaterial color="#0e1218" roughness={1} />
      </mesh>

      {/* Uneven fluorescents */}
      {[-14, -7, 0, 7, 14].map((z, i) => (
        <group key={z} position={[0, 4.25, z]}>
          <mesh>
            <boxGeometry args={[2.6, 0.06, 0.32]} />
            <meshStandardMaterial
              color="#eef2ff"
              emissive="#b8c8ff"
              emissiveIntensity={i % 2 === 0 ? 2.4 : 0.2}
              toneMapped={false}
            />
          </mesh>
          {i % 2 === 0 && (
            <pointLight intensity={3.5} distance={10} color="#c8d4ff" decay={2} />
          )}
        </group>
      ))}

      {/* Utility crates */}
      {[
        [-2.2, 0.55, -8],
        [2.1, 0.45, 6],
        [-1.8, 0.65, 14],
        [1.6, 0.5, -14],
      ].map((p, i) => (
        <RigidBody key={i} type="fixed" colliders="cuboid" position={p as [number, number, number]}>
          <mesh castShadow>
            <boxGeometry args={[1.35, 1.1, 1.05]} />
            <meshStandardMaterial color="#3a4254" metalness={0.25} roughness={0.7} />
          </mesh>
        </RigidBody>
      ))}

      <NeonBar position={[-3.9, 2.8, -4]} rotation={[0, 0, Math.PI / 2]} color="#5ec8e8" size={[1.2, 0.04, 0.04]} />
      <mesh position={[0, 1.6, -18]} rotation={[0, 0, 0]}>
        <planeGeometry args={[2.4, 1.2]} />
        <meshStandardMaterial
          color="#2a3140"
          emissive="#445566"
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  )
}
