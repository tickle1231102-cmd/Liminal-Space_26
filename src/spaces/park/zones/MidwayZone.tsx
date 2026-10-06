import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { Suspense, useMemo, type ReactNode } from 'react'
import { asphaltMap } from '../procTextures'
import { NeonBar } from '../Atmosphere'
import { GltfAnimated, GltfAsset, parkModel } from '../../../core/world/GltfAsset'
import { RideSeat } from '../objects/RideSeat'
import type * as THREE from 'three'

// Zone + ride placement (macro layout, never reseeded). Exits are world space.
const ZONE: [number, number, number] = [0, 0, -42]
const FERRIS: [number, number, number] = [-12, 0, -4]
const CAROUSEL: [number, number, number] = [10, 0, 2]
const CAROUSEL_EXIT_RADIUS = 5.4 // just outside the 4.75 m skirt

/** Dismount radially off the carousel, beside where the horse currently is. */
function carouselExit(seat: THREE.Vector3, out: THREE.Vector3) {
  const cx = ZONE[0] + CAROUSEL[0]
  const cz = ZONE[2] + CAROUSEL[2]
  const dx = seat.x - cx
  const dz = seat.z - cz
  const k = CAROUSEL_EXIT_RADIUS / Math.max(0.001, Math.hypot(dx, dz))
  out.set(cx + dx * k, 0.15, cz + dz * k)
}

/** Dismount onto the ferris boarding deck (deck is part of ferris_wheel.glb, in front of the wheel). */
function ferrisExit(_seat: THREE.Vector3, out: THREE.Vector3) {
  out.set(ZONE[0] + FERRIS[0], 0.35, ZONE[2] + FERRIS[2] + 2.1)
}

const CAROUSEL_SEATS = {
  RideMount_0: (
    <RideSeat
      id="carousel-horse-0"
      label="Carousel horse"
      model={parkModel('carousel_horse')}
      seat={[0, 0.25, 0]}
      collider={[0.2, 0.45, 0.5]}
      exitFrom={carouselExit}
    />
  ),
}

/** Each gondola (counter-rotated to stay level) seats one rider on its bench. */
const GONDOLA_SEATS = Object.fromEntries(
  Array.from({ length: 8 }, (_, i) => [
    `Gondola_${i}`,
    <RideSeat
      key={i}
      id={`ferris-gondola-${i}`}
      label="Ferris gondola"
      seat={[0, -1.25, 0]}
      faceYaw={Math.PI} // look out toward the midway and plaza, not into the wheel frame
      exitFrom={ferrisExit}
    />,
  ]),
)

type MidwayProps = {
  children?: ReactNode
}

/** Midway: ferris wheel + carousel landmarks (macro layout fixed). */
export function MidwayZone({ children }: MidwayProps) {
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
        <GltfAnimated url={parkModel('ferris_wheel')} position={FERRIS} mounts={GONDOLA_SEATS} />
        {/* Carousel — platform turn + horse bob baked in carousel.py; boardable horse on "RideMount_0" */}
        <GltfAnimated url={parkModel('carousel')} position={CAROUSEL} mounts={CAROUSEL_SEATS} />
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
