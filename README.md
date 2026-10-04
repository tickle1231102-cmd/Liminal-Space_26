# After Hours

> 폐장하지 않은 야간 놀이공원을 배회하는 1인칭 물리 기반 리미널 스페이스 시뮬레이터

새벽 3시, 손님은 모두 떠났지만 놀이기구는 멈추지 않았다. 관람차는 빈 곤돌라를 매단 채 계속 돌고, 회전목마는 아무도 요청하지 않은 음악에 맞춰 회전한다. 목표도 대사도 없이, 거의 맞지만 어딘가 어긋난 공간을 걷는 게임입니다.

**레퍼런스**: 백룸 · The Pool · Placid Plastic Duck Simulator

## 상태

🛠️ 프로토타입 — Vite + React Three Fiber + Rapier 웹 빌드가 동작합니다. Capacitor / Electron 셸 스텁 포함.

## 실행

```bash
npm install
npm run dev
```

브라우저: [http://127.0.0.1:5173/](http://127.0.0.1:5173/) — 클릭해 입장합니다.

### 개발 서버가 자꾸 꺼질 때

Vite 개발 서버는 **터미널에 붙어 있는 프로세스**입니다. 터미널 탭을 닫거나 Cursor/맥이 재시작되면 같이 종료됩니다. `5173` 포트에 예전 프로세스가 남아 있으면 새로 켤 때 `EADDRINUSE`로 실패하기도 합니다.

| 명령 | 용도 |
|---|---|
| `npm run dev` | 이미 켜져 있으면 URL만 안내 (중복 실행 방지) |
| `npm run dev:restart` | 예전 서버 종료 후 다시 시작 |
| `npm run dev:bg` | 백그라운드 실행 (터미널 닫아도 유지) |
| `npm run dev:stop` | 백그라운드/남은 서버 종료 |
| `npm run dev:status` | 실행 중인지 확인 |
| `npm run dev:fix` | 멈춘 서버 강제 복구 후 백그라운드 재시작 |

화면이 하얗게/검게 멈추면 대부분 **서버가 포트만 잡고 HTTP가 죽은 상태**입니다. 그때는 `npm run dev:fix` 한 뒤 [http://127.0.0.1:5173/](http://127.0.0.1:5173/) 을 새로고침하세요.

| 입력 | 동작 |
|---|---|
| WASD | 이동 |
| Shift | 가벼운 뛰기 |
| 마우스 | 시점 (Pointer Lock) |
| E | 상호작용 (풍선 잡기/놓기, 라이드 탑승) |
| R / RESEED | 소품·조명 재시드 |
| F3 | FPS 오버레이 |
| [ ] | FOV |
| M | Reduce motion (모바일 친화) |

터치 기기: 왼쪽 가상 스틱, 오른쪽 드래그 시점, E 버튼.

```bash
npm run build
npm run preview
npm run perf:report          # 성능 체크포인트 템플릿
npm run electron:dev         # Electron 셸 (dev 서버 필요)
npm run cap:sync             # Capacitor 동기화 (빌드 후)
```

### 3D 모델 (Blender)

모델은 `art/blender/<zone>/<name>.py` Python 스크립트가 원본입니다. Blender(5.x)를 화면 없이 실행해 `public/assets/models/<zone>/<name>.glb`를 만듭니다. 생성된 `.glb`도 커밋하므로 웹/모바일/스팀 빌드에는 Blender가 필요 없습니다.

```bash
npm run assets:build         # 전체 재생성 (특정 모델만: npm run assets:build -- bench)
npm run assets:watch         # 스크립트 저장 시 자동 재생성
```

빌드는 정적 모델에 그림자(albedo × AO)를 Cycles로 구워 넣고(`bake_shading`), meshopt로 압축합니다(`EXT_meshopt_compression`). 전체 재생성은 약 2분 걸립니다.

Blender 경로가 기본 위치가 아니면 `BLENDER=/path/to/blender` 환경변수를 지정하세요. 이름 규칙: `COL_*` = 충돌 박스(화면에서 숨김), `ANCHOR_*` = 소품 배치 지점.

## 문서

| 파일 | 설명 |
|---|---|
| [PRD.md](PRD.md) | 제품 요구사항 문서 |
| [docs/prd.html](docs/prd.html) | PRD 시각화 |
| [docs/STORE_CHECKLIST.md](docs/STORE_CHECKLIST.md) | 3스토어 출시 체크리스트 |
| [AGENTS.md](AGENTS.md) | AI 코딩 도구 공통 규칙 |
| [public/assets/ATTRIBUTION.md](public/assets/ATTRIBUTION.md) | 에셋 출처 |

## 핵심 정보

| 항목 | 내용 |
|---|---|
| 장르 | 리미널 워킹 시뮬레이터 |
| 시점 | 1인칭 |
| 배포 대상 | App Store (iOS) · Google Play (Android) · Steam (Win/Mac) |
| 개발 도구 | Claude Code + Cursor |
| 기술 스택 | Three.js, React Three Fiber, Rapier, Howler.js, Capacitor, Electron |

## 개발 원칙 (요약)

- GUI 에디터(Unreal/Unity 네이티브 에디터) 의존 없이, 씬·물리·오디오·배치 전부를 코드(TypeScript)로 표현
- 목표 없는 배회형 — 퀘스트, 전투, 실패 상태 없음
- 대사 없음 — 내러티브는 메모/낙서/라디오 같은 파편적 단서로만 전달
- 공포가 아니라 위화감이 목표 톤

전체 규칙은 [AGENTS.md](AGENTS.md)에 정리되어 있습니다.

## 라이선스

TBD
