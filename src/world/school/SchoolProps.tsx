import { Suspense, useMemo } from 'react'
import { createSchoolDecor, type SchoolZoneName } from '../../proc/createSchoolDecor'
import { useWorldSeed } from '../../proc/WorldSeedContext'
import { SchoolProp } from '../../objects/SchoolProp'

/** 구역 재진입/재시드 때 흐트러짐만 다시 뿌린다 — 동선과 랜드마크는 고정. */
export function SchoolProps({ zone }: { zone: SchoolZoneName }) {
  const { seed, generation } = useWorldSeed()
  const decor = useMemo(
    () => createSchoolDecor(`${seed}:${generation}`, zone),
    [seed, generation, zone],
  )

  return (
    <group name={`school-props-${zone}`}>
      {/* Suspense outside the bodies: auto-fit colliders must see the loaded meshes on mount */}
      <Suspense fallback={null}>
      {decor.props.map((p) => (
        <SchoolProp
          key={p.id}
          id={p.id}
          kind={p.kind}
          position={p.position}
          rotationY={p.rotationY}
        />
      ))}
      </Suspense>
    </group>
  )
}

/** 구역별 형광등 점멸 패턴 — 조명 자체의 배치는 각 존 컴포넌트가 고정으로 갖는다. */
export function useSchoolLights(zone: SchoolZoneName) {
  const { seed, generation } = useWorldSeed()
  return useMemo(
    () => createSchoolDecor(`${seed}:${generation}`, zone).lights,
    [seed, generation, zone],
  )
}
