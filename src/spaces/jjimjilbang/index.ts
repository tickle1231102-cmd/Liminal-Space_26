import type { SpaceDefinition } from '../types'

export const jjimjilbang: SpaceDefinition = {
  id: 'jjimjilbang',
  name: '새벽의 찜질방',
  title: 'After Hours — 새벽의 찜질방',
  intro: [
    '불이 꺼진 적 없는 찜질방의 새벽 네 시. 장판은 아직 따뜻하다.',
    '카운터에서 찜질 골목을 지나 대청마루로, 그 너머 수면실로 이어집니다.',
  ],
  interactVerb: '밀기/끌기',
  // 엘리베이터 앞, 카펫 복도를 바라보는 위치
  spawn: [0, 0.15, 24],
  clearColor: '#14110d',
  exposure: 1.15,
  load: () => import('./JjimjilbangWorld'),
}
