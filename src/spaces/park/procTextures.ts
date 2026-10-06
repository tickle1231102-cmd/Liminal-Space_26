import * as THREE from 'three'

function hashNoise(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return n - Math.floor(n)
}

function makeCanvas(size: number, paint: (ctx: CanvasRenderingContext2D, size: number) => void) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  paint(ctx, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

export function asphaltMap(repeat = 8): THREE.CanvasTexture {
  const tex = makeCanvas(256, (ctx, s) => {
    const img = ctx.createImageData(s, s)
    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        const n =
          hashNoise(x * 0.08, y * 0.08) * 0.55 +
          hashNoise(x * 0.2, y * 0.2) * 0.3 +
          hashNoise(x * 0.7, y * 0.7) * 0.15
        const v = 28 + n * 42
        const i = (y * s + x) * 4
        img.data[i] = v * 0.85
        img.data[i + 1] = v * 0.9
        img.data[i + 2] = v
        img.data[i + 3] = 255
      }
    }
    ctx.putImageData(img, 0, 0)
    // faint lane paint
    ctx.strokeStyle = 'rgba(200,190,160,0.12)'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(s * 0.5, 0)
    ctx.lineTo(s * 0.5, s)
    ctx.stroke()
  })
  tex.repeat.set(repeat, repeat)
  return tex
}

export function concreteMap(repeat = 4): THREE.CanvasTexture {
  const tex = makeCanvas(256, (ctx, s) => {
    const img = ctx.createImageData(s, s)
    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        const n = hashNoise(x * 0.05, y * 0.05) * 0.7 + hashNoise(x * 0.35, y * 0.35) * 0.3
        const v = 70 + n * 50
        const i = (y * s + x) * 4
        img.data[i] = v
        img.data[i + 1] = v * 0.98
        img.data[i + 2] = v * 0.95
        img.data[i + 3] = 255
      }
    }
    ctx.putImageData(img, 0, 0)
  })
  tex.repeat.set(repeat, repeat)
  return tex
}

export function roughnessNoise(repeat = 6): THREE.CanvasTexture {
  const tex = makeCanvas(128, (ctx, s) => {
    const img = ctx.createImageData(s, s)
    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        const n = hashNoise(x * 0.4, y * 0.4)
        const v = 120 + n * 100
        const i = (y * s + x) * 4
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v
        img.data[i + 3] = 255
      }
    }
    ctx.putImageData(img, 0, 0)
  })
  tex.repeat.set(repeat, repeat)
  tex.colorSpace = THREE.NoColorSpace
  return tex
}

export function neonSignTexture(label: string, bg = '#1a1020', fg = '#ff6ad5'): THREE.CanvasTexture {
  const tex = makeCanvas(512, (ctx, s) => {
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, s, s)
    ctx.strokeStyle = fg
    ctx.lineWidth = 10
    ctx.strokeRect(24, 24, s - 48, s - 48)
    ctx.shadowColor = fg
    ctx.shadowBlur = 28
    ctx.fillStyle = fg
    ctx.font = 'bold 72px "Courier New", monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, s / 2, s / 2)
  })
  tex.repeat.set(1, 1)
  return tex
}
