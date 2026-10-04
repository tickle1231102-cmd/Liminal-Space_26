import { useGLTF } from '@react-three/drei'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { useMemo } from 'react'
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
}: {
  url: string
  position?: [number, number, number]
  rotationY?: number
}) {
  const { scene } = useGLTF(url)
  const { root, colliders } = useMemo(() => {
    const root = scene.clone(true)
    return { root, ...extract(root) }
  }, [scene])

  return (
    <RigidBody type="fixed" colliders={false} position={position} rotation={[0, rotationY, 0]}>
      <primitive object={root} />
      {colliders.map((c) => (
        <CuboidCollider key={c.key} args={c.half} position={c.position} rotation={c.rotation} friction={1} />
      ))}
    </RigidBody>
  )
}

export const parkModel = (name: string) => `${import.meta.env.BASE_URL}assets/models/park/${name}.glb`

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
