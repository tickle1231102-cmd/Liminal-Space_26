# After Hours

> 폐장하지 않은 야간 놀이공원을 배회하는 1인칭 물리 기반 리미널 스페이스 시뮬레이터

새벽 3시, 손님은 모두 떠났지만 놀이기구는 멈추지 않았다. 관람차는 빈 곤돌라를 매단 채 계속 돌고, 회전목마는 아무도 요청하지 않은 음악에 맞춰 회전한다. 목표도 대사도 없이, 거의 맞지만 어딘가 어긋난 공간을 걷는 게임입니다.

**레퍼런스**: 백룸 · The Pool · Placid Plastic Duck Simulator

## 상태

🚧 프리프로덕션 — 현재는 기획 문서 단계이며 코드는 아직 없습니다.

## 문서

| 파일 | 설명 |
|---|---|
| [PRD.md](PRD.md) | 제품 요구사항 문서 — 컨셉, 플랫폼 전략, 기술 스택, 게임플레이, 로드맵 전체 |
| [docs/prd.html](docs/prd.html) | 위 PRD의 시각화 버전 (Artifact 렌더링본) |
| [AGENTS.md](AGENTS.md) | 이 저장소에서 작업하는 모든 AI 코딩 도구(Claude Code, Cursor 등)가 따라야 할 규칙 원본 |

## 핵심 정보

| 항목 | 내용 |
|---|---|
| 장르 | 리미널 워킹 시뮬레이터 |
| 시점 | 1인칭 |
| 배포 대상 | App Store (iOS) · Google Play (Android) · Steam (Win/Mac) |
| 개발 도구 | Claude Code + Cursor |
| 기술 스택 | Three.js, React Three Fiber, Rapier, Howler.js, Capacitor, Electron |

자세한 내용은 [PRD.md](PRD.md)를 참고하세요.

## 개발 원칙 (요약)

- GUI 에디터(Unreal/Unity 네이티브 에디터) 의존 없이, 씬·물리·오디오·배치 전부를 코드(TypeScript)로 표현
- 목표 없는 배회형 — 퀘스트, 전투, 실패 상태 없음
- 대사 없음 — 내러티브는 메모/낙서/라디오 같은 파편적 단서로만 전달
- 공포가 아니라 위화감이 목표 톤

전체 규칙은 [AGENTS.md](AGENTS.md)에 정리되어 있습니다.

## 라이선스

TBD
