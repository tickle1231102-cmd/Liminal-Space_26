import type { ComponentType } from 'react'

export type Vec3 = [number, number, number]

/** 각 공간의 월드 컴포넌트가 받는 props. 후처리·오디오도 공간이 직접 소유한다. */
export type SpaceWorldProps = {
  reduceMotion: boolean
  audioEnabled: boolean
}

/**
 * 공간(놀이공원, 심야 학교, ...) 하나의 진입점.
 * 앱 셸(src/app)은 이 계약만 알고, 공간 내부 파일을 직접 import하지 않는다.
 */
export type SpaceDefinition = {
  /** URL `?space=<id>`, 에셋 폴더(art/blender/<id>, public/assets/models/<id>)와 같은 값 */
  id: string
  /** 공간 전환 버튼 등에 쓰는 짧은 이름 */
  name: string
  title: string
  /** 시작 화면 설명 줄 (조작 안내 제외) */
  intro: string[]
  /** 데스크톱 조작 안내의 E 키 동사 */
  interactVerb: string
  spawn: Vec3
  clearColor: string
  exposure: number
  /** 공간별 코드 분할 — 선택된 공간만 로드된다 */
  load: () => Promise<{ default: ComponentType<SpaceWorldProps> }>
}
