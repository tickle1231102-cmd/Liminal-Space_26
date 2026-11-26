import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { audioContext, noiseBuffer, noiseLoop, SpatialSource } from '../../core/audio/spatial'
import { useActiveChair } from './JjimProps'
import { CHANNEL, DOORS, HALL, HALL_FIX, ROOMS, SLEEP, STAFF, WASHERS } from './layout'

type Vec3 = [number, number, number]
const mid = (r: [number, number]) => (r[0] + r[1]) / 2

const BEAT = 0.34
/** 트로트풍 5음계 장조(도레미솔라) — 가사 없이 반주 선율만. 쿵짝 두 박에 한 음 */
const SCALE = [0, 2, 4, 7, 9, 12]
const PHRASE = [2, 3, 4, 3, 2, 1, 0, 1, 2, 4, 5, 4, 3, 2, 1, 0]

/** 매점 라디오: 사각파 선율 + 쿵짝 저음 → 대역 제한(작은 스피커) + 느린 피치 워블 + 잡음. */
function radio(ctx: AudioContext, out: SpatialSource): (() => void)[] {
  const tone = ctx.createOscillator()
  tone.type = 'square'
  const bass = ctx.createOscillator()
  bass.type = 'triangle'
  const band = ctx.createBiquadFilter()
  band.type = 'bandpass'
  band.frequency.value = 1300
  band.Q.value = 0.8
  const env = ctx.createGain()
  env.gain.value = 0
  const bassEnv = ctx.createGain()
  bassEnv.gain.value = 0
  const wob = ctx.createOscillator()
  const depth = ctx.createGain()
  wob.frequency.value = 0.083
  depth.gain.value = 8
  wob.connect(depth)
  depth.connect(tone.frequency)
  depth.connect(bass.frequency)
  tone.connect(band).connect(env).connect(out.out)
  bass.connect(bassEnv).connect(band)
  tone.start()
  bass.start()
  wob.start()
  const stopNoise = noiseLoop(out, 'white', { type: 'highpass', freq: 3200 }, 0.27)
  let step = 0
  const timer = window.setInterval(() => {
    const t = ctx.currentTime
    const half = step % 2
    if (!half) {
      const semis = SCALE[PHRASE[(step / 2) % PHRASE.length]!]!
      tone.frequency.setTargetAtTime(294 * Math.pow(2, semis / 12), t, 0.02)
      env.gain.cancelScheduledValues(t)
      env.gain.setTargetAtTime(0.45, t, 0.015)
      env.gain.setTargetAtTime(0.12, t + BEAT * 1.2, 0.1)
    }
    // 쿵(으뜸음) 짝(5도)
    bass.frequency.setTargetAtTime(half ? 110 : 73.4, t, 0.01)
    bassEnv.gain.cancelScheduledValues(t)
    bassEnv.gain.setTargetAtTime(half ? 0.25 : 0.5, t, 0.01)
    bassEnv.gain.setTargetAtTime(0.0, t + BEAT * 0.45, 0.05)
    step++
  }, BEAT * 1000)
  return [
    () => {
      tone.stop()
      bass.stop()
      wob.stop()
    },
    stopNoise,
    () => window.clearInterval(timer),
  ]
}

/** 짧은 잡음 한 번 — 장작 타닥, 성에 딱, 초침. */
function click(src: SpatialSource, buf: AudioBuffer, freq: number, gain: number, len = 0.03) {
  const { ctx } = src
  const t = ctx.currentTime
  const n = ctx.createBufferSource()
  n.buffer = buf
  const f = ctx.createBiquadFilter()
  f.type = 'bandpass'
  f.frequency.value = freq
  f.Q.value = 1.5
  const g = ctx.createGain()
  g.gain.setValueAtTime(gain, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + len)
  n.connect(f).connect(g).connect(src.out)
  n.start(t, Math.random() * 3)
  n.stop(t + len + 0.02)
}

/** 불규칙(또는 일정) 간격으로 fn을 부른다. 정지 함수를 돌려준다 */
function every(fn: () => void, min: number, max = min) {
  let alive = true
  const loop = () => {
    if (!alive) return
    fn()
    window.setTimeout(loop, (min + Math.random() * (max - min)) * 1000)
  }
  window.setTimeout(loop, min * 1000 * Math.random())
  return () => {
    alive = false
  }
}

/**
 * 찜질방 앰비언스(PRD 15절): 온돌 보일러 저음, 수로 물소리, 불가마 장작, 얼음방 냉동기, 안마의자 롤러,
 * 냉장고 컴프레서, 매점 라디오(피치 워블), TV 정파 잡음, 세탁기. 외부 음원 없음, 대사·가사 없음.
 * 수면실에는 초침 소리만 둔다 — 다른 소스는 거리 감쇠로 그 방에 닿지 않게 범위를 잡았다.
 */
export function JjimAudio({ enabled }: { enabled: boolean }) {
  const { camera } = useThree()
  const chair = useActiveChair(HALL_FIX.massage.z.length)
  const sources = useRef<SpatialSource[]>([])

  useEffect(() => {
    if (!enabled) return
    const ctx = audioContext()
    const white = noiseBuffer(ctx, 'white', 4)
    const stops: (() => void)[] = []
    const made: SpatialSource[] = []
    const src = (p: Vec3, range: number, vol: number) => {
      const s = new SpatialSource(ctx, new THREE.Vector3(...p), range, vol)
      made.push(s)
      return s
    }
    const kiln: Vec3 = [mid(ROOMS.kiln.x), 0.6, mid(ROOMS.kiln.z)]
    const ice: Vec3 = [mid(ROOMS.ice.x), 1.8, mid(ROOMS.ice.z)]

    // 온돌 보일러 — 골목과 홀 사이에서 퍼지는 아주 낮은 웅웅거림. 수면실(동쪽 끝)에는 거의 닿지 않는다
    stops.push(noiseLoop(src([0, 0.2, -14], 34, 0.14), 'brown', { type: 'lowpass', freq: 85 }, 0.03))
    // 족욕 수로 — 졸졸 흐르는 순환수, 세 군데
    for (const z of [CHANNEL.z[0] + 2, 0, CHANNEL.z[1] - 2]) {
      stops.push(noiseLoop(src([0, 0, z], 9, 0.035), 'white', { type: 'bandpass', freq: 1300 + z * 20, q: 0.8 }, 0.13))
    }
    // 불가마 — 낮은 불 소리 + 드문 장작 타닥. 직원 통로의 아궁이 쪽에서도 들린다
    stops.push(noiseLoop(src(kiln, 11, 0.05), 'brown', { type: 'lowpass', freq: 220 }, 0.11))
    const crackle = src(kiln, 12, 0.3)
    const furnace = src([STAFF.x[0] - 0.4, 0.8, mid(DOORS.staffToFurnace)], 8, 0.25)
    stops.push(every(() => click(crackle, white, 1800 + Math.random() * 2200, 0.5), 0.5, 3.2))
    stops.push(every(() => click(furnace, white, 1500 + Math.random() * 2000, 0.5), 0.8, 4))
    // 얼음방 — 냉동기 윙 + 성에가 딱 갈라지는 소리
    stops.push(noiseLoop(src(ice, 9, 0.05), 'white', { type: 'bandpass', freq: 2600, q: 4 }))
    stops.push(noiseLoop(src(ice, 9, 0.07), 'brown', { type: 'lowpass', freq: 130 }, 0.07))
    const frost = src(ice, 8, 0.2)
    stops.push(every(() => click(frost, white, 5200, 0.6, 0.015), 4, 11))
    // 식혜 냉장고 컴프레서 — 켜졌다 잦아드는 긴 주기
    stops.push(noiseLoop(src([HALL_FIX.fridge[0], 0.4, HALL_FIX.fridge[1]], 10, 0.07), 'brown', { type: 'lowpass', freq: 150 }, 0.021))
    // 매점 라디오
    stops.push(...radio(ctx, src([HALL_FIX.snackBar[0] + 2.8, 1.2, HALL_FIX.snackBar[1] - 0.3], 15, 0.03)))
    // TV 정파 잡음 — 바로 앞에 가야 들린다
    stops.push(noiseLoop(src([0, HALL_FIX.tvY, HALL.z[0] + 0.3], 6, 0.025), 'white', { type: 'bandpass', freq: 5200, q: 0.7 }))
    // 세탁기 — 돌고 있는 한 대
    stops.push(noiseLoop(src([WASHERS.x - 0.4, 0.5, WASHERS.z[WASHERS.running]!], 8, 0.09), 'brown', { type: 'lowpass', freq: 120 }, 0.85))
    // 수면실 초침 — 이 방에서는 이 소리뿐이다
    const tick = src([24, 1.95, SLEEP.z[1] - 0.3], 13, 0.22)
    stops.push(every(() => click(tick, white, 3400, 0.5, 0.012), 1))

    sources.current.push(...made)
    return () => {
      stops.forEach((s) => s())
      made.forEach((s) => s.dispose())
      sources.current = sources.current.filter((s) => !made.includes(s))
    }
  }, [enabled])

  // 안마의자 롤러 — 시드로 고른 한 대에서만. 4초 주기로 오르내리는 낮은 모터음
  useEffect(() => {
    if (!enabled) return
    const ctx = audioContext()
    const s = new SpatialSource(ctx, new THREE.Vector3(HALL_FIX.massage.x, 0.7, HALL_FIX.massage.z[chair]!), 10, 0.09)
    const stop = noiseLoop(s, 'brown', { type: 'bandpass', freq: 190, q: 1.4 }, 0.25)
    sources.current.push(s)
    return () => {
      stop()
      s.dispose()
      sources.current = sources.current.filter((x) => x !== s)
    }
  }, [enabled, chair])

  const frame = useRef(0)
  useFrame(() => {
    if (!enabled || frame.current++ % 6) return
    for (const s of sources.current) s.update(camera.position)
  })

  return null
}
