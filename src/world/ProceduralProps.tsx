import { Suspense, useMemo } from 'react'
import { createZoneDecor, type PropSpawn } from '../proc/createZoneDecor'
import { GltfVisual, parkModel } from './GltfAsset'
import { useWorldSeed } from '../proc/WorldSeedContext'
import { RigidBody } from '@react-three/rapier'

const KIND_MODEL: Record<PropSpawn['kind'], string> = {
  cup: parkModel('prop_cup'),
  flyer: parkModel('prop_flyer'),
  ticket: parkModel('prop_ticket'),
  trash: parkModel('prop_trash'),
}

export function ProceduralProps({ zone }: { zone: string }) {
  const { seed, generation } = useWorldSeed()
  const decor = useMemo(() => createZoneDecor(`${seed}:${generation}`, zone), [seed, generation, zone])

  return (
    <group name={`props-${zone}`}>
      {/* Suspense outside the bodies: auto-fit colliders must see the loaded meshes on mount */}
      <Suspense fallback={null}>
        {decor.props.map((p) => (
          <RigidBody
            key={p.id}
            colliders="cuboid"
            position={p.position}
            rotation={[0, p.rotationY, 0]}
            mass={0.2}
            linearDamping={0.8}
            angularDamping={0.9}
          >
            <GltfVisual url={KIND_MODEL[p.kind]} />
          </RigidBody>
        ))}
      </Suspense>

      {decor.lights.map((l) =>
        l.on ? (
          <group key={l.id} position={l.position}>
            <pointLight color={l.color} intensity={l.intensity} distance={18} decay={2} castShadow={false} />
            <mesh>
              <sphereGeometry args={[0.12, 8, 8]} />
              <meshStandardMaterial color={l.color} emissive={l.color} emissiveIntensity={2} />
            </mesh>
          </group>
        ) : null,
      )}
    </group>
  )
}

export function useBalloonTint(zone = 'plaza'): string {
  const { seed, generation } = useWorldSeed()
  return useMemo(
    () => createZoneDecor(`${seed}:${generation}`, zone).balloonTint,
    [seed, generation, zone],
  )
}
