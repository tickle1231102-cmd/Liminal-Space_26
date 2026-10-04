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

/** 복도 장판 — 아이보리 바닥에 미세한 얼룩과 이음새. */
export function linoleumMap(repeat = 10): THREE.CanvasTexture {
  const tex = makeCanvas(256, (ctx, s) => {
    const img = ctx.createImageData(s, s)
    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        const n =
          hashNoise(x * 0.06, y * 0.06) * 0.5 +
          hashNoise(x * 0.31, y * 0.31) * 0.3 +
          hashNoise(x * 1.1, y * 1.1) * 0.2
        const v = 150 + n * 40
        const i = (y * s + x) * 4
        img.data[i] = v
        img.data[i + 1] = v * 0.95
        img.data[i + 2] = v * 0.84
        img.data[i + 3] = 255
      }
    }
    ctx.putImageData(img, 0, 0)
    ctx.strokeStyle = 'rgba(120,110,95,0.18)'
    ctx.lineWidth = 2
    ctx.strokeRect(0, 0, s, s)
  })
  tex.repeat.set(repeat, repeat)
  return tex
}

/** 급식실·화장실 타일 — 격자 줄눈. */
export function tileMap(repeat = 14): THREE.CanvasTexture {
  const tex = makeCanvas(256, (ctx, s) => {
    ctx.fillStyle = '#c9c6bb'
    ctx.fillRect(0, 0, s, s)
    const cell = s / 4
    ctx.strokeStyle = 'rgba(90,88,80,0.45)'
    ctx.lineWidth = 3
    for (let i = 0; i <= 4; i++) {
      ctx.beginPath()
      ctx.moveTo(i * cell, 0)
      ctx.lineTo(i * cell, s)
      ctx.moveTo(0, i * cell)
      ctx.lineTo(s, i * cell)
      ctx.stroke()
    }
    for (let i = 0; i < 900; i++) {
      const x = hashNoise(i, 1) * s
      const y = hashNoise(i, 2) * s
      ctx.fillStyle = `rgba(80,78,70,${0.02 + hashNoise(i, 3) * 0.05})`
      ctx.fillRect(x, y, 2, 2)
    }
  })
  tex.repeat.set(repeat, repeat)
  return tex
}

/** 체육관 마루 — 결 방향이 있는 목재. */
export function gymFloorMap(repeat = 8): THREE.CanvasTexture {
  const tex = makeCanvas(256, (ctx, s) => {
    for (let y = 0; y < s; y += 16) {
      const tone = 120 + hashNoise(y, 7) * 45
      ctx.fillStyle = `rgb(${tone}, ${tone * 0.76}, ${tone * 0.48})`
      ctx.fillRect(0, y, s, 16)
      ctx.strokeStyle = 'rgba(60,40,20,0.3)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(s, y)
      ctx.stroke()
    }
  })
  tex.repeat.set(repeat, repeat)
  return tex
}

/** 다 못 지운 칠판 — 지운 자국 위에 흐릿한 글씨. */
export function chalkboardTexture(lines: string[]): THREE.CanvasTexture {
  const tex = makeCanvas(512, (ctx, s) => {
    ctx.fillStyle = '#1f3a30'
    ctx.fillRect(0, 0, s, s)
    // 지우개 자국
    for (let i = 0; i < 60; i++) {
      const x = hashNoise(i, 11) * s
      const y = hashNoise(i, 12) * s
      ctx.fillStyle = `rgba(210,225,215,${0.02 + hashNoise(i, 13) * 0.05})`
      ctx.fillRect(x, y, 60 + hashNoise(i, 14) * 90, 18)
    }
    ctx.font = '38px "Nanum Gothic", "Apple SD Gothic Neo", sans-serif'
    ctx.textAlign = 'center'
    lines.forEach((line, i) => {
      ctx.fillStyle = `rgba(226,232,220,${0.24 + 0.12 * ((i + 1) % 2)})`
      ctx.fillText(line, s / 2, 140 + i * 66)
    })
  })
  tex.repeat.set(1, 1)
  return tex
}

/** 복도 게시판 공지문 — 읽히지 않을 만큼만 남긴 활자 덩어리. */
export function noticeTexture(title: string, date: string): THREE.CanvasTexture {
  const tex = makeCanvas(512, (ctx, s) => {
    ctx.fillStyle = '#ece7d8'
    ctx.fillRect(0, 0, s, s)
    ctx.fillStyle = '#2c2a26'
    ctx.font = 'bold 44px "Apple SD Gothic Neo", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(title, s / 2, 92)
    ctx.font = '30px "Apple SD Gothic Neo", sans-serif'
    ctx.fillStyle = '#5a564c'
    ctx.fillText(date, s / 2, 142)
    ctx.fillStyle = 'rgba(60,58,52,0.42)'
    for (let i = 0; i < 12; i++) {
      const w = s * (0.45 + hashNoise(i, 21) * 0.35)
      ctx.fillRect((s - w) / 2, 190 + i * 24, w, 8)
    }
  })
  return tex
}

/** 사물함 이름표 — 일부가 뜯겨 나간 라벨 스트립. */
export function lockerLabelTexture(): THREE.CanvasTexture {
  const tex = makeCanvas(256, (ctx, s) => {
    ctx.fillStyle = '#7b8a92'
    ctx.fillRect(0, 0, s, s)
    for (let r = 0; r < 8; r++) {
      ctx.fillStyle = hashNoise(r, 31) > 0.35 ? '#e8e2d2' : 'rgba(232,226,210,0.18)'
      ctx.fillRect(16, 12 + r * 30, s - 32, 18)
    }
  })
  return tex
}
