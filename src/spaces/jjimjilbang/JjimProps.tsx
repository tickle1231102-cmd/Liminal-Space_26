import { useMemo } from 'react'
import { useWorldSeed } from '../../core/proc/WorldSeedContext'
import { JjimProp } from './JjimProp'
import { createJjimDecor, JJIM_ZONES, pickActiveChair, pickLitCave } from './createJjimDecor'

/** 재시드(R)마다 소품만 다시 뿌린다 — 동선과 랜드마크는 고정. */
export function JjimProps() {
  const { seed, generation } = useWorldSeed()
  const props = useMemo(() => JJIM_ZONES.flatMap((zone) => createJjimDecor(`${seed}:${generation}`, zone)), [seed, generation])
  return (
    <group name="jjimjilbang-props">
      {props.map((p) => (
        <JjimProp key={`${generation}:${p.id}`} id={p.id} kind={p.kind} position={p.position} rotationY={p.rotationY} />
      ))}
    </group>
  )
}

/** 이번 시드에서 안쪽 등이 켜진 토굴. */
export function useLitCave(north: number, east: number) {
  const { seed, generation } = useWorldSeed()
  return useMemo(() => pickLitCave(`${seed}:${generation}`, north, east), [seed, generation, north, east])
}

/** 이번 시드에서 혼자 작동하는 안마의자(열에서 몇 번째). */
export function useActiveChair(count: number) {
  const { seed, generation } = useWorldSeed()
  return useMemo(() => pickActiveChair(`${seed}:${generation}`, count), [seed, generation, count])
}
