/**
 * 플레이어 순간이동 요청 — 고리 구간(core/anomaly)처럼 플레이어 밖에서 위치를 되돌려야 할 때 쓴다.
 * PlayerController가 다음 프레임에 한 번 꺼내 쓴다. 타는 중에는 무시된다.
 */
export type TeleportRequest = { position: [number, number, number]; yaw: number }

let pending: TeleportRequest | null = null

export function requestTeleport(position: [number, number, number], yaw: number) {
  pending = { position, yaw }
}

export function takeTeleport(): TeleportRequest | null {
  const t = pending
  pending = null
  return t
}
