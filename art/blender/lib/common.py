"""Shared helpers for headless Blender asset scripts.

Naming contract with the runtime (src/world/GltfAsset.tsx):
  COL_*     box collider, hidden at runtime, becomes a Rapier cuboid
  ANCHOR_*  empty marking a prop spawn point for seeded placement
"""
import sys
import bpy


def out_path():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    if "--out" not in argv:
        raise SystemExit("usage: blender -b -P script.py -- --out file.glb")
    return argv[argv.index("--out") + 1]


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def material(name, color, roughness=0.6, metallic=0.0, emission=None, strength=1.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*color, 1.0)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    if emission:
        bsdf.inputs["Emission Color"].default_value = (*emission, 1.0)
        bsdf.inputs["Emission Strength"].default_value = strength
    return mat


def box(name, size, location, mat=None, parent=None):
    """Axis-aligned box; size is full extents (x, y, z) in Blender Z-up meters."""
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if mat:
        obj.data.materials.append(mat)
    if parent:
        obj.parent = parent
    return obj


def cylinder(name, radius, depth, location, mat=None, verts=12):
    bpy.ops.mesh.primitive_cylinder_add(radius=radius, depth=depth, vertices=verts, location=location)
    obj = bpy.context.active_object
    obj.name = name
    if mat:
        obj.data.materials.append(mat)
    return obj


def collider(name, size, location):
    obj = box(f"COL_{name}", size, location)
    obj.display_type = "WIRE"
    return obj


def anchor(name, location):
    obj = bpy.data.objects.new(f"ANCHOR_{name}", None)
    obj.location = location
    bpy.context.collection.objects.link(obj)
    return obj


def export_glb(path):
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        export_yup=True,
        export_apply=True,
        export_extras=True,
        export_cameras=False,
        export_lights=False,
    )
    print(f"[asset] wrote {path}")


def cone(name, r1, r2, depth, location, mat=None, verts=32):
    bpy.ops.mesh.primitive_cone_add(radius1=r1, radius2=r2, depth=depth, vertices=verts, location=location)
    obj = bpy.context.active_object
    obj.name = name
    if mat:
        obj.data.materials.append(mat)
    return obj


def sphere(name, radius, location, mat=None, segments=16):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=radius, segments=segments, ring_count=segments // 2, location=location)
    obj = bpy.context.active_object
    obj.name = name
    if mat:
        obj.data.materials.append(mat)
    bpy.ops.object.shade_smooth()
    return obj


def join_visual(name):
    """Merge every non-COL mesh into one object (one draw call per material at runtime)."""
    meshes = [o for o in bpy.context.scene.objects if o.type == "MESH" and not o.name.startswith("COL_")]
    if len(meshes) < 2:
        return meshes[0] if meshes else None
    bpy.ops.object.select_all(action="DESELECT")
    for o in meshes:
        o.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    bpy.ops.object.join()
    meshes[0].name = name
    return meshes[0]
