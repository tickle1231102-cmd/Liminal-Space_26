import seedrandom from 'seedrandom'

export type Vec3 = [number, number, number]

export type PropSpawn = {
  id: string
  kind: 'cup' | 'flyer' | 'ticket' | 'trash'
  position: Vec3
  rotationY: number
}

export type LightToggle = {
  id: string
  on: boolean
  color: string
  position: Vec3
  intensity: number
}

export type ZoneDecor = {
  props: PropSpawn[]
  lights: LightToggle[]
  balloonTint: string
  ambientOrder: number[]
}

function mulberryRange(rng: () => number, min: number, max: number): number {
  return min + (max - min) * rng()
}

export function createZoneDecor(seed: string, zone: string): ZoneDecor {
  const rng = seedrandom(`${seed}:${zone}`)
  const props: PropSpawn[] = []
  const kinds: PropSpawn['kind'][] = ['cup', 'flyer', 'ticket', 'trash']

  const count = 8 + Math.floor(rng() * 7)
  for (let i = 0; i < count; i++) {
    props.push({
      id: `${zone}-prop-${i}`,
      kind: kinds[Math.floor(rng() * kinds.length)]!,
      position: [
        mulberryRange(rng, -18, 18),
        0.15,
        mulberryRange(rng, -16, 22),
      ],
      rotationY: mulberryRange(rng, 0, Math.PI * 2),
    })
  }

  const lights: LightToggle[] = [
    {
      id: `${zone}-lamp-a`,
      on: rng() > 0.25,
      color: '#ffb86a',
      position: [-8, 4.2, -6],
      intensity: 2.4,
    },
    {
      id: `${zone}-lamp-b`,
      on: rng() > 0.35,
      color: '#7ec8ff',
      position: [9, 4.2, 4],
      intensity: 2.1,
    },
    {
      id: `${zone}-neon`,
      on: rng() > 0.15,
      color: '#ff6ad5',
      position: [0, 5.5, -12],
      intensity: 3.2,
    },
  ]

  const tints = ['#e85d75', '#5ec8e8', '#f2d36b', '#c7a0ff']
  const balloonTint = tints[Math.floor(rng() * tints.length)]!

  return {
    props,
    lights,
    balloonTint,
    ambientOrder: [0, 1, 2].sort(() => rng() - 0.5),
  }
}
