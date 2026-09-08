import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PitchWobbleBed } from './PitchWobble'

export function RideAudioSource({ enabled }: { enabled: boolean }) {
  const bed = useRef(new PitchWobbleBed())
  const { camera } = useThree()

  useEffect(() => {
    if (!enabled) return
    const b = bed.current
    void b.ensure()
    return () => b.dispose()
  }, [enabled])

  useFrame(() => {
    if (!enabled) return
    const d = camera.position.distanceTo(bed.current.sourceWorld)
    bed.current.setDistanceVolume(d)
  })

  return (
    <mesh position={[-12, 3, -46]} visible={false}>
      <sphereGeometry args={[0.2]} />
    </mesh>
  )
}
