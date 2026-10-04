import { useMemo } from 'react'
import { RigidBody } from '@react-three/rapier'
import { WallPanel } from './SchoolKit'
import { noticeTexture, lockerLabelTexture } from './schoolTextures'

export type SchoolFragment = {
  id: string
  kind: 'note' | 'locker-label' | 'notice'
  position: [number, number, number]
  rotationY?: number
  /** 화면에 띄우지 않는다 — 기록용 원문(PRD 08절: 수집 UI 없음). */
  text: string
}

const FRAGMENTS: SchoolFragment[] = [
  {
    id: 'note-desk',
    kind: 'note',
    position: [-9.5, 0.78, -2.4],
    text: '먼저 가 있을게.\n문 잠그지 마.',
  },
  {
    id: 'note-cafeteria',
    kind: 'note',
    position: [16.5, 0.78, -24],
    text: '오늘 급식 잔반 없음.\n먹은 사람도 없음.',
  },
  {
    id: 'locker-entrance',
    kind: 'locker-label',
    position: [-6.45, 1.1, 12.5],
    rotationY: Math.PI / 2,
    text: '이름표 절반이 뜯겨 있다.',
  },
  {
    id: 'notice-corridor',
    kind: 'notice',
    position: [3.8, 1.8, -33],
    rotationY: -Math.PI / 2,
    text: '3월 2일 하교 완료 — 잔류 인원 0명',
  },
]

/** 메시만으로 표현하는 파편 — 폰트 로딩/서스펜스 없이 캔버스가 바로 뜬다. */
export function SchoolFragments() {
  const notice = useMemo(() => noticeTexture('잔류 인원 확인', '3월 2일 — 0명'), [])
  const labels = useMemo(() => lockerLabelTexture(), [])

  return (
    <group name="school-fragments">
      {FRAGMENTS.map((f) => (
        <group key={f.id} position={f.position} rotation={[0, f.rotationY ?? 0, 0]}>
          {f.kind === 'note' && (
            <RigidBody type="fixed" colliders={false}>
              <mesh rotation={[-Math.PI / 2, 0, 0.35]}>
                <planeGeometry args={[0.24, 0.32]} />
                <meshStandardMaterial color="#e9e3d2" roughness={0.95} />
              </mesh>
            </RigidBody>
          )}
          {f.kind === 'locker-label' && (
            <WallPanel position={[0, 0, 0]} size={[1.2, 1.0]} map={labels} />
          )}
          {f.kind === 'notice' && (
            <WallPanel position={[0, 0, 0]} size={[1.1, 1.1]} map={notice} emissiveIntensity={0.14} />
          )}
        </group>
      ))}
    </group>
  )
}

export { FRAGMENTS as SCHOOL_FRAGMENTS }
