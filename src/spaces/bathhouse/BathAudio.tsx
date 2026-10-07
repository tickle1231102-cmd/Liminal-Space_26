import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { audioContext, drip, noiseLoop, SpatialSource } from '../../core/audio/spatial'
import { useBathDrips } from './BathProps'
import { SHOWER_Z } from './createBathDecor'

/** 탈의실 라디오 위치 (반다이 위) */
const RADIO = new THREE.Vector3(3.2, 1.5, 6.4)
/** 엔카풍 5음계(요나누키 단조) — 가사 없이 반주 선율만 */
const SCALE = [0, 1, 5, 7, 8, 12]
const PHRASE = [3, 4, 3, 2, 1, 2, 0, -1, 0, 1, 2, 3, 2, 1, 0, -1]

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
    // 탈의실 천장 환풍기 — 저역 브라운 노이즈 + 120Hz 부근 공명
    stops.push(noiseLoop(src([0, 3, -1], 16, 0.06), 'brown', { type: 'lowpass', freq: 260 }, 0.05))
    // 보일러실 — 아주 낮은 웅웅거림, 벽 너머로 희미하게 들린다
    stops.push(noiseLoop(src([22.5, 1, -32], 30, 0.16), 'brown', { type: 'lowpass', freq: 90 }, 0.03))

    // 라디오: 사각파 선율 → 대역 제한(옛 스피커) + 느린 피치 워블
    const radio = src(RADIO.toArray() as [number, number, number], 14, 0.035)
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
    wob.frequency.value = 0.09
    wobDepth.gain.value = 9 // cents 대신 Hz — 낮은 음에서 반음 가까이 흔들린다
    wob.connect(wobDepth).connect(tone.frequency)
    tone.connect(band).connect(env).connect(radio.out)
    tone.start()
    wob.start()
    stops.push(() => {
      tone.stop()
      wob.stop()
    })
    stops.push(noiseLoop(radio, 'white', { type: 'highpass', freq: 3000 }, 0.3)) // 잡음

    let step = 0
    const beat = 0.62
    const timer = window.setInterval(() => {
      const t = ctx.currentTime
      const deg = PHRASE[step % PHRASE.length]!
      const semis = deg < 0 ? SCALE[SCALE.length + deg]! - 12 : SCALE[deg]!
      tone.frequency.setTargetAtTime(220 * Math.pow(2, semis / 12), t, 0.03)
      env.gain.cancelScheduledValues(t)
      env.gain.setTargetAtTime(0.5, t, 0.02)
      env.gain.setTargetAtTime(0.15, t + beat * 0.6, 0.12)
      step++
    }, beat * 1000)
    stops.push(() => window.clearInterval(timer))

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
