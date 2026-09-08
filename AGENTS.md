# AGENTS.md — After Hours (Liminal-Space_26)

이 파일은 Claude Code, Cursor 등 이 저장소에서 작업하는 모든 AI 코딩 도구가 공통으로 따르는 규칙 원본입니다. 작업 전 반드시 읽고, 아래 결정을 임의로 뒤집지 마세요.

## 프로젝트 개요

- **게임명**: After Hours (가제) — 폐장하지 않은 야간 놀이공원을 배회하는 1인칭 물리 기반 리미널 스페이스 시뮬레이터
- **레퍼런스**: 백룸, The Pool, Placid Plastic Duck Simulator
- **전체 기획 문서**: [PRD.md](PRD.md) 참고. 여기 없는 세부 사항(레벨 구조, 오브젝트 스펙, 로드맵 등)은 PRD.md가 원본입니다.

## 절대 규칙

1. **개발 도구는 Claude Code + Cursor로 고정한다.** GUI 에디터(레벨 배치, 블루프린트, 머티리얼 그래프 등을 마우스로 조작하는 방식)에 의존하는 워크플로우를 도입하지 않는다. 모든 로직·씬 구성·물리·오디오는 코드(TypeScript)로 표현 가능해야 한다.
2. **Unreal / Unity 엔진 자체 에디터를 주 워크플로우로 채택하지 않는다.** AI 코딩 어시스턴트가 읽고 생성·리팩터링할 수 없는 바이너리/프로젝트 파일 포맷에 핵심 게임 로직을 두지 않는다.
3. **기본 기술 스택**:
   - 렌더링: Three.js + React Three Fiber
   - 물리: Rapier (`@react-three/rapier`)
   - 후처리: `@react-three/postprocessing`
   - 오디오: Howler.js + Web Audio API
   - 애니메이션 재생: glTF 임포트 + Three.js `AnimationMixer` (리깅은 Blender에서 1회 작업)
   - 절차적 배치: 시드 기반 RNG (`seedrandom`) — 재현 가능해야 함
   - 모바일 배포: Capacitor
   - 데스크톱(Steam) 배포: Electron
4. **폴백은 Godot(GDScript/C#) 하나만 고려한다.** 모바일 WebView 성능이 프로토타입 체크포인트에서 기준 미달일 경우에만 전환을 검토하며, 검토 없이 임의 전환하지 않는다.
5. **3D 모델링/텍스처링, 사운드 원본 녹음은 코드 작업 범위 밖이다.** Blender 작업물 또는 라이선스가 명확한 에셋(Kenney, Poly Haven, Sketchfab, Freesound 등)만 사용한다. 출처 불명 에셋을 임의로 추가하지 않는다.
6. **배포 대상은 App Store(iOS), Google Play(Android), Steam(Win/Mac) 세 곳 동시 출시가 목표다.** 기능/UI 설계 시 세 스토어의 입력 방식(터치 vs. WASD+마우스)과 심사 요건(개인정보 라벨, IARC 등급, Steamworks 연령 게이트)을 모두 고려한다. 한 플랫폼만 고려한 설계 변경은 피한다.

## 게임 디자인 원칙 (변경 시 PRD.md와 함께 갱신)

- **목표 없는 배회형**: 퀘스트 로그, 목표 마커, 전투, 실패 상태를 추가하지 않는다.
- **상호작용은 최소한으로**: 밀기/잡기/타기 정도의 단일 인터랙션 축을 유지한다.
- **대사 없음**: 내러티브는 메모/낙서/라디오 방송 같은 파편적 단서로만 전달하고, 설명하거나 완결짓지 않는다.
- **감정 톤은 공포가 아니라 위화감**: "무섭다"보다 "이상하게 평온한데 뭔가 잘못됐다"를 지향한다. 점프스케어, 추격 AI 등은 넣지 않는다.
- **절차적 변주는 거시 구조를 보존한다**: 소품 배치·조명·오디오 순서는 재시드하되, 랜드마크와 경로 같은 큰 레이아웃은 고정한다(플레이어가 길을 잃지 않게).

## 언어 / 문서 규칙

- 기획 문서(PRD, 이 파일 등)는 **한글**로 작성한다.
- 코드 내 주석/커밋 메시지는 프로젝트 관례를 따르되, 특별한 지시가 없으면 영어 코드 컨벤션(변수명 등)과 한글 설명을 혼용 가능하다.

## 저장소 구조

- `AGENTS.md` — 이 파일. 규칙 원본 (Claude Code, Cursor 등 모든 AI 도구 공통)
- `CLAUDE.md`, `.cursor/rules/project.mdc` — 각 도구가 자동으로 찾는 위치에 놓인 포인터. 내용은 항상 `AGENTS.md`를 가리키기만 하며, 규칙 본문은 여기 두지 않는다.
- `PRD.md` — 제품 요구사항 문서 원본 (한글)
- `docs/prd.html` — PRD의 Artifact 렌더링본 (시각 자료, 참고용 스냅샷)
- `docs/STORE_CHECKLIST.md` — 3스토어 출시 체크리스트
- `src/app` — 부트스트랩, 캔버스, HUD, 편의 옵션, 플랫폼 감지
- `src/player` — 1인칭 컨트롤러, 상호작용
- `src/world` — 구역 화이트박스(정문·미드웨이·먹거리·백스테이지), 파편, 절차적 소품
- `src/objects` — 풍선·탑승 시트 등 물리 오브젝트
- `src/audio` — 피치 워블 / 앰비언스
- `src/proc` — seedrandom 기반 재시드
- `src/input` — 키보드·마우스·터치 추상화
- `public/assets` — glTF/오디오 (출처는 `ATTRIBUTION.md`)
- `electron/` — Steam용 Electron 셸
- `capacitor.config.json` — iOS/Android Capacitor 래핑 설정
- `scripts/perf-checkpoint.mjs` — 모바일 성능 go/no-go 리포트

## Claude Code / Cursor 역할 분담

두 도구 모두 이 저장소에서 작업하지만, 강점이 다른 영역을 겹치지 않게 나눈다. 이 절은 위 "절대 규칙"의 실행 세칙이며 스택 자체를 바꾸지 않는다(Rapier `@react-three/rapier`, 데스크톱은 Electron, 모바일은 Capacitor).

- **Cursor (IDE / 비주얼 작업)**
  - 담당: 3D 씬 구성, 셰이더, Rapier 콜라이더/물리 파라미터 튜닝, R3F 핫리로드로 즉시 눈으로 확인하며 반복하는 편집.
  - 제약: 터미널에서 네이티브 빌드(Xcode, Gradle, Electron 패키징)를 직접 수행하지 않는다.
- **Claude Code (CLI 에이전트)**
  - 담당: 플랫폼 패키징 및 빌드 트러블슈팅 — Capacitor iOS/Android(`xcodebuild`, `gradlew`), Electron 데스크톱 빌드(`electron-builder`), 네이티브 SDK 연동(Steamworks, StoreKit, Google Play Billing), 스토어 심사 체크리스트(`docs/STORE_CHECKLIST.md`) 대응.
  - 제약: 터미널 작업 중 3D 씬의 비주얼/좌표/미학적 디테일(카메라 위치, 머티리얼 값, 조명 세팅 등)을 임의로 바꾸지 않는다 — 이런 변경이 필요하면 Cursor로 넘기거나 사용자에게 확인한다.

## 기술 세칙

- Capacitor WebView(iOS/Android)와 Electron `BrowserWindow`(Steam) 양쪽 모두, Rapier WASM 멀티스레딩(SharedArrayBuffer)을 쓰려면 COOP(`same-origin`)/COEP(`require-corp`) 헤더를 활성화해야 한다.
- 플랫폼별 분기가 필요한 로직은 `src/input` 같은 기존 추상화 계층 관례를 따르고, 게임 코어 로직(`src/player`, `src/world`, `src/objects` 등)에 플랫폼 전용 API를 직접 끌어들이지 않는다.


