# After Hours — mobile performance checkpoint

## Criteria (prototype go/no-go)

| Metric | GO | REVIEW (Godot discussion) |
|---|---|---|
| Sustained FPS | ≥ 30 | < 30 with reduce-motion on |
| Avg frame time | ≤ 33ms | > 33ms sustained |
| Device | Mid-tier Android Chrome or Capacitor WebView | — |

## How to capture

1. `npm run build && npm run preview -- --host`
2. Open the URL on the phone; enter the park; walk plaza + midway for 30s.
3. Press **F3** (desktop) or set `showFps: true` in comfort settings to show overlay.
4. In remote console: `copy(window.__AH_PERF__)`.
5. `npm run perf:report` writes a template under `perf-reports/`.

Godot fallback is **review-only** at this gate — never switch without an explicit project decision.
