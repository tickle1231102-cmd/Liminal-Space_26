#!/usr/bin/env node
// Headless Blender asset build: art/blender/<zone>/<name>.py → public/assets/models/<zone>/<name>.glb
// Usage: npm run assets:build [-- filter]   |   npm run assets:watch
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, statSync, watch } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = join(root, 'art/blender')
const outDir = join(root, 'public/assets/models')

function findBlender() {
  if (process.env.BLENDER) return process.env.BLENDER
  for (const p of ['/Applications/Blender.app/Contents/MacOS/Blender', 'C:/Program Files/Blender Foundation/Blender/blender.exe', '/usr/bin/blender']) {
    if (existsSync(p)) return p
  }
  return 'blender'
}

function scripts() {
  return readdirSync(srcDir)
    .filter((d) => d !== 'lib' && statSync(join(srcDir, d)).isDirectory())
    .flatMap((d) => readdirSync(join(srcDir, d)).filter((f) => f.endsWith('.py')).map((f) => join(srcDir, d, f)))
}

function build(script) {
  const rel = relative(srcDir, script).replace(/\.py$/, '')
  const out = join(outDir, `${rel}.glb`)
  mkdirSync(dirname(out), { recursive: true })
  const t = Date.now()
  const r = spawnSync(findBlender(), ['-b', '--factory-startup', '-noaudio', '-P', script, '--', '--out', out], { encoding: 'utf8' })
  if (r.status !== 0 || !existsSync(out)) {
    console.error(`✗ ${rel}\n${r.stdout}\n${r.stderr}`)
    return false
  }
  console.log(`✓ ${rel}.glb (${Date.now() - t}ms)`)
  return true
}

const [mode, filter] = process.argv.slice(2)
const all = scripts().filter((s) => !filter || s.includes(filter))
const ok = all.map(build).every(Boolean)

if (mode === '--watch') {
  console.log('watching art/blender …')
  watch(srcDir, { recursive: true }, (_e, f) => {
    if (!f?.endsWith('.py')) return
    if (f.startsWith('lib')) scripts().forEach(build)
    else build(join(srcDir, f))
  })
} else if (!ok) process.exit(1)
