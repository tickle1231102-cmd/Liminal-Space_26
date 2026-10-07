/**
 * 절차적 공간 오디오 — 외부 음원(라이선스) 없이 Web Audio로 만든 앰비언스.
 * 소스마다 위치를 갖고, 매 프레임 청자(카메라) 거리로 볼륨만 감쇠한다(패닝 없음 — 모바일 부담 최소).
 */
import * as THREE from 'three'

let shared: AudioContext | null = null
export function audioContext(): AudioContext {
  if (!shared || shared.state === 'closed') {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    shared = new Ctx()
  }
  if (shared.state === 'suspended') void shared.resume()
  return shared
}

/** 루프용 노이즈 버퍼. brown = 저음 웅웅, pink에 가까운 white = 쉭 */
export function noiseBuffer(ctx: AudioContext, kind: 'white' | 'brown', seconds = 4): AudioBuffer {
  const len = Math.floor(ctx.sampleRate * seconds)
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const d = buf.getChannelData(0)
  let last = 0
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1
    if (kind === 'brown') {
      last = (last + 0.02 * w) / 1.02
      d[i] = last * 3.5
    } else d[i] = w
  }
  return buf
}

export class SpatialSource {
  readonly out: GainNode
  readonly ctx: AudioContext
  readonly position: THREE.Vector3
  /** 이 거리에서 0이 된다 */
  readonly range: number
  /** 가까이서의 볼륨 */
  readonly volume: number
  private level = 0
  constructor(ctx: AudioContext, position: THREE.Vector3, range: number, volume: number) {
    this.ctx = ctx
    this.position = position
    this.range = range
    this.volume = volume
    this.out = ctx.createGain()
    this.out.gain.value = 0
    this.out.connect(ctx.destination)
  }

  update(listener: THREE.Vector3) {
    const a = THREE.MathUtils.clamp(1 - listener.distanceTo(this.position) / this.range, 0, 1)
    const target = this.volume * a * a
    if (Math.abs(target - this.level) < 1e-4) return
    this.level = target
    this.out.gain.setTargetAtTime(target, this.ctx.currentTime, 0.2)
  }

  dispose() {
    this.out.disconnect()
  }
}

/** 필터를 거친 노이즈 루프 (환풍기·보일러·물 흐르는 소리). lfoHz > 0이면 볼륨이 천천히 일렁인다. */
export function noiseLoop(
  src: SpatialSource,
  kind: 'white' | 'brown',
  filter: { type: BiquadFilterType; freq: number; q?: number },
  lfoHz = 0,
) {
  const { ctx } = src
  const n = ctx.createBufferSource()
  n.buffer = noiseBuffer(ctx, kind)
  n.loop = true
  const f = ctx.createBiquadFilter()
  f.type = filter.type
  f.frequency.value = filter.freq
  f.Q.value = filter.q ?? 0.7
  const g = ctx.createGain()
  g.gain.value = 1
  n.connect(f).connect(g).connect(src.out)
  const stops: (() => void)[] = [() => n.stop()]
  if (lfoHz > 0) {
    const lfo = ctx.createOscillator()
    const depth = ctx.createGain()
    lfo.frequency.value = lfoHz
    depth.gain.value = 0.35
    lfo.connect(depth).connect(g.gain)
    lfo.start()
    stops.push(() => lfo.stop())
  }
  n.start()
  return () => stops.forEach((s) => s())
}

/** 물방울 하나 — 짧게 위로 미끄러지는 사인 + 빠른 감쇠. */
export function drip(src: SpatialSource, pitch = 1) {
  const { ctx } = src
  const t = ctx.currentTime
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.type = 'sine'
  o.frequency.setValueAtTime(900 * pitch, t)
  o.frequency.exponentialRampToValueAtTime(1900 * pitch, t + 0.05)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(0.5, t + 0.005)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18)
  o.connect(g).connect(src.out)
  o.start(t)
  o.stop(t + 0.2)
}
