import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import { asphaltMap } from './procTextures'
import { NeonBar } from './Atmosphere'

type MidwayProps = {
  children?: ReactNode
}

/** Midway: ferris wheel + carousel landmarks (macro layout fixed). */
export function MidwayZone({ children }: MidwayProps) {
  const wheel = useRef<THREE.Group>(null)
  const carousel = useRef<THREE.Group>(null)
  const asphalt = useMemo(() => asphaltMap(6), [])

  const gondolas = useMemo(() => {
    const items: { angle: number; color: string }[] = []
    const colors = ['#e85d75', '#5ec8e8', '#f2d36b', '#9ae6b4', '#c7a0ff', '#f6ad55', '#ff8fab', '#7dd3fc']
    for (let i = 0; i < 8; i++) {
      items.push({ angle: (i / 8) * Math.PI * 2, color: colors[i % colors.length]! })
    }
    return items
  }, [])

  const horses = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      angle: (i / 8) * Math.PI * 2,
      phase: i * 0.7,
      color: i % 2 === 0 ? '#f5e6c8' : '#e8b4c8',
    }))
  }, [])

  useFrame((state, dt) => {
    if (wheel.current) wheel.current.rotation.z += dt * 0.14
    if (carousel.current) carousel.current.rotation.y += dt * 0.42
    // bob horses via children y offset stored in userData
    if (carousel.current) {
      carousel.current.children.forEach((child) => {
        if (child.userData.bobPhase == null) return
        const base = child.userData.baseY as number
        child.position.y =
          base + Math.sin(state.clock.elapsedTime * 1.6 + child.userData.bobPhase) * 0.22
      })
    }
  })

  return (
    <group name="midway" position={[0, 0, -42]}>
      <RigidBody type="fixed" colliders={false} position={[0, 0, 0]}>
        <CuboidCollider args={[28, 0.5, 22]} position={[0, -0.5, 0]} friction={1.2} />
      </RigidBody>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[48, 36]} />
        <meshStandardMaterial map={asphalt} color="#3a4558" roughness={0.82} metalness={0.12} />
      </mesh>

      {/* Ferris wheel */}
      <group position={[-12, 0, -4]}>
        {/* Support A-frame */}
        <mesh position={[-1.2, 3.5, 0]} rotation={[0, 0, 0.35]} castShadow>
          <boxGeometry args={[0.25, 8, 0.25]} />
          <meshStandardMaterial color="#6a7388" metalness={0.65} roughness={0.35} />
        </mesh>
        <mesh position={[1.2, 3.5, 0]} rotation={[0, 0, -0.35]} castShadow>
          <boxGeometry args={[0.25, 8, 0.25]} />
          <meshStandardMaterial color="#6a7388" metalness={0.65} roughness={0.35} />
        </mesh>
        {/* Rim */}
        <mesh position={[0, 7, 0]}>
          <torusGeometry args={[6.2, 0.14, 12, 64]} />
          <meshStandardMaterial color="#9aa6bc" metalness={0.7} roughness={0.28} />
        </mesh>
        <mesh position={[0, 7, 0]}>
          <torusGeometry args={[5.4, 0.07, 8, 64]} />
          <meshStandardMaterial
            color="#5ec8e8"
            emissive="#5ec8e8"
            emissiveIntensity={0.85}
            toneMapped={false}
          />
        </mesh>
        {/* Hub */}
        <mesh position={[0, 7, 0]}>
          <cylinderGeometry args={[0.45, 0.45, 0.8, 16]} />
          <meshStandardMaterial color="#c0c8d8" metalness={0.8} roughness={0.2} />
        </mesh>
        <group ref={wheel} position={[0, 7, 0]}>
          {gondolas.map((g) => {
            const x = Math.cos(g.angle) * 6.2
            const y = Math.sin(g.angle) * 6.2
            return (
              <group key={g.angle} position={[x, y, 0]}>
                {/* spoke */}
                <mesh rotation={[0, 0, g.angle]}>
                  <boxGeometry args={[6.2, 0.06, 0.06]} />
                  <meshStandardMaterial color="#7a8498" metalness={0.6} roughness={0.4} />
                </mesh>
                <mesh position={[0, 0, 0.55]} castShadow>
                  <boxGeometry args={[1.05, 1.25, 1.05]} />
                  <meshStandardMaterial
                    color={g.color}
                    emissive={g.color}
                    emissiveIntensity={0.35}
                    roughness={0.4}
                    metalness={0.15}
                    toneMapped={false}
                  />
                </mesh>
                <mesh position={[0, 0.55, 0.55]}>
                  <boxGeometry args={[1.05, 0.08, 1.05]} />
                  <meshStandardMaterial color="#e8eef8" metalness={0.3} roughness={0.5} />
                </mesh>
              </group>
            )
          })}
        </group>
        <RigidBody type="fixed" colliders="cuboid" position={[0, 1, 0]}>
          <mesh castShadow>
            <boxGeometry args={[2.6, 2, 2.6]} />
            <meshStandardMaterial color="#2a3140" metalness={0.4} roughness={0.5} />
          </mesh>
        </RigidBody>
        <NeonBar position={[0, 2.15, 1.4]} color="#5ec8e8" size={[2.2, 0.06, 0.06]} />
      </group>

      {/* Carousel */}
      <group position={[10, 0, 2]}>
        <mesh position={[0, 0.12, 0]} receiveShadow>
          <cylinderGeometry args={[4.6, 4.6, 0.24, 48]} />
          <meshStandardMaterial color="#1e2430" metalness={0.3} roughness={0.6} />
        </mesh>
        {/* canopy */}
        <mesh position={[0, 3.1, 0]}>
          <coneGeometry args={[4.8, 1.6, 16]} />
          <meshStandardMaterial
            color="#c45c6a"
            emissive="#501020"
            emissiveIntensity={0.45}
            roughness={0.55}
          />
        </mesh>
        <mesh position={[0, 2.35, 0]}>
          <cylinderGeometry args={[4.5, 4.5, 0.12, 48]} />
          <meshStandardMaterial
            color="#ff8fab"
            emissive="#ff6b8a"
            emissiveIntensity={0.55}
            toneMapped={false}
          />
        </mesh>
        {/* center pole */}
        <mesh position={[0, 1.7, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.25, 3.2, 16]} />
          <meshStandardMaterial color="#d4af37" metalness={0.75} roughness={0.3} />
        </mesh>
        <group ref={carousel}>
          {horses.map((h, i) => {
            const x = Math.cos(h.angle) * 2.9
            const z = Math.sin(h.angle) * 2.9
            return (
              <group
                key={i}
                position={[x, 1.05, z]}
                rotation={[0, -h.angle + Math.PI / 2, 0]}
                userData={{ bobPhase: h.phase, baseY: 1.05 }}
              >
                {/* pole */}
                <mesh position={[0, 0.9, 0]}>
                  <cylinderGeometry args={[0.04, 0.04, 2.2, 8]} />
                  <meshStandardMaterial color="#e8d5a3" metalness={0.5} roughness={0.4} />
                </mesh>
                {/* stylized horse */}
                <mesh position={[0, 0.15, 0]} castShadow>
                  <boxGeometry args={[0.35, 0.55, 0.95]} />
                  <meshStandardMaterial color={h.color} roughness={0.45} metalness={0.05} />
                </mesh>
                <mesh position={[0, 0.45, 0.35]} castShadow>
                  <boxGeometry args={[0.28, 0.28, 0.28]} />
                  <meshStandardMaterial color={h.color} roughness={0.45} />
                </mesh>
                <mesh position={[0, -0.25, 0.25]}>
                  <boxGeometry args={[0.12, 0.45, 0.12]} />
                  <meshStandardMaterial color="#5a4636" />
                </mesh>
                <mesh position={[0, -0.25, -0.25]}>
                  <boxGeometry args={[0.12, 0.45, 0.12]} />
                  <meshStandardMaterial color="#5a4636" />
                </mesh>
              </group>
            )
          })}
          {children}
        </group>
        <pointLight position={[0, 3.4, 0]} intensity={10} distance={16} color="#ff8fab" />
      </group>

      {/* Ghost house facade */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 2.6, -12]}>
        <mesh castShadow>
          <boxGeometry args={[11, 5.2, 2.2]} />
          <meshStandardMaterial color="#1e1624" roughness={0.88} />
        </mesh>
      </RigidBody>
      <mesh position={[0, 5.9, -12]}>
        <coneGeometry args={[7.2, 2.6, 4]} />
        <meshStandardMaterial color="#120e18" roughness={0.9} />
      </mesh>
      {/* glowing windows */}
      {[
        [-3, 2.2],
        [0, 2.8],
        [3, 2.2],
      ].map(([x, y], i) => (
        <mesh key={i} position={[x, y, -10.85]}>
          <planeGeometry args={[1.2, 1.6]} />
          <meshStandardMaterial
            color="#6b4a2a"
            emissive="#ff9a3c"
            emissiveIntensity={i === 1 ? 0.35 : 1.1}
            toneMapped={false}
          />
        </mesh>
      ))}
      <NeonBar position={[0, 4.5, -10.8]} color="#c7a0ff" size={[4, 0.06, 0.06]} />
    </group>
  )
}
