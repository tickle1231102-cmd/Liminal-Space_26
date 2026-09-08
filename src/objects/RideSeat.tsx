import { useFrame } from '@react-three/fiber'
import { RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useInteraction } from '../player/InteractionContext'

type RideSeatProps = {
  id: string
  label: string
  position: [number, number, number]
  onRideChange: (riding: boolean, worldPos: THREE.Vector3 | null) => void
}

/** Simple boardable seat — used for carousel horse / gondola stubs. */
export function RideSeat({ id, label, position, onRideChange }: RideSeatProps) {
  const body = useRef<RapierRigidBody>(null)
  const interaction = useInteraction()
  const [bobPhase] = useState(() => Math.random() * Math.PI * 2)
  const world = useRef(new THREE.Vector3())
  const group = useRef<THREE.Group>(null)

  useEffect(() => {
    interaction.register({ id, kind: 'ride', label, body })
    return () => interaction.unregister(id)
  }, [id, label, interaction])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (group.current) {
      group.current.position.y = position[1] + Math.sin(t * 1.4 + bobPhase) * 0.25
      group.current.getWorldPosition(world.current)
    }

    const riding = interaction.heldId === id
    if (riding) onRideChange(true, world.current.clone())
  })

  useEffect(() => {
    if (interaction.heldId !== id) onRideChange(false, null)
  }, [interaction.heldId, id, onRideChange])

  return (
    <group ref={group} position={position}>
      <RigidBody ref={body} type="fixed" colliders="cuboid">
        <mesh castShadow>
          <boxGeometry args={[0.7, 0.9, 1.1]} />
          <meshStandardMaterial color="#e8d5a3" roughness={0.55} />
        </mesh>
      </RigidBody>
    </group>
  )
}
