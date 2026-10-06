import { useFrame, useThree } from '@react-three/fiber'
import { useRef, type ReactNode } from 'react'
import * as THREE from 'three'

/** Hide expensive children when camera is far — simple distance LOD. */
export function DistanceLod({
  center,
  near = 35,
  children,
}: {
  center: [number, number, number]
  near?: number
  children: ReactNode
}) {
  const group = useRef<THREE.Group>(null)
  const { camera } = useThree()
  const tmp = useRef(new THREE.Vector3(...center))

  useFrame(() => {
    if (!group.current) return
    const d = camera.position.distanceTo(tmp.current)
    group.current.visible = d < near
  })

  return <group ref={group}>{children}</group>
}
