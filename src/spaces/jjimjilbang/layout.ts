/**
 * 찜질방 평면 (docs/space-jjimjilbang-plan.md 2절). Three 좌표, 플레이어는 -Z로 들어간다.
 * 거시 구조는 여기 한 곳에서만 정한다 — 구역 파일과 소품 배치가 같은 숫자를 쓴다.
 */
export type Range = [number, number]
export type Rect = { x: Range; z: Range; h: number }

export const ENTRANCE: Rect = { x: [-5, 5], z: [12, 26], h: 2.6 }
export const ALLEY: Rect = { x: [-6, 6], z: [-12, 12], h: 3.2 }
export const HALL: Rect = { x: [-16, 16], z: [-40, -12], h: 6 }
export const SLEEP: Rect = { x: [16, 30], z: [-40, -24], h: 2.4 }
/** 직원 통로 — 수면실 남쪽 문에서 카운터 뒤 연결부까지 */
export const STAFF: Rect = { x: [17, 21], z: [-24, 15.5], h: 2.2 }
/** 카운터 뒤 문과 직원 통로를 잇는 짧은 연결부 */
export const LINK: Rect = { x: [5, 17], z: [12.5, 15.5], h: 2.2 }
export const LAUNDRY: Rect = { x: [21, 30], z: [-24, -10], h: 2.2 }

export type RoomKind = 'salt' | 'clay' | 'kiln' | 'ice'
/** 테마방. door는 골목 벽(x=±6)에 뚫리는 문 구간(z). */
export const ROOMS: Record<RoomKind, Rect & { door: Range }> = {
  salt: { x: [-14, -6], z: [3, 11], h: 2.4, door: [6, 8] },
  clay: { x: [-14, -6], z: [-9, -1], h: 2.4, door: [-6, -4] },
  kiln: { x: [6, 16], z: [1, 11], h: 4, door: [5, 7] },
  ice: { x: [6, 12], z: [-9, -3], h: 2.2, door: [-7, -5] },
}
/** 불가마 아치 입구는 낮다 */
export const KILN_DOOR_H = 1.85

/** 문 구간 */
export const DOORS = {
  entranceToAlley: [-1.5, 1.5] as Range, // z=12 벽, x
  alleyToHall: [-3, 3] as Range, // z=-12 벽, x
  hallToSleep: [-34, -32] as Range, // x=16 벽, z
  sleepToStaff: [18, 20] as Range, // z=-24 벽, x
  staffToLaundry: [-18, -16] as Range, // x=21 벽, z
  staffToFurnace: [5, 7] as Range, // x=17 벽, z — 아궁이 알코브(불가마 철창)
  counterBack: [13, 15] as Range, // x=5 벽, z
}

/**
 * 족욕 수로 — 골목 한가운데. 양옆이 완만한 경사라 어디서든 걸어 들어가고 나온다(수영 없음).
 * 단면: x=±half에서 y=0 → x=±flat에서 y=bottom, 그 사이는 평평한 바닥.
 */
export const CHANNEL = {
  half: 1.5,
  flat: 0.5,
  z: [-9, 9] as Range,
  bottom: -0.25,
  surface: -0.12,
  /** 돌다리(바닥 높이 슬랩) 중심 z와 폭 */
  bridges: [-5, 5],
  bridgeWidth: 1.2,
}

const WALL_T = 0.125

/** 토굴 모듈(cave_bank.py: 폭 2 m, 깊이 2.2 m) 배치 — 북벽 줄은 남쪽(+z), 동벽 줄은 서쪽(-x)을 본다 */
export const CAVES = {
  depth: 2.2,
  northX: [18, 20, 22, 24, 26],
  northFront: SLEEP.z[0] + WALL_T + 2.2,
  eastZ: [-36, -34, -32, -30, -28, -26],
  eastFront: SLEEP.x[1] - WALL_T - 2.2,
  /** 굴 바닥 높이: 아랫단·윗단 (cave_bank.py FLOORS) */
  floors: [0.12, 1.3],
}

/** 홀의 고정 랜드마크 (모델 원점 = 바닥 중심) */
export const HALL_FIX = {
  /** 안마의자 열 — 서벽에 등을 대고 동쪽을 본다 */
  massage: { x: HALL.x[0] + WALL_T + 0.6, z: [-32, -29, -26, -23, -20, -17] },
  snackBar: [-11, HALL.z[0] + 3] as Range,
  fridge: [-15, HALL.z[0] + WALL_T + 0.4] as Range,
  /** 북벽 TV 중심 x, 화면 중심 높이 */
  tvX: [-3, 0, 3],
  tvY: 2.6,
  comicShelf: [12, HALL.z[1] - WALL_T - 0.225] as Range,
  charging: [HALL.x[1] - WALL_T - 0.225, -16] as Range,
  /** 양머리 수건이 놓인 매트 — 시드로 흩뿌리는 매트와 달리 늘 같은 자리 */
  towelMat: [9, -22] as Range,
}

/** 세탁기 열 — 세탁실 동벽에 등을 대고 서쪽을 본다. 첫 번째만 돌고 있다 */
export const WASHERS = { x: LAUNDRY.x[1] - WALL_T - 0.45, z: [-22.5, -21.4, -20.3], running: 0 }
