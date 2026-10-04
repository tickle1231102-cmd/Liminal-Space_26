import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { Suspense, useMemo, type ReactNode } from 'react'
import { asphaltMap } from './procTextures'
import { NeonBar } from './Atmosphere'
import { GltfAnimated, GltfAsset, parkModel } from './GltfAsset'

type MidwayProps = {
  children?: ReactNode
  /** Mounted on the turning carousel platform (Three local space of the carousel). */
  carouselRiders?: ReactNode
}

/** Midway: ferris wheel + carousel landmarks (macro layout fixed). */
export function MidwayZone({ children, carouselRiders }: MidwayProps) {
  const asphalt = useMemo(() => asphaltMap(6), [])

  return (
    <group name="midway" position={[0, 0, -42]}>
      <RigidBody type="fixed" colliders={false} position={[0, 0, 0]}>
        <CuboidCollider args={[28, 0.5, 22]} position={[0, -0.5, 0]} friction={1.2} />
      </RigidBody>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[48, 36]} />
        <meshStandardMaterial map={asphalt} color="#3a4558" roughness={0.82} metalness={0.12} />
      </mesh>
      {/* Connector from plaza gate into midway */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 12]} receiveShadow>
        <planeGeometry args={[7.2, 16]} />
        <meshStandardMaterial
          map={asphalt}
          color="#7a869c"
          roughness={0.72}
          emissive="#3a4558"
          emissiveIntensity={0.2}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-6, 0.04, 4]}>
        <planeGeometry args={[5, 20]} />
        <meshStandardMaterial
          color="#6a8698"
          emissive="#2a5060"
          emissiveIntensity={0.25}
          roughness={0.75}
        />
      </mesh>
      {[-2, 4, 10].map((z) => (
        <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, z]}>
          <planeGeometry args={[0.4, 1.5]} />
          <meshStandardMaterial color="#5ec8e8" emissive="#5ec8e8" emissiveIntensity={1.2} toneMapped={false} />
        </mesh>
      ))}
      <NeonBar position={[-12, 0.08, -2]} color="#5ec8e8" size={[0.5, 0.04, 8]} />

      <Suspense fallback={null}>
        {/* Ferris wheel — wheel spin + level gondolas baked in art/blender/park/ferris_wheel.py */}
        <GltfAnimated url={parkModel('ferris_wheel')} position={[-12, 0, -4]} />
        {/* Carousel — platform turn + horse bob baked in carousel.py; riders mount on "Platform" */}
        <GltfAnimated url={parkModel('carousel')} position={[10, 0, 2]} mountNode="Platform">
          {carouselRiders}
        </GltfAnimated>
        {/* Ghost house facade */}
        <GltfAsset url={parkModel('ghost_house')} position={[0, 0, -12]} />
      </Suspense>
      {/* Operator booth sign (booth is part of ferris_wheel.glb) */}
      <NeonBar position={[-16.4, 1.9, -1.05]} color="#5ec8e8" size={[1.4, 0.06, 0.06]} />
      <pointLight position={[10, 3.4, 2]} intensity={10} distance={16} color="#ff8fab" />
      <NeonBar position={[0, 4.5, -10.8]} color="#c7a0ff" size={[4, 0.06, 0.06]} />
      {children}
    </group>
  )
}
