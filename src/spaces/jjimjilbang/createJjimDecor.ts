import seedrandom from 'seedrandom'
import { CHANNEL, HALL, LAUNDRY, ROOMS, SLEEP, type Range } from './layout'

export type Vec3 = [number, number, number]
export type JjimPropKind = 'mat' | 'mokchim' | 'egg' | 'can' | 'ball' | 'bucket' | 'straw' | 'cart'
export type JjimZoneName = 'entrance' | 'alley' | 'channel' | 'clay' | 'kiln' | 'hall' | 'sleep' | 'laundry'
export const JJIM_ZONES: JjimZoneName[] = ['entrance', 'alley', 'channel', 'clay', 'kiln', 'hall', 'sleep', 'laundry']

export type JjimPropSpawn = { id: string; kind: JjimPropKind; position: Vec3; rotationY: number }

type Rect = { x: Range; z: Range }
const inside = (r: Rect, x: number, z: number) => x >= r.x[0] && x <= r.x[1] && z >= r.z[0] && z <= r.z[1]
const shrink = (r: Rect, m: number): Rect => ({ x: [r.x[0] + m, r.x[1] - m], z: [r.z[0] + m, r.z[1] - m] })

/** 떨어뜨리는 높이(m) — 소품 중심 기준, 바닥 위로 살짝 */
const DROP: Record<JjimPropKind, number> = { mat: 0.06, mokchim: 0.1, egg: 0.06, can: 0.1, ball: 0.02, bucket: 0.12, straw: 0.05, cart: 0.45 }
/** 서로 겹치지 않게 두는 최소 간격(m) */
const SPACING: Record<JjimPropKind, number> = { mat: 2.1, mokchim: 0.6, egg: 0.15, can: 0.2, ball: 0.11, bucket: 0.6, straw: 0.9, cart: 1.4 }

/**
 * 구역별 소품 스폰 규칙. 거시 구조(수로·방·매점·토굴 위치)는 layout.ts에 있고 여기서는 바꾸지 않는다 —
 * 재시드로 흔들리는 건 소품 배치와 켜진 토굴뿐(PRD 04·15절).
 */
const ZONES: Record<Exclude<JjimZoneName, 'channel' | 'hall'>, { area: Rect; avoid: Rect[]; kinds: JjimPropKind[]; count: Range }> = {
  // 카운터(동쪽)와 신발장(서쪽) 사이 장판 위
  entrance: { area: { x: [-3.2, 1.6], z: [13.5, 17.5] }, avoid: [], kinds: ['cart'], count: [0, 1] },
  // 수로 양옆 통로 — 수로와 돌다리 위는 피한다
  alley: {
    area: { x: [-5, 5], z: [-10.5, 10.5] },
    avoid: [{ x: [-CHANNEL.half - 0.3, CHANNEL.half + 0.3], z: [-12, 12] }],
    kinds: ['bucket'],
    count: [2, 5],
  },
  clay: { area: shrink(ROOMS.clay, 1), avoid: [], kinds: ['mokchim', 'mokchim', 'straw'], count: [2, 4] },
  kiln: { area: shrink(ROOMS.kiln, 1.5), avoid: [], kinds: ['straw'], count: [4, 8] },
  // 토굴 앞 바닥 (북·동벽 굴 2.3 m는 피한다)
  sleep: {
    area: { x: [SLEEP.x[0] + 1, SLEEP.x[1] - 3.4], z: [SLEEP.z[0] + 3.4, SLEEP.z[1] - 1] },
    avoid: [],
    kinds: ['mat', 'mokchim'],
    count: [2, 4],
  },
  laundry: { area: { x: [LAUNDRY.x[0] + 1, LAUNDRY.x[1] - 2], z: [LAUNDRY.z[0] + 1.5, LAUNDRY.z[1] - 3.2] }, avoid: [], kinds: ['cart'], count: [1, 2] },
}

/** 홀: 매트가 깔리는 범위와 피할 곳(매점 카운터 앞, 안마의자 열, 서가, 골목·수면실 문 앞) */
const HALL_MATS: Rect = { x: [HALL.x[0] + 3.5, HALL.x[1] - 2], z: [HALL.z[0] + 5.5, HALL.z[1] - 3] }
const HALL_AVOID: Rect[] = [
  { x: [-4, 4], z: [-17, -12] },
  { x: [12, 16], z: [-36, -30] },
]
/** 매점 카운터 앞 — 계란과 식혜 캔이 굴러다니는 곳 */
const SNACK_FRONT: Rect = { x: [-14, -8], z: [HALL.z[0] + 4, HALL.z[0] + 7] }

export function createJjimDecor(seed: string, zone: JjimZoneName): JjimPropSpawn[] {
  const rng = seedrandom(`${seed}:jjimjilbang:${zone}`)
  const r = (a: number, b: number) => a + (b - a) * rng()
  const int = (a: number, b: number) => Math.floor(r(a, b + 1))
  const props: JjimPropSpawn[] = []
  const put = (kind: JjimPropKind, x: number, z: number, y = DROP[kind], rotationY = r(0, Math.PI * 2)) =>
    props.push({ id: `${zone}-jprop-${props.length}`, kind, position: [x, y, z], rotationY })
  const clear = (kind: JjimPropKind, x: number, z: number) =>
    !props.some((p) => Math.hypot(p.position[0] - x, p.position[2] - z) < Math.max(SPACING[kind], SPACING[p.kind]) * 0.75)

  if (zone === 'channel') {
    // 편백 볼 — 물길과 상관없이 한곳에 모여 있다(위화감). 모이는 자리만 재시드한다. 돌다리 밑은 피한다
    const free = [-7.5, -2.5, 0, 2.5, 7.5]
    const cz = free[int(0, free.length - 1)]! + r(-0.6, 0.6)
    const n = int(7, 12)
    for (let tries = 0; props.length < n && tries < 200; tries++) {
      const x = r(-0.42, 0.42)
      const z = cz + r(-0.5, 0.5)
      if (clear('ball', x, z)) put('ball', x, z, CHANNEL.surface + DROP.ball)
    }
    return props
  }

  if (zone === 'hall') {
    // 매트 — 대부분 목침이 머리맡에 놓여 있다
    const n = int(9, 14)
    for (let tries = 0; props.filter((p) => p.kind === 'mat').length < n && tries < 300; tries++) {
      const x = r(...HALL_MATS.x)
      const z = r(...HALL_MATS.z)
      if (HALL_AVOID.some((a) => inside(a, x, z)) || !clear('mat', x, z)) continue
      // TV(북벽)를 향해 눕는 방향이 기본, 조금씩 틀어져 있다
      const rot = (rng() < 0.75 ? 0 : Math.PI / 2) + r(-0.25, 0.25)
      put('mat', x, z, DROP.mat, rot)
      if (rng() < 0.8) {
        // 매트의 긴 축(로컬 z) 끝 머리맡에 올려 둔다
        const head = 0.72
        put('mokchim', x + Math.sin(rot) * head, z + Math.cos(rot) * head, 0.2, rot + r(-0.3, 0.3))
      }
    }
    for (const [kind, lo, hi] of [['egg', 3, 7], ['can', 3, 6]] as const) {
      const m = int(lo, hi)
      for (let i = 0, tries = 0; i < m && tries < 80; tries++) {
        // 대부분 매점 앞, 가끔 홀 한가운데까지 굴러가 있다
        const far = rng() < 0.25
        const x = far ? r(-10, 10) : r(...SNACK_FRONT.x)
        const z = far ? r(-34, -16) : r(...SNACK_FRONT.z)
        if (!clear(kind, x, z)) continue
        put(kind, x, z)
        i++
      }
    }
    return props
  }

  const spec = ZONES[zone]
  const n = int(...spec.count)
  for (let tries = 0; props.length < n && tries < 120; tries++) {
    const x = r(...spec.area.x)
    const z = r(...spec.area.z)
    const kind = spec.kinds[int(0, spec.kinds.length - 1)]!
    if (spec.avoid.some((a) => inside(a, x, z)) || !clear(kind, x, z)) continue
    put(kind, x, z)
  }
  return props
}

/** 안쪽 등이 켜진 토굴 하나 — 줄(북·동), 칸, 단(0 아래·1 위)을 시드로 고른다. */
export function pickLitCave(seed: string, north: number, east: number): { bank: 'north' | 'east'; index: number; tier: 0 | 1 } {
  const rng = seedrandom(`${seed}:jjimjilbang:lit-cave`)
  const k = Math.floor(rng() * (north + east))
  const tier = rng() < 0.5 ? 0 : 1
  return k < north ? { bank: 'north', index: k, tier } : { bank: 'east', index: k - north, tier }
}
