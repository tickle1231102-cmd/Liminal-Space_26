import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { audioContext, drip, noiseLoop, SpatialSource } from '../../core/audio/spatial'
import { useBathDrips } from './BathProps'
import { SHOWER_Z } from './createBathDecor'

/** 라디오 두 대 — 남탕은 반다이 남탕 쪽, 여탕은 화장대 위. lag는 박자 단위 */
const RADIOS: { at: [number, number, number]; lag: number; wobble: number }[] = [
  { at: [-9.4, 1.5, 7.2], lag: 0, wobble: 0.09 },
  { at: [-24.6, 1.0, 11.4], lag: 0.5, wobble: 0.071 },
]
const BEAT = 0.62
/** 엔카풍 5음계(요나누키 단조) — 가사 없이 반주 선율만 */
const SCALE = [0, 1, 5, 7, 8, 12]
const PHRASE = [3, 4, 3, 2, 1, 2, 0, -1, 0, 1, 2, 3, 2, 1, 0, -1]

/** 사각파 선율 → 대역 제한(옛 스피커) + 느린 피치 워블 + 잡음. 정지 함수들을 돌려준다. */
function radio(ctx: AudioContext, out: SpatialSource, lag: number, wobble: number): (() => void)[] {
  const tone = ctx.createOscillator()
  tone.type = 'square'
  const band = ctx.createBiquadFilter()
  band.type = 'bandpass'
  band.frequency.value = 1100
  band.Q.value = 0.9
  const env = ctx.createGain()
  env.gain.value = 0
  const wob = ctx.createOscillator()
  const wobDepth = ctx.createGain()
  wob.frequency.value = wobble
  wobDepth.gain.value = 9 // cents 대신 Hz — 낮은 음에서 반음 가까이 흔들린다
  wob.connect(wobDepth).connect(tone.frequency)
  tone.connect(band).connect(env).connect(out.out)
  tone.start()
  wob.start()
  const stopNoise = noiseLoop(out, 'white', { type: 'highpass', freq: 3000 }, 0.3) // 잡음

  let step = 0
  let timer = 0
  const tick = () => {
    const t = ctx.currentTime
    const deg = PHRASE[step % PHRASE.length]!
    const semis = deg < 0 ? SCALE[SCALE.length + deg]! - 12 : SCALE[deg]!
    tone.frequency.setTargetAtTime(220 * Math.pow(2, semis / 12), t, 0.03)
    env.gain.cancelScheduledValues(t)
    env.gain.setTargetAtTime(0.5, t, 0.02)
    env.gain.setTargetAtTime(0.15, t + BEAT * 0.6, 0.12)
    step++
  }
  const start = window.setTimeout(() => {
    timer = window.setInterval(tick, BEAT * 1000)
  }, lag * BEAT * 1000)
  return [
    () => {
      tone.stop()
      wob.stop()
    },
    stopNoise,
    () => {
      window.clearTimeout(start)
      window.clearInterval(timer)
    },
  ]
}

/**
 * 센토 앰비언스(PRD 13절): 물방울, 탕 넘치는 소리, 환풍기, 보일러 저음, 라디오.
 * 라디오는 피치 워블(느린 디튠 LFO)을 걸어 반 박자 어긋난 느낌을 준다. 외부 음원 없음.
 */
export function BathAudio({ enabled }: { enabled: boolean }) {
  const { camera } = useThree()
  const drips = useBathDrips()
  const sources = useRef<SpatialSource[]>([])
  const dripSrcs = useRef<SpatialSource[]>([])

  useEffect(() => {
    if (!enabled) return
    const ctx = audioContext()
    const stops: (() => void)[] = []
    const src = (p: [number, number, number], range: number, vol: number) => {
      const s = new SpatialSource(ctx, new THREE.Vector3(...p), range, vol)
      sources.current.push(s)
      return s
    }

    // 대욕조 가장자리로 넘치는 물 — 밴드패스 백색소음
    stops.push(noiseLoop(src([-3, 0, -27], 22, 0.05), 'white', { type: 'bandpass', freq: 900, q: 0.6 }, 0.11))
    // 열탕 토수구
    stops.push(noiseLoop(src([9.7, 1.4, -33.6], 12, 0.05), 'white', { type: 'bandpass', freq: 1600, q: 1.2 }))
    // 여탕 욕실 — 같은 물소리가 칸막이 위로 넘어온다. 열탕 모델은 반전하지 않으므로 토수구는 중심 +1.2
    stops.push(noiseLoop(src([-25, 0, -27], 22, 0.04), 'white', { type: 'bandpass', freq: 900, q: 0.6 }, 0.11))
    stops.push(noiseLoop(src([-35.3, 1.4, -33.6], 12, 0.04), 'white', { type: 'bandpass', freq: 1600, q: 1.2 }))
    // 배관 복도 — 관을 타고 흐르는 물의 낮은 쉬익
    stops.push(noiseLoop(src([-13.5, 2.2, -38.4], 26, 0.03), 'brown', { type: 'lowpass', freq: 500 }, 0.04))
    // 탈의실 천장 환풍기 — 저역 브라운 노이즈 + 120Hz 부근 공명
    stops.push(noiseLoop(src([0, 3, -1], 16, 0.06), 'brown', { type: 'lowpass', freq: 260 }, 0.05))
    // 보일러실 — 아주 낮은 웅웅거림, 벽 너머로 희미하게 들린다
    stops.push(noiseLoop(src([22.5, 1, -32], 30, 0.16), 'brown', { type: 'lowpass', freq: 90 }, 0.03))

    // 라디오 두 대 — 같은 엔카 반주인데 여탕 쪽은 반 박자 늦고 워블도 조금 다르다
    for (const r of RADIOS) stops.push(...radio(ctx, src(r.at, 14, 0.035), r.lag, r.wobble))

    return () => {
      stops.forEach((s) => s())
      sources.current.forEach((s) => s.dispose())
      sources.current = []
    }
  }, [enabled])

  // 재시드마다 바뀌는 물방울 위치 — 샤워 자리(칸당 두 자리)의 수도꼭지
  useEffect(() => {
    if (!enabled) return
    const ctx = audioContext()
    const seats = SHOWER_Z.flatMap((z) => [z - 0.65, z + 0.65])
    dripSrcs.current = drips.map((i) => new SpatialSource(ctx, new THREE.Vector3(-13.4, 0.5, seats[i]!), 9, 0.08))
    const timers = dripSrcs.current.map((s, i) => {
      let alive = true
      const loop = () => {
        if (!alive) return
        drip(s, 0.85 + ((i * 37) % 10) / 30)
        window.setTimeout(loop, 1400 + ((i * 613) % 1700) + Math.random() * 400)
      }
      window.setTimeout(loop, i * 350)
      return () => (alive = false)
    })
    return () => {
      timers.forEach((t) => t())
      dripSrcs.current.forEach((s) => s.dispose())
      dripSrcs.current = []
    }
  }, [enabled, drips])

  const frame = useRef(0)
  useFrame(() => {
    if (!enabled || frame.current++ % 6) return
    const p = camera.position
    for (const s of sources.current) s.update(p)
    for (const s of dripSrcs.current) s.update(p)
  })

  return null
}
