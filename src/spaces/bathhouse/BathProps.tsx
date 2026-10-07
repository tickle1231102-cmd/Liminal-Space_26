import { useMemo } from 'react'
import { useWorldSeed } from '../../core/proc/WorldSeedContext'
import { BathProp } from './BathProp'
import { createBathDecor, type BathZoneName } from './createBathDecor'

/** 재시드(R)마다 소품만 다시 뿌린다 — 동선과 랜드마크는 고정. */
export function BathProps({ zone }: { zone: BathZoneName }) {
  const { seed, generation } = useWorldSeed()
  const decor = useMemo(() => createBathDecor(`${seed}:${generation}`, zone), [seed, generation, zone])
  return (
    <group name={`bath-props-${zone}`}>
      {decor.props.map((p) => (
        <BathProp key={`${generation}:${p.id}`} id={p.id} kind={p.kind} position={p.position} rotationY={p.rotationY} />
      ))}
    </group>
  )
}

export function useBathDrips() {
  const { seed, generation } = useWorldSeed()
  return useMemo(() => createBathDecor(`${seed}:${generation}`, 'hall').drips, [seed, generation])
}
