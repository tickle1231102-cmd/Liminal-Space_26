"""Shared helpers for headless Blender asset scripts.

Naming contract with the runtime (src/world/GltfAsset.tsx):
  COL_*     box collider, hidden at runtime, becomes a Rapier cuboid
  ANCHOR_*  empty marking a prop spawn point for seeded placement
"""
import os
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


def parent_keep(child, parent):
    """Parent while keeping the child's world transform."""
    # matrix_world of freshly created/moved objects is stale until the depsgraph updates
    bpy.context.view_layer.update()
    child.parent = parent
    child.matrix_parent_inverse = parent.matrix_world.inverted()


def empty(name, location=(0, 0, 0)):
    obj = bpy.data.objects.new(name, None)
    obj.location = location
    bpy.context.collection.objects.link(obj)
    return obj


def loop_timeline(seconds, fps=30):
    """Set the scene range for a seamless loop of `seconds`; returns frame count."""
    scene = bpy.context.scene
    scene.render.fps = fps
    frames = round(seconds * fps)
    scene.frame_start = 0
    scene.frame_end = frames
    bpy.context.preferences.edit.keyframe_new_interpolation_type = "LINEAR"
    return frames


def key_spin(obj, axis, frames, turns=1.0, steps=8):
    """Linear spin of `turns` revolutions over the loop (keys every 1/steps turn)."""
    import math
    for i in range(steps + 1):
        obj.rotation_euler[axis] = turns * 2 * math.pi * i / steps
        obj.keyframe_insert("rotation_euler", index=axis, frame=frames * i / steps)


def key_bob(obj, frames, cycles, amplitude, phase=0.0, samples=48):
    """Sine bob on Z that loops exactly `cycles` times over the timeline."""
    import math
    z0 = obj.location.z
    for i in range(samples + 1):
        t = i / samples
        obj.location.z = z0 + amplitude * math.sin(2 * math.pi * cycles * t + phase)
        obj.keyframe_insert("location", index=2, frame=frames * t)
    obj.location.z = z0


def bake_shading(obj, size=512, samples=96, distance=0.6, ground=True):
    """Bake albedo x ambient occlusion into one base-color atlas on a second UV set ("Bake").
    Unlike an aoMap (ambient-only in three.js) this darkens contact areas under every light.
    Transparent materials keep their flat color. A temporary ground plane adds floor contact."""
    import numpy as np
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.render.bake.margin = 4
    if scene.world is None:
        scene.world = bpy.data.worlds.new("BakeWorld")
    scene.world.light_settings.distance = distance

    me = obj.data
    uv = me.uv_layers.new(name="Bake")
    me.uv_layers.active = uv
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.smart_project(island_margin=0.03)
    bpy.ops.object.mode_set(mode="OBJECT")

    plane = None
    if ground:
        bpy.ops.mesh.primitive_plane_add(size=60, location=(0, 0, 0))
        plane = bpy.context.active_object
        bpy.ops.object.select_all(action="DESELECT")
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj

    ao = bpy.data.images.new(f"{obj.name}_AO", size, size)
    col = bpy.data.images.new(f"{obj.name}_Shade", size, size)
    mats = [m for m in me.materials if m]
    nodes = {}
    for m in mats:
        nt = m.node_tree
        tex = nt.nodes.new("ShaderNodeTexImage")
        uvn = nt.nodes.new("ShaderNodeUVMap")
        uvn.uv_map = "Bake"
        nt.links.new(uvn.outputs["UV"], tex.inputs["Vector"])
        nt.nodes.active = tex
        nodes[m.name] = tex

    def bake(img, kind, **kw):
        for t in nodes.values():
            t.image = img
        scene.cycles.samples = samples if kind == "AO" else 1
        bpy.ops.object.bake(type=kind, **kw)

    # Collider proxies enclose the visual parts; they must not occlude the bake
    proxies = [o for o in scene.objects if o.name.startswith("COL_")]
    for o in proxies:
        o.hide_render = True
    bake(ao, "AO")
    bake(col, "DIFFUSE", pass_filter={"COLOR"})
    for o in proxies:
        o.hide_render = False
    if plane:
        bpy.data.objects.remove(plane, do_unlink=True)

    dbg = os.environ.get("BAKE_DEBUG_DIR")
    if dbg:
        for img in (ao, col):
            img.filepath_raw = os.path.join(dbg, img.name + ".png")
            img.file_format = "PNG"
            img.save()
    a = np.array(ao.pixels[:]).reshape(-1, 4)
    c = np.array(col.pixels[:]).reshape(-1, 4)
    c[:, :3] *= a[:, :1] * 0.8 + 0.2   # keep some fill in crevices
    c[:, 3] = 1.0
    col.pixels[:] = c.ravel()
    col.file_format = "JPEG"
    col.pack()

    for m in mats:
        nt = m.node_tree
        tex = nodes[m.name]
        bsdf = nt.nodes["Principled BSDF"]
        if m.blend_method == "BLEND" or bsdf.inputs["Alpha"].default_value < 1:
            nt.nodes.remove(tex)
            continue
        tex.image = col
        nt.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    bpy.data.images.remove(ao)
    return col


def export_glb(path, animated=False, bake=True, bake_size=512):
    if bake and not animated:
        visual = [o for o in bpy.context.scene.objects if o.type == "MESH" and not o.name.startswith("COL_")]
        if len(visual) == 1:  # join_visual'd static model: one atlas
            bake_shading(visual[0], size=bake_size)
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_animations=animated,
        **({"export_animation_mode": "SCENE", "export_force_sampling": True} if animated else {}),
        export_format="GLB",
        export_yup=True,
        export_apply=True,
        export_extras=True,
        export_cameras=False,
        export_lights=False,
        export_image_format="JPEG",
        export_jpeg_quality=85,
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


def join_visual(name, objs=None):
    """Merge meshes into one object (one draw call per material at runtime).
    Default: every non-COL mesh in the scene; pass objs to join a subset (animated parts)."""
    meshes = objs if objs is not None else [
        o for o in bpy.context.scene.objects if o.type == "MESH" and not o.name.startswith("COL_")
    ]
    if len(meshes) < 2:
        return meshes[0] if meshes else None
    bpy.ops.object.select_all(action="DESELECT")
    for o in meshes:
        o.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    bpy.ops.object.join()
    meshes[0].name = name
    return meshes[0]
