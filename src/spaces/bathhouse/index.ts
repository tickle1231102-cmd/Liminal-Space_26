import type { SpaceDefinition } from '../types'

export const bathhouse: SpaceDefinition = {
  id: 'bathhouse',
  name: '심야 센토',
  title: 'After Hours — 심야 센토',
  intro: [
    '노렌이 걷히지 않은 새벽의 목욕탕. 탕에는 아직 김이 오른다.',
    '신발장에서 탈의실을 지나 욕실로, 그 너머 보일러실로 이어집니다.',
  ],
  interactVerb: '밀기/끌기',
  // 겐칸 안쪽, 노렌을 바라보는 위치
  spawn: [0, 0.15, 17],
  clearColor: '#101315',
  exposure: 1.2,
  load: () => import('./BathhouseWorld'),
}
