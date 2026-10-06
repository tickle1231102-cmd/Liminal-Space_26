/**
 * 센토의 실내 공기 — 학교의 차가운 형광등과 대비되는 백열등의 온기와 습기(PRD 13절).
 * 김은 3단계에서 파티클·높이 안개로 보강한다.
 */
export function BathAtmosphere({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <>
      <color attach="background" args={['#101315']} />
      <fog attach="fog" args={['#2a2b2a', 9, 46]} />

      <ambientLight intensity={0.42} color="#e8d8c4" />
      <hemisphereLight args={['#f0dcc0', '#2a2622', 0.55]} />

      {/* 욕실 고창으로 드는 희미한 새벽빛 — 그림자 방향만 잡는다 */}
      <directionalLight
        position={[-14, 18, -6]}
        intensity={0.35}
        color="#b8c4d4"
        castShadow={!reduceMotion}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={90}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-bias={-0.0003}
      />
    </>
  )
}
