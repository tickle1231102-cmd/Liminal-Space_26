#!/usr/bin/env node
// 공간 경계 검사: spaces/<a>는 spaces/<b>를, core/는 spaces/를 import하면 안 된다.
// app/은 spaces/registry·types만 import한다. 위반 시 exit 1 (npm run build에 포함).
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'src')
const walk = (d) => readdirSync(d).flatMap((f) => {
  const p = join(d, f)
  return statSync(p).isDirectory() ? walk(p) : /\.tsx?$/.test(f) ? [p] : []
})
const area = (abs) => relative(src, abs).replace(/\.tsx?$/, '').split(sep)

const errors = []
for (const file of walk(src)) {
  const [top, space] = area(file)
  for (const [, spec] of readFileSync(file, 'utf8').matchAll(/(?:from|import\()\s*'((?:\.{1,2}|@)\/[^']+)'/g)) {
    const target = spec.startsWith('@/') ? join(src, spec.slice(2)) : resolve(dirname(file), spec)
    const [tTop, tSpace] = area(target)
    if (tTop !== 'spaces') continue
    const shared = tSpace === 'types' || tSpace === 'registry'
    const bad =
      (top === 'core' && !(tSpace === 'types')) ||
      (top === 'app' && !shared) ||
      (top === 'spaces' && !shared && space !== tSpace && space !== 'types' && space !== 'registry') ||
      (top === 'spaces' && space !== 'registry' && tSpace === 'registry')
    if (bad) errors.push(`${relative(root, file)} → ${spec}`)
  }
}
if (errors.length) {
  console.error('공간 경계 위반 (AGENTS.md "공간 구조" 참고):\n  ' + errors.join('\n  '))
  process.exit(1)
}
console.log('spaces: boundaries ok')
