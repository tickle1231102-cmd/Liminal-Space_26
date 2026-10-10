#!/usr/bin/env node
// Headless Blender asset build: art/blender/<zone>/<name>.py → public/assets/models/<zone>/<name>.glb
// Post-pass: dedup/weld/prune, animation resample, meshopt (EXT_meshopt_compression).
// Usage: npm run assets:build [-- filter]   |   npm run assets:watch
import { spawnSync } from 'node:child_process'
import { Logger, NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { dedup, meshopt, prune, resample, textureCompress, weld } from '@gltf-transform/functions'
import sharp from 'sharp'
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer'
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
    // Finder 복사본("x 2.py")은 빌드하지 않는다
    .flatMap((d) => readdirSync(join(srcDir, d)).filter((f) => f.endsWith('.py') && !/ \d+\.py$/.test(f)).map((f) => join(srcDir, d, f)))
}

const io = new NodeIO()
  .setLogger(new Logger(Logger.Verbosity.WARN))
  .registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.decoder': MeshoptDecoder,
  'meshopt.encoder': MeshoptEncoder,
})

async function compress(file) {
  await MeshoptDecoder.ready
  await MeshoptEncoder.ready
  const doc = await io.read(file)
  // Keep COL_/ANCHOR_ nodes: prune would drop the empty anchors, so retain leaf nodes
  await doc.transform(dedup(), weld(), resample(), prune({ keepLeaves: true }), meshopt({ encoder: MeshoptEncoder, level: 'medium' }))
  await io.write(file, doc)
}

/** 모바일 프리셋용 저해상도 변형(<name>.mobile.glb)을 만드는 공간 — 런타임 core/world/quality가 고른다 */
const MOBILE_VARIANT_SPACES = ['bathhouse']
const MOBILE_TEXTURE = 512

async function mobileVariant(file) {
  const doc = await io.read(file)
  await doc.transform(textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [MOBILE_TEXTURE, MOBILE_TEXTURE], quality: 80 }))
  const out = file.replace(/\.glb$/, '.mobile.glb')
  await io.write(out, doc)
  return out
}

async function build(script) {
  const rel = relative(srcDir, script).replace(/\.py$/, '')
  const out = join(outDir, `${rel}.glb`)
  mkdirSync(dirname(out), { recursive: true })
  const t = Date.now()
  const r = spawnSync(findBlender(), ['-b', '--factory-startup', '-noaudio', '-P', script, '--', '--out', out], { encoding: 'utf8' })
  if (r.status !== 0 || !existsSync(out)) {
    console.error(`✗ ${rel}\n${r.stdout}\n${r.stderr}`)
    return false
  }
  const raw = statSync(out).size
  await compress(out)
  let mobile = ''
  if (MOBILE_VARIANT_SPACES.includes(rel.split('/')[0])) {
    const m = await mobileVariant(out)
    mobile = `, mobile ${(statSync(m).size / 1024).toFixed(0)} KB`
  }
  console.log(`✓ ${rel}.glb ${(raw / 1024).toFixed(0)}→${(statSync(out).size / 1024).toFixed(0)} KB${mobile} (${Date.now() - t}ms)`)
  return true
}

const [mode, filter] = process.argv.slice(2)
const all = scripts().filter((s) => !filter || s.includes(filter))
let ok = true
for (const s of all) ok = (await build(s)) && ok

if (mode === '--watch') {
  console.log('watching art/blender …')
  watch(srcDir, { recursive: true }, (_e, f) => {
    if (!f?.endsWith('.py')) return
    void (async () => {
      if (f.startsWith('lib')) for (const s of scripts()) await build(s)
      else await build(join(srcDir, f))
    })()
  })
} else if (!ok) process.exit(1)
