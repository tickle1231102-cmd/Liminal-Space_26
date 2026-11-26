import { Environment, Lightformer } from '@react-three/drei'

/**
 * 찜질방의 실내 공기 — 마른 열기와 누런 형광등(PRD 15절). 어둡게 만들지 않는다.
 * 창이 없는 지하라 방향광은 쓰지 않고, 구역마다 천장 등이 빛을 맡는다.
 */
export function JjimAtmosphere() {
  return (
    <>
      <color attach="background" args={['#14110d']} />
      <fog attach="fog" args={['#2b2620', 12, 60]} />
      {/* 반사용 환경맵 — 수로 수면과 장판 광택이 천장 등을 은은하게 비춘다(배경에는 쓰지 않음) */}
      <Environment resolution={64} frames={1} environmentIntensity={0.45}>
        <color attach="background" args={['#1c1812']} />
        <Lightformer form="rect" intensity={2} color="#fff1c9" position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[12, 6, 1]} />
        <Lightformer form="rect" intensity={0.6} color="#e9dcc0" position={[0, 2, 12]} scale={[20, 4, 1]} />
      </Environment>
      <ambientLight intensity={0.22} color="#f0e2c4" />
      <hemisphereLight args={['#f4e6c8', '#2a241c', 0.28]} />
    </>
  )
}
