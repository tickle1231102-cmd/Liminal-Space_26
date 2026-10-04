/**
 * 심야 학교의 실내 공기. 놀이공원의 네온 대신 형광등 백색이 기준이고,
 * 야외 앰비언스(별·반딧불 파티클)는 의도적으로 뺐다 — PRD 12절 "방음된 듯한 정적".
 */
export function SchoolAtmosphere({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <>
      <color attach="background" args={['#0b0e14']} />
      {/* 복도 끝이 흐려지도록 가깝게 — 안이 넓어 보이지 않게 한다 */}
      <fog attach="fog" args={['#121722', 14, 62]} />

      <ambientLight intensity={0.55} color="#c3cbd8" />
      <hemisphereLight args={['#8e9aad', '#1b1f27', 0.6]} />

      {/* 창밖에서 들어오는 약한 달빛 — 그림자 방향만 잡아 준다 */}
      <directionalLight
        position={[18, 16, 12]}
        intensity={0.4}
        color="#aebcd8"
        castShadow={!reduceMotion}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={120}
        shadow-camera-left={-45}
        shadow-camera-right={45}
        shadow-camera-top={45}
        shadow-camera-bottom={-45}
        shadow-bias={-0.0003}
      />
    </>
  )
}
