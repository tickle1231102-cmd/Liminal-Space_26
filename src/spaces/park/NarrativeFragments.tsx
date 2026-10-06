import { RigidBody } from '@react-three/rapier'

export type NarrativeFragment = {
  id: string
  kind: 'note' | 'graffiti' | 'radio'
  position: [number, number, number]
  rotation?: [number, number, number]
  text: string
}

const FRAGMENTS: NarrativeFragment[] = [
  {
    id: 'note-bench',
    kind: 'note',
    position: [3.2, 0.55, 7.5],
    rotation: [-Math.PI / 2, 0, 0.2],
    text: '문이 잠겨 있었는데도\n불은 그대로였다.',
  },
  {
    id: 'graffiti-booth',
    kind: 'graffiti',
    position: [-8.1, 1.6, -6.4],
    rotation: [0, Math.PI / 2, 0],
    text: '폐장 시각을 잊은 사람들',
  },
  {
    id: 'radio-stand',
    kind: 'radio',
    position: [40, 1.5, -3],
    text: '…손님 여러분, 오늘은\n어제와 같은 내일입니다…',
  },
]

/** Mesh-only markers — no font loading / Suspense (avoids blank Canvas). */
export function NarrativeFragments() {
  return (
    <group name="narrative-fragments">
      {FRAGMENTS.map((f) => (
        <group key={f.id} position={f.position} rotation={f.rotation ?? [0, 0, 0]}>
          {f.kind === 'note' && (
            <RigidBody type="fixed" colliders="cuboid">
              <mesh>
                <planeGeometry args={[0.45, 0.6]} />
                <meshStandardMaterial color="#e8e0d0" roughness={0.9} />
              </mesh>
              <mesh position={[0, 0, 0.01]}>
                <planeGeometry args={[0.32, 0.08]} />
                <meshStandardMaterial color="#2a2430" />
              </mesh>
            </RigidBody>
          )}
          {f.kind === 'graffiti' && (
            <mesh>
              <planeGeometry args={[3.2, 0.35]} />
              <meshStandardMaterial color="#3a4558" transparent opacity={0.55} />
            </mesh>
          )}
          {f.kind === 'radio' && (
            <group>
              <RigidBody type="fixed" colliders="cuboid">
                <mesh>
                  <boxGeometry args={[0.5, 0.35, 0.3]} />
                  <meshStandardMaterial color="#3a4254" metalness={0.3} roughness={0.5} />
                </mesh>
              </RigidBody>
              <mesh position={[0, 0.45, 0]}>
                <boxGeometry args={[0.15, 0.08, 0.08]} />
                <meshStandardMaterial
                  color="#9eb6ff"
                  emissive="#9eb6ff"
                  emissiveIntensity={1.2}
                />
              </mesh>
            </group>
          )}
        </group>
      ))}
    </group>
  )
}

export { FRAGMENTS }
