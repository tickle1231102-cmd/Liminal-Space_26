import seedrandom from 'seedrandom'

export type Vec3 = [number, number, number]

export type SchoolPropKind =
  | 'chair'
  | 'desk'
  | 'tray'
  | 'ball'
  | 'bin'
  | 'book'

export type SchoolPropSpawn = {
  id: string
  kind: SchoolPropKind
  position: Vec3
  rotationY: number
  /** 의자가 밀려난 정도 — 0에 가까울수록 제자리. */
  disorder: number
}

export type SchoolLight = {
  id: string
  on: boolean
  flickerSeed?: number
}

export type SchoolZoneDecor = {
  props: SchoolPropSpawn[]
  lights: SchoolLight[]
  /** 방송실 잡음 루프 레이어의 크로스페이드 순서. */
  ambientOrder: number[]
}

export type SchoolZoneName = 'entrance' | 'corridor' | 'cafeteria' | 'backstage'

type Area = { x: [number, number]; z: [number, number] }

/**
 * 구역별 소품 스폰 영역과 종류. 거시 구조(동선·랜드마크)는 여기 없다 —
 * 재시드로 흔들리는 건 소품 배치·조명 점멸뿐이라는 PRD 04절 원칙.
 */
const ZONE_SPEC: Record<
  SchoolZoneName,
  { area: Area; kinds: SchoolPropKind[]; count: [number, number]; lights: number }
> = {
  entrance: { area: { x: [-7, 7], z: [8, 20] }, kinds: ['bin', 'book', 'chair'], count: [5, 9], lights: 4 },
  corridor: { area: { x: [-3.2, 3.2], z: [-42, 4] }, kinds: ['chair', 'desk', 'bin', 'book'], count: [10, 16], lights: 10 },
  cafeteria: { area: { x: [12, 31], z: [-27, -9] }, kinds: ['tray', 'chair', 'desk', 'bin'], count: [12, 18], lights: 8 },
  backstage: { area: { x: [-30, -11], z: [-49, -29] }, kinds: ['ball', 'chair', 'bin'], count: [8, 13], lights: 7 },
}

function range(rng: () => number, min: number, max: number): number {
  return min + (max - min) * rng()
}

export function createSchoolDecor(seed: string, zone: SchoolZoneName): SchoolZoneDecor {
  const spec = ZONE_SPEC[zone]
  const rng = seedrandom(`${seed}:school:${zone}`)
  const props: SchoolPropSpawn[] = []

  const count = Math.floor(range(rng, spec.count[0], spec.count[1] + 1))
  for (let i = 0; i < count; i++) {
    const kind = spec.kinds[Math.floor(rng() * spec.kinds.length)]!
    props.push({
      id: `${zone}-sprop-${i}`,
      kind,
      position: [
        range(rng, spec.area.x[0], spec.area.x[1]),
        kind === 'ball' ? 0.22 : 0.45,
        range(rng, spec.area.z[0], spec.area.z[1]),
      ],
      rotationY: range(rng, 0, Math.PI * 2),
      disorder: rng(),
    })
  }

  const lights: SchoolLight[] = []
  for (let i = 0; i < spec.lights; i++) {
    const roll = rng()
    lights.push({
      id: `${zone}-fl-${i}`,
      // 대부분 켜져 있다 — 꺼진 게 아니라 "아무도 끄지 않은" 공간이어야 한다.
      on: roll > 0.12,
      flickerSeed: roll > 0.12 && roll < 0.3 ? rng() * 40 : undefined,
    })
  }

  return {
    props,
    lights,
    ambientOrder: [0, 1, 2].sort(() => rng() - 0.5),
  }
}
