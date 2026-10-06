import { Environment, Lightformer } from '@react-three/drei'

/**
 * 센토의 실내 공기 — 학교의 차가운 형광등과 대비되는 백열등의 온기와 습기(PRD 13절).
 * 김은 3단계에서 파티클·높이 안개로 보강한다.
 */
export function BathAtmosphere({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <>
      <color attach="background" args={['#101315']} />
      <fog attach="fog" args={['#2a2b2a', 9, 46]} />

      {/*
        반사용 환경맵 — 외부 HDR 없이 라이트포머로 만든다. 광택 타일·물이 천장 등과
        고창의 빛을 은은하게 비추게 해 준다(배경에는 쓰지 않음).
      */}
      <Environment resolution={128} frames={1} environmentIntensity={0.55}>
        <color attach="background" args={['#1a1714']} />
        <Lightformer form="rect" intensity={2.2} color="#ffd9b0" position={[0, 6, -18]} rotation={[Math.PI / 2, 0, 0]} scale={[16, 6, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#b9c8da" position={[-14, 4, -20]} rotation={[0, Math.PI / 2, 0]} scale={[10, 2, 1]} />
        <Lightformer form="ring" intensity={1.4} color="#ffcf9a" position={[6, 5, -8]} scale={2} />
        <Lightformer form="rect" intensity={0.5} color="#e8e0d4" position={[0, 2, 10]} scale={[20, 4, 1]} />
      </Environment>

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
