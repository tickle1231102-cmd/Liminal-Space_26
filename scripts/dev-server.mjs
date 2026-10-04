#!/usr/bin/env node
/**
 * Stable dev-server helper for After Hours.
 * - Detects "listen but no HTTP" hung vite and force-restarts
 * - Background mode survives terminal close (nohup)
 * - Avoids duplicate starts on a healthy server
 */
import { spawn, execSync } from 'node:child_process'
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PORT = 5173
const HOST = '127.0.0.1'
const URL = `http://${HOST}:${PORT}/`
const PID_FILE = path.join(ROOT, '.dev-server.pid')
const LOG_FILE = path.join(ROOT, '.dev-server.log')
const HEALTH_MS = 2500

function sleep(ms) {
  execSync(`sleep ${Math.max(0, ms) / 1000}`)
}

function getListenerPids() {
  try {
    const out = execSync(`lsof -tiTCP:${PORT} -sTCP:LISTEN`, { encoding: 'utf8' }).trim()
    if (!out) return []
    return out.split('\n').map((s) => Number(s.trim())).filter(Boolean)
  } catch {
    return []
  }
}

function commandOf(pid) {
  try {
    return execSync(`ps -p ${pid} -o command=`, { encoding: 'utf8' }).trim()
  } catch {
    return ''
  }
}

function isProjectVite(pid) {
  const cmd = commandOf(pid)
  if (!cmd) return false
  // Match both the bin shim and the resolved vite.js path
  return (
    (cmd.includes('vite') || cmd.includes('vite/bin')) &&
    (cmd.includes('Liminal-Space_26') || cmd.includes('node_modules'))
  )
}

function httpOk(timeoutMs = HEALTH_MS) {
  return new Promise((resolve) => {
    const req = http.get(URL, { timeout: timeoutMs }, (res) => {
      res.resume()
      resolve(res.statusCode != null && res.statusCode >= 200 && res.statusCode < 500)
    })
    req.on('timeout', () => {
      req.destroy()
      resolve(false)
    })
    req.on('error', () => resolve(false))
  })
}

async function isHealthy() {
  const ours = getListenerPids().filter(isProjectVite)
  if (ours.length === 0) return false
  return httpOk()
}

function stopPid(pid, label = 'dev server') {
  if (!pid) return
  try {
    process.kill(pid, 'SIGTERM')
  } catch {
    /* already gone */
  }
  sleep(300)
  try {
    process.kill(pid, 0)
    process.kill(pid, 'SIGKILL')
  } catch {
    /* gone */
  }
  console.log(`Stopped ${label} (pid ${pid})`)
}

function stopAllProjectVite() {
  // Only kill processes that actually own the listen socket — never pgrep
  // shells whose command line merely mentions "vite".
  for (const pid of getListenerPids()) {
    if (isProjectVite(pid) || commandOf(pid).includes('node_modules/.bin/vite')) {
      stopPid(pid)
    }
  }
  // Second pass: anything still listening on our port after project vite stop
  sleep(200)
  for (const pid of getListenerPids()) {
    const cmd = commandOf(pid)
    if (cmd.includes('vite') || cmd.includes('node')) stopPid(pid, 'port holder')
  }
  if (fs.existsSync(PID_FILE)) fs.unlinkSync(PID_FILE)
}

function viteBin() {
  const bin = path.join(ROOT, 'node_modules', '.bin', 'vite')
  if (!fs.existsSync(bin)) {
    console.error('vite not found. Run: npm install')
    process.exit(1)
  }
  return bin
}

function viteArgs() {
  return ['--host', HOST, '--port', String(PORT), '--strictPort']
}

function waitForPort(maxMs = 20000) {
  const step = 200
  const attempts = Math.ceil(maxMs / step)
  for (let i = 0; i < attempts; i++) {
    if (getListenerPids().filter(isProjectVite).length > 0) return true
    sleep(step)
  }
  return false
}

async function waitForHealthy(maxMs = 25000) {
  const step = 400
  const attempts = Math.ceil(maxMs / step)
  for (let i = 0; i < attempts; i++) {
    if (await httpOk()) return true
    sleep(step)
  }
  return false
}

async function ensureHealthyOrKill() {
  const ours = getListenerPids().filter(isProjectVite)
  if (ours.length === 0) return false
  if (await httpOk()) return true
  console.warn('Dev server is hung (port open, no HTTP). Force-restarting…')
  stopAllProjectVite()
  return false
}

function startForeground() {
  console.log(`Starting dev server at ${URL}`)
  const child = spawn(viteBin(), viteArgs(), {
    cwd: ROOT,
    stdio: 'inherit',
    env: process.env,
  })
  child.on('exit', (code) => process.exit(code ?? 0))
}

function startBackground() {
  fs.writeFileSync(LOG_FILE, '')
  const cmd = `nohup "${viteBin()}" ${viteArgs().join(' ')} >> "${LOG_FILE}" 2>&1 & echo $!`
  const pidOut = execSync(cmd, {
    cwd: ROOT,
    encoding: 'utf8',
    shell: '/bin/bash',
    env: process.env,
  }).trim()
  const shellPid = Number(pidOut.split('\n').pop())
  if (!shellPid) {
    console.error('Failed to spawn background vite. See .dev-server.log')
    process.exit(1)
  }
  fs.writeFileSync(PID_FILE, String(shellPid))

  if (!waitForPort()) {
    console.error('Vite did not bind port. See .dev-server.log')
    process.exit(1)
  }
}

async function bootBackground() {
  stopAllProjectVite()
  startBackground()
  const ok = await waitForHealthy()
  if (!ok) {
    console.error('Dev server started but is not answering HTTP. See .dev-server.log')
    process.exit(1)
  }
  const listeners = getListenerPids().filter(isProjectVite)
  if (listeners[0]) fs.writeFileSync(PID_FILE, String(listeners[0]))
  console.log(`Dev server running in background: ${URL}`)
  console.log(`Log: ${path.relative(ROOT, LOG_FILE)}`)
  console.log('Stop with: npm run dev:stop')
}

async function printStatus() {
  const listeners = getListenerPids().filter(isProjectVite)
  if (listeners.length === 0) {
    console.log('NOT RUNNING')
    process.exit(1)
  }
  const ok = await httpOk()
  if (ok) {
    console.log(`RUNNING ${URL} (pid ${listeners.join(', ')})`)
    process.exit(0)
  }
  console.log(`HUNG ${URL} (pid ${listeners.join(', ')}) — run npm run dev:restart`)
  process.exit(2)
}

const mode = process.argv[2] ?? 'start'

switch (mode) {
  case 'start': {
    if (await ensureHealthyOrKill()) {
      console.log(`Dev server already running: ${URL}`)
      console.log('Restart with: npm run dev:restart')
      console.log('Background mode: npm run dev:bg')
      process.exit(0)
    }
    const foreign = getListenerPids().filter((p) => !isProjectVite(p))
    if (foreign.length > 0) {
      console.error(`Port ${PORT} is used by another app (pid ${foreign[0]}).`)
      process.exit(1)
    }
    startForeground()
    break
  }
  case 'restart':
    stopAllProjectVite()
    startForeground()
    break
  case 'bg':
    if (await ensureHealthyOrKill()) {
      console.log(`Dev server already healthy: ${URL}`)
      process.exit(0)
    }
    await bootBackground()
    break
  case 'stop':
    stopAllProjectVite()
    console.log('Dev server stopped.')
    break
  case 'status':
    await printStatus()
    break
  case 'fix': {
    // Recover hung or dead server into healthy background mode
    if (await ensureHealthyOrKill()) {
      console.log(`OK ${URL}`)
      process.exit(0)
    }
    await bootBackground()
    break
  }
  default:
    console.error(`Unknown mode: ${mode}`)
    process.exit(1)
}
