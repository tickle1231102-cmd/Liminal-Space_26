import { MeshReflectorMaterial } from '@react-three/drei'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { useMemo, type ReactNode } from 'react'
import { asphaltMap, concreteMap, neonSignTexture, roughnessNoise } from './procTextures'
import { NeonBar } from './Atmosphere'

function Solid({
  position,
  size,
  color,
  metalness = 0.08,
  roughness = 0.82,
  emissive,
  emissiveIntensity = 0,
}: {
  position: [number, number, number]
  size: [number, number, number]
  color: string
  metalness?: number
  roughness?: number
  emissive?: string
  emissiveIntensity?: number
}) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={color}
          metalness={metalness}
          roughness={roughness}
          emissive={emissive ?? '#000'}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>
    </RigidBody>
  )
}

export function PlazaZone({ children }: { children?: ReactNode }) {
  const asphalt = useMemo(() => asphaltMap(10), [])
  const concrete = useMemo(() => concreteMap(3), [])
  const rough = useMemo(() => roughnessNoise(8), [])
  const sign = useMemo(() => neonSignTexture('OPEN', '#140818', '#ff6ad5'), [])
  const sign2 = useMemo(() => neonSignTexture('TICKETS', '#0a1218', '#5ec8e8'), [])

  return (
    <group name="plaza">
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

      {/* Ticket booth body */}
      <Solid position={[-10, 1.35, -8]} size={[4.6, 2.7, 3.4]} color="#2e3648" roughness={0.75} />
      {/* Counter window glow */}
      <mesh position={[-8.65, 1.55, -8]} castShadow>
        <boxGeometry args={[0.08, 1.1, 1.8]} />
        <meshStandardMaterial
          color="#ffe6b8"
          emissive="#ffc07a"
          emissiveIntensity={1.4}
          toneMapped={false}
        />
      </mesh>
      {/* Awning */}
      <mesh position={[-10, 2.85, -6.9]} castShadow>
        <boxGeometry args={[5.4, 0.12, 1.6]} />
        <meshStandardMaterial color="#c45c6a" roughness={0.55} metalness={0.1} />
      </mesh>
      <mesh position={[-10, 3.15, -8]} castShadow>
        <boxGeometry args={[5.0, 0.45, 3.8]} />
        <meshStandardMaterial
          map={concrete}
          color="#d07080"
          roughness={0.55}
          emissive="#401018"
          emissiveIntensity={0.25}
        />
      </mesh>
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

      {/* Fountain */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 0.28, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[2.6, 3.0, 0.55, 48]} />
          <meshStandardMaterial map={concrete} color="#7a889c" roughness={0.45} metalness={0.25} />
        </mesh>
      </RigidBody>
      <mesh position={[0, 0.58, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.1, 2.35, 48]} />
        <meshStandardMaterial
          color="#4a90a8"
          transparent
          opacity={0.55}
          metalness={0.8}
          roughness={0.15}
          emissive="#1a4058"
          emissiveIntensity={0.35}
        />
      </mesh>
      <mesh position={[0, 0.56, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.05, 48]} />
        <meshStandardMaterial
          color="#6eb8d0"
          transparent
          opacity={0.4}
          metalness={0.9}
          roughness={0.05}
          emissive="#2a6080"
          emissiveIntensity={0.5}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 1.25, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.4, 1.5, 16]} />
        <meshStandardMaterial color="#8a9bb0" metalness={0.55} roughness={0.35} />
      </mesh>
      <mesh position={[0, 2.05, 0]}>
        <sphereGeometry args={[0.35, 24, 24]} />
        <meshStandardMaterial
          color="#c8d8e8"
          metalness={0.7}
          roughness={0.2}
          emissive="#88aacc"
          emissiveIntensity={0.4}
        />
      </mesh>
      <pointLight position={[0, 2.3, 0]} intensity={4} distance={10} color="#9ed0ff" />

      {/* Lamp posts */}
      {[
        [-6, 8],
        [6, 8],
        [-6, -6],
        [8, -2],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 1.6, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.1, 3.2, 8]} />
            <meshStandardMaterial color="#2a3140" metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[0, 3.35, 0]}>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshStandardMaterial
              color="#ffe0a8"
              emissive="#ffc07a"
              emissiveIntensity={2.2}
              toneMapped={false}
            />
          </mesh>
          <pointLight position={[0, 3.3, 0]} intensity={9} distance={16} color="#ffd8a0" />
        </group>
      ))}

      {/* Perimeter fences with posts */}
      {([-28, 28] as const).map((z) => (
        <Solid key={`fz${z}`} position={[0, 1.15, z]} size={[56, 2.3, 0.28]} color="#1c2230" metalness={0.35} roughness={0.55} />
      ))}
      {([-28, 28] as const).map((x) => (
        <Solid key={`fx${x}`} position={[x, 1.15, 0]} size={[0.28, 2.3, 56]} color="#1c2230" metalness={0.35} roughness={0.55} />
      ))}
      <NeonBar position={[0, 2.4, -27.8]} color="#5ec8e8" size={[12, 0.05, 0.05]} />

      {/* Path to midway — brighter lane + edge lights */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 2]} receiveShadow>
        <planeGeometry args={[6.2, 36]} />
        <meshStandardMaterial
          map={asphalt}
          color="#6a758c"
          roughness={0.78}
          metalness={0.08}
          emissive="#2a3348"
          emissiveIntensity={0.15}
        />
      </mesh>
      {/* Center dashed guide */}
      {[-8, -4, 0, 4, 8, 12].map((z) => (
        <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.055, z]}>
          <planeGeometry args={[0.35, 1.4]} />
          <meshStandardMaterial
            color="#ffe6a8"
            emissive="#ffc06a"
            emissiveIntensity={0.85}
            toneMapped={false}
          />
        </mesh>
      ))}
      {/* Path edge strips */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-3.05, 0.05, 2]}>
        <planeGeometry args={[0.18, 36]} />
        <meshStandardMaterial color="#ffd28a" emissive="#ffb86a" emissiveIntensity={1.1} toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3.05, 0.05, 2]}>
        <planeGeometry args={[0.18, 36]} />
        <meshStandardMaterial color="#ffd28a" emissive="#ffb86a" emissiveIntensity={1.1} toneMapped={false} />
      </mesh>
      {/* Path bollard lights */}
      {[-10, -5, 0, 5, 10, 15].map((z) =>
        ([-3.4, 3.4] as const).map((x) => (
          <group key={`${x}-${z}`} position={[x, 0, z]}>
            <mesh position={[0, 0.45, 0]}>
              <cylinderGeometry args={[0.06, 0.08, 0.9, 8]} />
              <meshStandardMaterial color="#3a4254" metalness={0.5} roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.95, 0]}>
              <sphereGeometry args={[0.12, 12, 12]} />
              <meshStandardMaterial
                color="#ffe8c0"
                emissive="#ffd090"
                emissiveIntensity={2.5}
                toneMapped={false}
              />
            </mesh>
            <pointLight position={[0, 1, 0]} intensity={4.5} distance={8} color="#ffe0b0" decay={2} />
          </group>
        )),
      )}

      {children}
    </group>
  )
}
