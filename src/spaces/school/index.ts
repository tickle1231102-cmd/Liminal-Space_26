import type { SpaceDefinition } from '../types'

export const school: SpaceDefinition = {
  id: 'school',
  name: '심야 학교',
  title: 'After Hours — 심야 학교',
  intro: [
    '야자 시간이 끝나지 않은 학교. 형광등은 그대로 켜져 있다.',
    '현관에서 시작해 중앙 복도로, 급식실과 강당·방송실로 이어집니다.',
  ],
  interactVerb: '밀기/끌기',
  // 현관에서 복도를 바라보고 서는 위치
  spawn: [0, 0.15, 18],
  clearColor: '#0b0e14',
  exposure: 1.15,
  load: () => import('./SchoolWorld'),
}
