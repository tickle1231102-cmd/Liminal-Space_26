import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { InstancedMesh, Object3D } from 'three'
import { useLayoutEffect, useMemo, useRef } from 'react'
import { useWorldSeed } from '../proc/WorldSeedContext'
import { asphaltMap, neonSignTexture } from './procTextures'
import { NeonBar } from './Atmosphere'

/** Food alley with instanced clutter for mobile-friendly draw calls. */
export function FoodAlleyZone() {
  const meshRef = useRef<InstancedMesh>(null)
  const count = 28
  const { generation } = useWorldSeed()
  const asphalt = useMemo(() => asphaltMap(5), [])
  const popcornSign = useMemo(() => neonSignTexture('POPCORN', '#1a1008', '#f2d36b'), [])

  const positions = useMemo(() => {
    const pts: [number, number, number][] = []
    let s = ((generation + 1) * 9301 + 49297) % 233280
    const rnd = () => {
      s = (s * 9301 + 49297) % 233280
      return s / 233280
    }
    for (let i = 0; i < count; i++) {
      pts.push([(rnd() - 0.5) * 20, 0.28 + rnd() * 0.35, (rnd() - 0.5) * 14])
    }
    return pts
  }, [generation])

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    const dummy = new Object3D()
    positions.forEach((p, i) => {
      dummy.position.set(p[0], p[1], p[2])
      dummy.rotation.y = i * 0.7
      dummy.scale.setScalar(0.65 + (i % 5) * 0.1)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  }, [positions])

  return (
    <group name="food-alley" position={[42, 0, 0]}>
      <RigidBody type="fixed" colliders={false} position={[0, 0, 0]}>
        <CuboidCollider args={[20, 0.5, 16]} position={[0, -0.5, 0]} friction={1.2} />
      </RigidBody>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[36, 28]} />
        <meshStandardMaterial map={asphalt} color="#3e485a" roughness={0.85} metalness={0.1} />
      </mesh>

      {/* Popcorn stand */}
      <RigidBody type="fixed" colliders="cuboid" position={[-6, 1.4, -4]}>
        <mesh castShadow>
          <boxGeometry args={[3.6, 2.8, 2.6]} />
          <meshStandardMaterial color="#c48a4a" roughness={0.65} metalness={0.1} />
        </mesh>
      </RigidBody>
      <mesh position={[-6, 3.15, -4]} castShadow>
        <boxGeometry args={[4.0, 0.35, 3.0]} />
        <meshStandardMaterial
          color="#e85d75"
          emissive="#401018"
          emissiveIntensity={0.4}
        />
      </mesh>
      <mesh position={[-6, 3.55, -2.65]}>
        <planeGeometry args={[2.4, 0.7]} />
        <meshStandardMaterial
          map={popcornSign}
          emissiveMap={popcornSign}
          emissive="#ffffff"
          emissiveIntensity={1}
          toneMapped={false}
        />
      </mesh>
      <NeonBar position={[-6, 3.9, -2.7]} color="#f2d36b" size={[2.6, 0.05, 0.05]} />
      <pointLight position={[-6, 3.2, -2]} intensity={7} distance={14} color="#f2d36b" />

      {/* Cotton candy cart */}
      <RigidBody type="fixed" colliders="cuboid" position={[5, 1.1, 3]}>
        <mesh castShadow>
          <boxGeometry args={[2.5, 2.2, 2.1]} />
          <meshStandardMaterial
            color="#b08ad8"
            emissive="#2a1840"
            emissiveIntensity={0.35}
            roughness={0.5}
          />
        </mesh>
      </RigidBody>
      <mesh position={[5, 2.55, 3]}>
        <sphereGeometry args={[0.55, 16, 16]} />
        <meshStandardMaterial
          color="#e8c4ff"
          emissive="#c7a0ff"
          emissiveIntensity={0.7}
          transparent
          opacity={0.85}
          toneMapped={false}
        />
      </mesh>
      <pointLight position={[5, 2.8, 3]} intensity={6} distance={12} color="#c7a0ff" />

      {/* Benches */}
      {[-4, 0, 4].map((z) => (
        <group key={z} position={[8, 0, z]}>
          <RigidBody type="fixed" colliders="cuboid" position={[0, 0.45, 0]}>
            <mesh castShadow>
              <boxGeometry args={[2.4, 0.12, 0.75]} />
              <meshStandardMaterial color="#5a4636" roughness={0.8} />
            </mesh>
          </RigidBody>
          <mesh position={[-0.9, 0.25, 0]} castShadow>
            <boxGeometry args={[0.12, 0.5, 0.7]} />
            <meshStandardMaterial color="#3a2e24" />
          </mesh>
          <mesh position={[0.9, 0.25, 0]} castShadow>
            <boxGeometry args={[0.12, 0.5, 0.7]} />
            <meshStandardMaterial color="#3a2e24" />
          </mesh>
        </group>
      ))}

      <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow>
        <boxGeometry args={[0.32, 0.5, 0.32]} />
        <meshStandardMaterial color="#6b7280" roughness={0.8} metalness={0.1} />
      </instancedMesh>
    </group>
  )
}
