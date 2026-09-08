import { useMemo } from 'react'
import { createZoneDecor } from '../proc/createZoneDecor'
import { useWorldSeed } from '../proc/WorldSeedContext'
import { RigidBody } from '@react-three/rapier'

const KIND_COLOR: Record<string, string> = {
  cup: '#d9c4a5',
  flyer: '#e8e4d8',
  ticket: '#e85d75',
  trash: '#4a5568',
}

export function ProceduralProps({ zone }: { zone: string }) {
  const { seed, generation } = useWorldSeed()
  const decor = useMemo(() => createZoneDecor(`${seed}:${generation}`, zone), [seed, generation, zone])

  return (
    <group name={`props-${zone}`}>
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
          <mesh castShadow>
            <boxGeometry args={p.kind === 'flyer' ? [0.35, 0.02, 0.45] : [0.22, 0.28, 0.22]} />
            <meshStandardMaterial color={KIND_COLOR[p.kind] ?? '#888'} roughness={0.8} />
          </mesh>
        </RigidBody>
      ))}

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
