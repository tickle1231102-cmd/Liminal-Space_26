import seedrandom from 'seedrandom'
import type { AnomalyDef } from './types'

/**
 * 바퀴마다 이변 0개 또는 1개를 뽑는 추첨기. 시드가 같으면 순서가 같다.
 * - 첫 바퀴는 늘 이변이 없다(기준이 되는 모습을 먼저 본다).
 * - 이변은 비중대로 섞은 한 벌에서 차례로 꺼낸다 — 한 벌을 다 볼 때까지 같은 이변이 다시 나오지 않는다.
 * - 이변 없는 바퀴가 세 번 넘게 이어지지 않게 한다.
 */
export function createAnomalyDraw(seed: string, defs: AnomalyDef[], noneChance = 0.35) {
  const rng = seedrandom(`${seed}:anomaly`)
  let deck: string[] = []
  let lap = 0
  let calm = 0
  let last: string | null = null

  const shuffle = () => {
    const keyed = defs.map((d) => ({ id: d.id, key: Math.pow(rng(), 1 / (d.weight ?? 1)) }))
    keyed.sort((a, b) => a.key - b.key)
    deck = keyed.map((k) => k.id)
    // 새 한 벌의 첫 장이 방금 본 이변이면 뒤로 돌린다
    if (deck.length > 1 && deck[deck.length - 1] === last) deck.unshift(deck.pop()!)
  }

  return function next(): string | null {
    const first = lap++ === 0
    if (!defs.length || first || (calm < 3 && rng() < noneChance)) {
      calm++
      return null
    }
    calm = 0
    if (!deck.length) shuffle()
    last = deck.pop()!
    return last
  }
}
