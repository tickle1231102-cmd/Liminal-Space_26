import { Sparkles, Stars, ContactShadows } from '@react-three/drei'
import { useMemo } from 'react'

/** Shared night atmosphere — readable liminal park, not a black void. */
export function Atmosphere({ reduceMotion }: { reduceMotion: boolean }) {
  const starCount = reduceMotion ? 300 : 900
  return (
    <>
      <color attach="background" args={['#121826']} />
      <fog attach="fog" args={['#1a2436', 45, 110]} />

      <ambientLight intensity={0.72} color="#b8c6dc" />
      <hemisphereLight args={['#6a7fa0', '#1a2030', 0.85]} />

      {/* Moonlight fill */}
      <directionalLight
        position={[14, 24, 10]}
        intensity={1.15}
        color="#d0dcff"
        castShadow={!reduceMotion}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={90}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-bias={-0.0002}
      />
      <directionalLight position={[-10, 12, -8]} intensity={0.45} color="#ffe0c0" />

      {/* Plaza key light */}
      <spotLight
        position={[0, 11, 4]}
        angle={0.72}
        penumbra={0.55}
        intensity={42}
        color="#ffe2b0"
        distance={55}
        castShadow={!reduceMotion}
      />
      {/* Path toward midway */}
      <spotLight
        position={[0, 8, -8]}
        angle={0.45}
        penumbra={0.6}
        intensity={28}
        color="#fff0d0"
        distance={40}
      />
      <pointLight position={[-10, 4.2, -6]} intensity={16} distance={24} color="#ff7eb8" decay={2} />
      <pointLight position={[0, 4, 0]} intensity={12} distance={20} color="#c8e4ff" decay={2} />
      <pointLight position={[-12, 9, -46]} intensity={22} distance={40} color="#7ad8f0" decay={2} />
      <pointLight position={[10, 6, -40]} intensity={18} distance={30} color="#ff8fab" decay={2} />
      <pointLight position={[42, 5, 0]} intensity={16} distance={28} color="#f2d36b" decay={2} />

      {!reduceMotion && (
        <>
          <Stars radius={90} depth={50} count={starCount} factor={2.6} saturation={0} fade speed={0.25} />
          <Sparkles
            count={36}
            scale={[40, 6, 40]}
            position={[0, 2.5, 0]}
            size={2}
            speed={0.2}
            opacity={0.25}
            color="#e8f0ff"
          />
          <ContactShadows
            position={[0, 0.01, 0]}
            opacity={0.22}
            scale={70}
            blur={2.8}
            far={16}
            color="#000000"
          />
        </>
      )}
    </>
  )
}

export function NeonBar({
  position,
  rotation = [0, 0, 0],
  color = '#ff6ad5',
  size = [2.4, 0.08, 0.08],
}: {
  position: [number, number, number]
  rotation?: [number, number, number]
  color?: string
  size?: [number, number, number]
}) {
  const intensity = useMemo(() => 2.4, [])
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={intensity}
        toneMapped={false}
      />
    </mesh>
  )
}
