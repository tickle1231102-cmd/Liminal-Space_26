import { useAnimations, useGLTF } from '@react-three/drei'
import { createPortal } from '@react-three/fiber'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { useEffect, useMemo, type ReactNode } from 'react'
import { Box3, Euler, Matrix4, Mesh, Quaternion, Vector3, type Object3D } from 'three'

// Runtime side of the Blender naming contract (art/blender/lib/common.py):
//   COL_*    → hidden, converted to fixed Rapier cuboids
//   ANCHOR_* → exposed as spawn points for seeded placement
export type GltfAnchor = { name: string; position: [number, number, number] }

type Cuboid = { key: string; half: [number, number, number]; position: [number, number, number]; rotation: [number, number, number] }

function extract(root: Object3D) {
  const colliders: Cuboid[] = []
  const anchors: GltfAnchor[] = []
  root.updateMatrixWorld(true)
  root.traverse((o) => {
    if (o.name.startsWith('COL_') && (o as Mesh).isMesh) {
      const mesh = o as Mesh
      mesh.visible = false
      mesh.geometry.computeBoundingBox()
      const box = mesh.geometry.boundingBox as Box3
      const size = box.getSize(new Vector3()).multiply(mesh.getWorldScale(new Vector3()))
      const center = box.getCenter(new Vector3()).applyMatrix4(mesh.matrixWorld)
      const rot = new Euler().setFromQuaternion(mesh.getWorldQuaternion(mesh.quaternion.clone()))
      colliders.push({ key: o.name, half: [size.x / 2, size.y / 2, size.z / 2], position: center.toArray(), rotation: [rot.x, rot.y, rot.z] })
    } else if (o.name.startsWith('ANCHOR_')) {
      anchors.push({ name: o.name.slice(7), position: o.getWorldPosition(new Vector3()).toArray() })
    } else if ((o as Mesh).isMesh) {
      o.castShadow = true
      o.receiveShadow = true
    }
  })
  return { colliders, anchors }
}

export function GltfAsset({
  url,
  position = [0, 0, 0],
  rotationY = 0,
  scale = [1, 1, 1],
}: {
  url: string
  position?: [number, number, number]
  rotationY?: number
  /** Non-uniform stretch (e.g. a door frame fitted to its opening); colliders follow. */
  scale?: [number, number, number]
}) {
  const { scene } = useGLTF(url)
  const { root, colliders } = useMemo(() => {
    const root = scene.clone(true)
    return { root, ...extract(root) }
  }, [scene])
  const [sx, sy, sz] = scale

  return (
    <RigidBody type="fixed" colliders={false} position={position} rotation={[0, rotationY, 0]}>
      <primitive object={root} scale={scale} />
      {colliders.map((c) => (
        <CuboidCollider
          key={c.key}
          args={[c.half[0] * sx, c.half[1] * sy, c.half[2] * sz]}
          position={[c.position[0] * sx, c.position[1] * sy, c.position[2] * sz]}
          rotation={c.rotation}
          friction={1}
        />
      ))}
    </RigidBody>
  )
}

export const parkModel = (name: string) => `${import.meta.env.BASE_URL}assets/models/park/${name}.glb`
export const schoolModel = (name: string) => `${import.meta.env.BASE_URL}assets/models/school/${name}.glb`

export type InstanceXform = { position: [number, number, number]; rotationY?: number; scale?: [number, number, number] }

/**
 * Many copies of one model as InstancedMeshes (one draw call per material).
 * Visual only — pass colliders separately (e.g. one cuboid per fence run).
 */
export function GltfInstances({ url, items }: { url: string; items: InstanceXform[] }) {
  const { scene } = useGLTF(url)
  const parts = useMemo(() => {
    scene.updateMatrixWorld(true)
    const out: { key: string; mesh: Mesh }[] = []
    scene.traverse((o) => {
      if ((o as Mesh).isMesh && !o.name.startsWith('COL_')) out.push({ key: o.uuid, mesh: o as Mesh })
    })
    return out
  }, [scene])

  const matrices = useMemo(
    () =>
      items.map((it) =>
        new Matrix4().compose(
          new Vector3(...it.position),
          new Quaternion().setFromEuler(new Euler(0, it.rotationY ?? 0, 0)),
          new Vector3(...(it.scale ?? [1, 1, 1])),
        ),
      ),
    [items],
  )

  return (
    <>
      {parts.map(({ key, mesh }) => (
        <instancedMesh
          key={key}
          args={[mesh.geometry, mesh.material, items.length]}
          castShadow
          receiveShadow
          ref={(im) => {
            if (!im) return
            const m = new Matrix4()
            matrices.forEach((base, i) => im.setMatrixAt(i, m.multiplyMatrices(base, mesh.matrixWorld)))
            im.instanceMatrix.needsUpdate = true
            im.computeBoundingSphere()
          }}
        />
      ))}
    </>
  )
}

/** ANCHOR_* points of a model in its own (unplaced) space, for seeded placement. */
export function useGltfAnchors(url: string): GltfAnchor[] {
  const { scene } = useGLTF(url)
  return useMemo(() => extract(scene.clone(true)).anchors, [scene])
}

/** Visual-only copy (no colliders) — e.g. inside a dynamic RigidBody that auto-fits its own collider. */
export function GltfVisual({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  const root = useMemo(() => {
    const root = scene.clone(true)
    extract(root)
    return root
  }, [scene])
  return <primitive object={root} />
}

/**
 * Model with baked Blender animation: every clip loops via AnimationMixer.
 * `children` are mounted onto the node named `mountNode` so they ride along (e.g. carousel "Platform").
 */
export function GltfAnimated({
  url,
  position = [0, 0, 0],
  rotationY = 0,
  mountNode,
  children,
}: {
  url: string
  position?: [number, number, number]
  rotationY?: number
  mountNode?: string
  children?: ReactNode
}) {
  const { scene, animations } = useGLTF(url)
  const { root, colliders } = useMemo(() => {
    const root = scene.clone(true)
    return { root, ...extract(root) }
  }, [scene])
  const { actions } = useAnimations(animations, root)
  useEffect(() => {
    const all = Object.values(actions)
    all.forEach((a) => a?.reset().play())
    return () => all.forEach((a) => a?.stop())
  }, [actions])
  const mount = useMemo(() => (mountNode ? root.getObjectByName(mountNode) : undefined), [root, mountNode])

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <primitive object={root} />
      {colliders.length > 0 && (
        <RigidBody type="fixed" colliders={false}>
          {colliders.map((c) => (
            <CuboidCollider key={c.key} args={c.half} position={c.position} rotation={c.rotation} friction={1} />
          ))}
        </RigidBody>
      )}
      {mount && children ? createPortal(children, mount) : null}
    </group>
  )
}

/**
 * Straight run of a tiling module (fence, wall) from (x,z) to (x,z): instanced copies stretched
 * to fit exactly, plus one collider for the whole run. `module` = model length along its X.
 */
export function ModuleRun({
  url,
  from,
  to,
  module,
  height,
  thickness,
  fit,
}: {
  url: string
  from: [number, number]
  to: [number, number]
  module: number
  height: number
  thickness: number
  /** Model's native height/thickness: when given, modules are also stretched to `height`/`thickness`. */
  fit?: { height: number; thickness: number }
}) {
  const { items, center, half, rotationY } = useMemo(() => {
    const [dx, dz] = [to[0] - from[0], to[1] - from[1]]
    const len = Math.hypot(dx, dz)
    const n = Math.max(1, Math.round(len / module))
    const rotationY = -Math.atan2(dz, dx)
    const items: InstanceXform[] = Array.from({ length: n }, (_, i) => {
      const t = (i + 0.5) / n
      const sy = fit ? height / fit.height : 1
      const sz = fit ? thickness / fit.thickness : 1
      return { position: [from[0] + dx * t, 0, from[1] + dz * t], rotationY, scale: [len / n / module, sy, sz] }
    })
    return {
      items,
      center: [(from[0] + to[0]) / 2, height / 2, (from[1] + to[1]) / 2] as [number, number, number],
      half: [len / 2, height / 2, thickness / 2] as [number, number, number],
      rotationY,
    }
  }, [from, to, module, height, thickness, fit])
  return (
    <>
      <GltfInstances url={url} items={items} />
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={half} position={center} rotation={[0, rotationY, 0]} />
      </RigidBody>
    </>
  )
}
