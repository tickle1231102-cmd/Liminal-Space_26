import { CuboidCollider, RigidBody } from '@react-three/rapier'
import seedrandom from 'seedrandom'
import { Suspense, useMemo } from 'react'
import { useWorldSeed } from '../../../core/proc/WorldSeedContext'
import { asphaltMap, neonSignTexture } from '../procTextures'
import { NeonBar } from '../Atmosphere'
import { GltfAsset, GltfInstances, parkModel, useGltfAnchors, type GltfAnchor, type InstanceXform } from '../../../core/world/GltfAsset'

type Vec3 = [number, number, number]

// Fixed landmarks (macro layout never reseeds); models in art/blender/park/
const POPCORN: { position: Vec3; rotationY: number } = { position: [-6, 0, -4], rotationY: 0 }
const CANDY: { position: Vec3; rotationY: number } = { position: [5, 0, 3], rotationY: 0 }
const BENCHES_Z = [-4, 0, 4]
const CLUTTER = 28

/** Anchor from a placed model's local space → zone space. */
function toZone(a: GltfAnchor, at: { position: Vec3; rotationY: number }): Vec3 {
  const [x, y, z] = a.position
  const c = Math.cos(at.rotationY)
  const s = Math.sin(at.rotationY)
  return [at.position[0] + x * c + z * s, at.position[1] + y, at.position[2] - x * s + z * c]
}

/** Seeded clutter: popcorn boxes cluster at stand ANCHOR_Spill_*, bins fill some ANCHOR_Bin_* slots. */
function AlleyDecor() {
  const { seed, generation } = useWorldSeed()
  const popcornAnchors = useGltfAnchors(parkModel('popcorn_stand'))
  const candyAnchors = useGltfAnchors(parkModel('cotton_candy_cart'))

  const { boxes, bins } = useMemo(() => {
    const rng = seedrandom(`${seed}:${generation}:food-alley`)
    const all = [
      ...popcornAnchors.map((a) => ({ a, at: POPCORN })),
      ...candyAnchors.map((a) => ({ a, at: CANDY })),
    ]
    const spills = all.filter(({ a }) => a.name.startsWith('Spill')).map(({ a, at }) => toZone(a, at))
    const binSlots = all.filter(({ a }) => a.name.startsWith('Bin')).map(({ a, at }) => toZone(a, at))

    const boxes: InstanceXform[] = Array.from({ length: CLUTTER }, () => {
      const [x, , z] = spills[Math.floor(rng() * spills.length)]!
      const r = Math.sqrt(rng()) * 1.4
      const t = rng() * Math.PI * 2
      const k = 0.8 + rng() * 0.4
      return { position: [x + Math.cos(t) * r, 0.15 * k, z + Math.sin(t) * r], rotationY: rng() * Math.PI * 2, scale: [k, k, k] }
    })
    const bins = binSlots.filter(() => rng() > 0.3)
    return { boxes, bins }
  }, [seed, generation, popcornAnchors, candyAnchors])

  return (
    <>
      <GltfInstances url={parkModel('popcorn_box')} items={boxes} />
      {bins.map((p) => (
        <GltfAsset key={p.join(',')} url={parkModel('trash_can')} position={p} />
      ))}
    </>
  )
}

export function FoodAlleyZone() {
  const asphalt = useMemo(() => asphaltMap(5), [])
  const popcornSign = useMemo(() => neonSignTexture('POPCORN', '#1a1008', '#f2d36b'), [])

  return (
    <group name="food-alley" position={[42, 0, 0]}>
      <RigidBody type="fixed" colliders={false} position={[0, 0, 0]}>
        <CuboidCollider args={[20, 0.5, 16]} position={[0, -0.5, 0]} friction={1.2} />
      </RigidBody>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[36, 28]} />
        <meshStandardMaterial map={asphalt} color="#3e485a" roughness={0.85} metalness={0.1} />
      </mesh>

      <Suspense fallback={null}>
        <GltfAsset url={parkModel('popcorn_stand')} position={POPCORN.position} rotationY={POPCORN.rotationY} />
        <GltfAsset url={parkModel('cotton_candy_cart')} position={CANDY.position} rotationY={CANDY.rotationY} />
        {BENCHES_Z.map((z) => (
          <GltfAsset key={z} url={parkModel('bench')} position={[8, 0, z]} rotationY={-Math.PI / 2} />
        ))}
        <AlleyDecor />
      </Suspense>

      {/* Popcorn sign + light stay in code (canvas texture, tuned glow) */}
      <mesh position={[-6, 3.55, -2.45]}>
        <planeGeometry args={[2.4, 0.7]} />
        <meshStandardMaterial
          map={popcornSign}
          emissiveMap={popcornSign}
          emissive="#ffffff"
          emissiveIntensity={1}
          toneMapped={false}
        />
      </mesh>
      <NeonBar position={[-6, 3.9, -2.5]} color="#f2d36b" size={[2.6, 0.05, 0.05]} />
      <pointLight position={[-6, 3.2, -2]} intensity={7} distance={14} color="#f2d36b" />
      <pointLight position={[5, 2.8, 3]} intensity={6} distance={12} color="#c7a0ff" />
    </group>
  )
}
