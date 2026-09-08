#!/usr/bin/env node
/**
 * Mobile / low-end performance checkpoint helper.
 * Open the game, wait ~10s, then run: npm run perf:report
 * Or paste window.__AH_PERF__ from a remote device WebView console.
 */
import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const GO_FPS = 30
const GO_AVG_MS = 33.3

const sample = globalThis.__AH_PERF__ ?? null

const report = {
  generatedAt: new Date().toISOString(),
  criteria: {
    minFps: GO_FPS,
    maxAvgFrameMs: GO_AVG_MS,
    note: 'Prototype go/no-go for keeping Three.js + Capacitor WebView stack on mid-tier Android.',
  },
  sample,
  verdict: sample
    ? sample.fps >= GO_FPS && sample.avgFrameMs <= GO_AVG_MS
      ? 'GO — continue web stack'
      : 'REVIEW — consider Godot fallback only after confirming on target device'
    : 'PENDING — enable FPS overlay (F3), play 10s, capture window.__AH_PERF__ on device',
  steps: [
    '1. npm run build && npm run preview (or deploy dist to a phone)',
    '2. On mid-tier Android Chrome / Capacitor WebView, enter the park and walk the plaza for 30s',
    '3. Toggle F3 FPS overlay; note fps / avg / max',
    '4. In console: copy(window.__AH_PERF__) and save under perf-reports/',
    '5. If sustained <30fps or avg >33ms with reduce-motion on, open Godot fallback review (do not switch automatically)',
  ],
}

const dir = join(process.cwd(), 'perf-reports')
if (!existsSync(dir)) mkdirSync(dir)
const out = join(dir, `checkpoint-${Date.now()}.json`)
writeFileSync(out, JSON.stringify(report, null, 2))
console.log(JSON.stringify(report, null, 2))
console.log(`\nWrote ${out}`)
