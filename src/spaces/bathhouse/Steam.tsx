import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uScale;
  attribute float aSeed;
  varying float vAlpha;
  #include <fog_pars_vertex>
  void main() {
    // 각 입자는 수면에서 올라가며 퍼지고 사라진다 — aSeed로 주기를 엇갈린다
    float life = fract(uTime * (0.045 + 0.03 * fract(aSeed * 7.1)) + aSeed);
    vec3 p = position;
    p.y += life * 2.6;
    p.x += sin(uTime * 0.3 + aSeed * 40.0) * 0.35 * life;
    p.z += cos(uTime * 0.25 + aSeed * 23.0) * 0.35 * life;
    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = uScale * (0.6 + life * 1.6) / -mvPosition.z;
    #include <fog_vertex>
    vAlpha = smoothstep(0.0, 0.15, life) * (1.0 - smoothstep(0.55, 1.0, life));
  }
`
const FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAlpha;
  #include <fog_pars_fragment>
  void main() {
    float r = length(gl_PointCoord - 0.5) * 2.0;
    float a = pow(clamp(1.0 - r, 0.0, 1.0), 2.5);
    gl_FragColor = vec4(uColor, a * vAlpha * uOpacity);
    #include <fog_fragment>
  }
`

/**
 * 탕 위로 피어오르는 김 — 크고 흐릿한 포인트 스프라이트. 저사양에선 개수를 줄인다.
 * reduceMotion이면 멈춘 채 옅게 남는다.
 */
export function Steam({
  x,
  z,
  y,
  count,
  opacity = 0.05,
  reduceMotion,
}: {
  x: [number, number]
  z: [number, number]
  y: number
  count: number
  opacity?: number
  reduceMotion: boolean
}) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    const seed = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = x[0] + Math.random() * (x[1] - x[0])
      pos[i * 3 + 1] = y
      pos[i * 3 + 2] = z[0] + Math.random() * (z[1] - z[0])
      seed[i] = Math.random()
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    g.boundingSphere = new THREE.Sphere(
      new THREE.Vector3((x[0] + x[1]) / 2, y + 1.5, (z[0] + z[1]) / 2),
      Math.hypot(x[1] - x[0], z[1] - z[0]) / 2 + 3,
    )
    return g
  }, [x, z, y, count])

  const mat = useRef(
    new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        ...THREE.UniformsLib.fog,
        uTime: { value: 0 },
        uScale: { value: 2400 },
        uColor: { value: new THREE.Color('#f3ece2') },
        uOpacity: { value: opacity },
      },
      transparent: true,
      depthWrite: false,
      fog: true,
    }),
  )

  useFrame((_, dt) => {
    if (!reduceMotion) mat.current.uniforms.uTime.value += dt
  })

  return <points geometry={geo} material={mat.current} renderOrder={3} />
}
