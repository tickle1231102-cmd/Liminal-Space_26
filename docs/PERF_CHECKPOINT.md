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

## 심야 센토 (bathhouse) — 2026-10-10

| 항목 | 데스크톱 프리셋 | 모바일 프리셋 (`quality: 'low'`) |
|---|---|---|
| 모델 다운로드 합계 | 1.9 MB | 1.13 MB (`*.mobile.glb`, 텍스처 512px) |
| 김 입자 | 대욕조 90 · 열탕 60 | 35% |
| SSAO (N8AO) | 켬 | 끔 |
| Mac (Apple GPU) 측정 | 119–121 fps | 120 fps (375×812 터치 에뮬레이션) |

- 모바일 프리셋은 Capacitor 또는 터치 기기(`pointer: coarse`)에서 자동 선택된다 (`src/app/GameCanvas.tsx`).
- **실기기 측정은 아직 없다.** 위 모바일 수치는 데스크톱 GPU에서 뷰포트·터치만 흉내 낸 값이라 go/no-go 판정에 쓰지 않는다. 중급 안드로이드에서 욕실(탕 + 김이 보이는 위치)을 30초 걸은 뒤 `window.__AH_PERF__`를 캡처해 `perf-reports/`에 저장한다.

## 새벽의 찜질방 (jjimjilbang) — 2026-11-25

| 항목 | 데스크톱 프리셋 | 모바일 프리셋 (`quality: 'low'`) |
|---|---|---|
| 모델 다운로드 합계 | 1.6 MB | 1.05 MB (`*.mobile.glb`, 텍스처 512px) |
| 포인트 라이트 | 26 | 14 |
| 드로우콜 (보이는 메시 × 재질, 절두체 컬링 전 상한) | 323–364 | 323–364 |
| 삼각형 (같은 기준) | 7.8만–11.2만 | 7.8만–11.2만 |
| 얼음방 안개 입자 | 308 | 84 |
| SSAO (N8AO) | 켬 | 끔 |
| Mac (Apple GPU) 측정 | 68–84 fps (866×988 캔버스) | 120 fps (375×812 터치 에뮬레이션) |

- 센토(드로우콜 466–563, 삼각형 46만)보다 가볍지만 포인트 라이트가 많다. 조명은 모든 픽셀에서 계산되므로 모바일에서는 이 수가 가장 큰 위험이다. 14개로도 부족하면 방 조명을 발광 재질로만 남기고 더 줄인다.
- 방 단위 `DistanceLod`: 입구에서 볼 때 드로우콜 364 → 323, 삼각형 11.2만 → 7.8만.
- **실기기 측정은 아직 없다.** 위 모바일 수치는 데스크톱 GPU에서 뷰포트·터치만 흉내 낸 값이라 go/no-go 판정에 쓰지 않는다. 중급 안드로이드에서 찜질 골목(방 네 개의 빛이 모두 보이는 위치)과 홀을 30초씩 걸은 뒤 `window.__AH_PERF__`를 캡처해 `perf-reports/`에 저장한다.
