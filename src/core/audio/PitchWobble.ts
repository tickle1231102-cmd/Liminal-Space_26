import { Howl } from 'howler'
import * as THREE from 'three'

/**
 * Procedural detuned loop via Web Audio oscillator + Howler gain bridge.
 * Avoids shipping unknown-license audio; still demonstrates pitch wobble.
 */
export class PitchWobbleBed {
  private ctx: AudioContext | null = null
  private osc: OscillatorNode | null = null
  private gain: GainNode | null = null
  private lfo: OscillatorNode | null = null
  private lfoGain: GainNode | null = null
  private howl: Howl | null = null
  private baseFreq = 110
  private started = false
  sourceWorld = new THREE.Vector3(-12, 3, -46)

  async ensure(): Promise<void> {
    if (this.started) return
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    this.ctx = new Ctx()
    this.osc = this.ctx.createOscillator()
    this.osc.type = 'triangle'
    this.osc.frequency.value = this.baseFreq * 0.93

    this.gain = this.ctx.createGain()
    this.gain.gain.value = 0.0001

    this.lfo = this.ctx.createOscillator()
    this.lfo.frequency.value = 0.07
    this.lfoGain = this.ctx.createGain()
    this.lfoGain.gain.value = 4.5
    this.lfo.connect(this.lfoGain)
    this.lfoGain.connect(this.osc.frequency)

    this.osc.connect(this.gain)
    this.gain.connect(this.ctx.destination)
    this.osc.start()
    this.lfo.start()
    this.started = true

    this.howl = new Howl({
      src: [
        'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
      ],
      volume: 0,
      loop: true,
    })
    this.howl.play()
  }

  setDistanceVolume(distance: number): void {
    if (!this.gain || !this.ctx) return
    const atten = THREE.MathUtils.clamp(1 - distance / 55, 0, 1)
    const target = 0.035 * atten * atten
    this.gain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.25)
  }

  dispose(): void {
    try {
      this.osc?.stop()
      this.lfo?.stop()
      void this.ctx?.close()
      this.howl?.unload()
    } catch {
      /* ignore */
    }
  }
}
