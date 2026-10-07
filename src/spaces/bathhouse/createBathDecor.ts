import seedrandom from 'seedrandom'

export type Vec3 = [number, number, number]
export type BathPropKind = 'stool' | 'oke' | 'rubber_duck' | 'towel_cart' | 'basket'
export type BathZoneName = 'genkan' | 'dressing' | 'hall' | 'tub'

export type BathPropSpawn = { id: string; kind: BathPropKind; position: Vec3; rotationY: number }

export type BathZoneDecor = {
  props: BathPropSpawn[]
  /** 물방울이 떨어지는 수도꼭지(샤워 칸 인덱스) — 오디오가 쓴다 */
  drips: number[]
}

type Rect = { x: [number, number]; z: [number, number] }

/** 서쪽 벽 샤워 칸 중심 z (BathHallZone과 같은 값) */
export const SHOWER_Z = [-24, -21, -18, -15, -12] as const
/** 칸 하나에 자리 두 개 (shower_unit.py: x = ±L/4) */
const SEATS = SHOWER_Z.flatMap((z) => [z - 0.65, z + 0.65])

/**
 * 구역별 소품 스폰 규칙. 거시 구조(탕·샤워·락커 위치)는 여기 없다 —
 * 재시드로 흔들리는 건 소품 배치와 물방울 위치뿐(PRD 04·13절).
 */
const ZONES: Record<BathZoneName, { area: Rect; avoid: Rect[]; kinds: BathPropKind[]; count: [number, number] }> = {
  genkan: { area: { x: [-4.5, 4.5], z: [10, 18.5] }, avoid: [], kinds: ['basket'], count: [0, 1] },
  dressing: {
    area: { x: [-8.4, 8.4], z: [-8.5, 5] },
    avoid: [{ x: [-3.5, -1.7], z: [-3.3, 1.3] }, { x: [1.7, 3.5], z: [-3.3, 1.3] }],
    kinds: ['basket', 'basket', 'stool', 'towel_cart'],
    count: [5, 9],
  },
  hall: {
    area: { x: [-12, 12.5], z: [-26, -11] },
    avoid: [{ x: [5.8, 8.2], z: [-22.3, -13.7] }],
    kinds: ['stool', 'oke', 'oke'],
    count: [4, 8],
  },
  tub: { area: { x: [-9.5, 3.5], z: [-33.5, -27.5] }, avoid: [], kinds: ['rubber_duck', 'rubber_duck', 'oke'], count: [3, 7] },
}

const inside = (r: Rect, x: number, z: number) => x >= r.x[0] && x <= r.x[1] && z >= r.z[0] && z <= r.z[1]

export function createBathDecor(seed: string, zone: BathZoneName): BathZoneDecor {
  const rng = seedrandom(`${seed}:bathhouse:${zone}`)
  const r = (a: number, b: number) => a + (b - a) * rng()
  const spec = ZONES[zone]
  const props: BathPropSpawn[] = []
  let carts = 0

  const n = Math.floor(r(spec.count[0], spec.count[1] + 1))
  for (let i = 0, tries = 0; props.length < n && tries < 80; tries++) {
    const x = r(...spec.area.x)
    const z = r(...spec.area.z)
    if (spec.avoid.some((a) => inside(a, x, z))) continue
    if (props.some((p) => Math.hypot(p.position[0] - x, p.position[2] - z) < 0.9)) continue
    let kind = spec.kinds[Math.floor(rng() * spec.kinds.length)]!
    if (kind === 'towel_cart' && carts++ > 0) kind = 'basket'
    const y = zone === 'tub' ? 0.1 : kind === 'towel_cart' ? 0.5 : 0.2
    props.push({ id: `${zone}-bprop-${i++}`, kind, position: [x, y, z], rotationY: r(0, Math.PI * 2) })
  }

  // 샤워 자리마다 의자와 바가지 — 대부분 제자리, 몇 개는 밀려나 있다
  if (zone === 'hall') {
    SEATS.forEach((z, s) => {
      const off = rng() < 0.25 ? r(0.4, 1.4) : r(0, 0.12)
      if (rng() < 0.85) props.push({ id: `seat-stool-${s}`, kind: 'stool', position: [-13 + off, 0.15, z + r(-0.1, 0.1)], rotationY: r(-0.3, 0.3) })
      // 바가지는 의자 위에 엎어 두거나 바닥에
      if (rng() < 0.7) props.push({ id: `seat-oke-${s}`, kind: 'oke', position: [-13 + off + r(-0.05, 0.05), 0.42, z], rotationY: r(0, 6) })
    })
  }

  const drips = SEATS.map((_, i) => i).filter(() => rng() < 0.3)
  return { props, drips }
}
