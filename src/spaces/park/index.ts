import type { SpaceDefinition } from '../types'

export const park: SpaceDefinition = {
  id: 'park',
  name: '놀이공원',
  title: 'After Hours',
  intro: [
    '폐장하지 않은 야간 놀이공원. 목표도 대사도 없다.',
    '빛나는 길을 따라가면 관람차(MIDWAY) 게이트로 이어집니다.',
  ],
  interactVerb: '상호작용',
  spawn: [0, 0.15, 10],
  clearColor: '#07090f',
  exposure: 1.45,
  load: () => import('./ParkWorld'),
}
