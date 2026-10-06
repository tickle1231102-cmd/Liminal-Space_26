"""Shared bathhouse (sento) materials — one look across every bathhouse model."""
import bpy
from common import material
from quality import tile_textures, wood_textures, pbr_material

_cache = {}


def _once(key, make):
    if key not in _cache or _cache[key].name not in bpy.data.materials:
        _cache[key] = make()
    return _cache[key]


def tile_blue():
    return _once("blue", lambda: pbr_material("TileBlue", tile_textures(
        "TileBlue", tile=(0.125, 0.125), colors=((0.12, 0.3, 0.42), (0.14, 0.33, 0.45), (0.11, 0.27, 0.39)),
        grout_color=(0.62, 0.64, 0.62), jitter=0.06, gloss=0.1, seed=3)))


def tile_white():
    return _once("white", lambda: pbr_material("TileWhite", tile_textures(
        "TileWhite", tile=(0.2, 0.2), colors=((0.9, 0.91, 0.88), (0.87, 0.89, 0.86)),
        grout_color=(0.66, 0.67, 0.64), jitter=0.025, gloss=0.14, seed=5)))


def tile_floor():
    """Matte non-slip 10 cm floor tiles, faint grey-green."""
    return _once("floor", lambda: pbr_material("TileFloor", tile_textures(
        "TileFloor", tile=(0.1, 0.1), colors=((0.72, 0.75, 0.72), (0.69, 0.72, 0.7), (0.74, 0.76, 0.73)),
        grout_color=(0.45, 0.47, 0.45), jitter=0.05, gloss=0.38, grout=0.004, seed=11)))


def tile_mosaic():
    """5 cm aqua mosaic for tub interiors."""
    return _once("mosaic", lambda: pbr_material("TileMosaic", tile_textures(
        "TileMosaic", tile=(0.05, 0.05), colors=((0.22, 0.52, 0.55), (0.26, 0.58, 0.6), (0.18, 0.46, 0.5), (0.3, 0.6, 0.58)),
        grout_color=(0.75, 0.78, 0.76), jitter=0.08, gloss=0.08, grout=0.002, edge=0.003, seed=13)))


def tile_stone():
    """Genkan: 25 cm grey terrazzo-ish slabs."""
    return _once("stone", lambda: pbr_material("TileStone", tile_textures(
        "TileStone", tile=(0.25, 0.25), colors=((0.42, 0.41, 0.39), (0.46, 0.45, 0.42), (0.39, 0.38, 0.36)),
        grout_color=(0.25, 0.25, 0.24), jitter=0.06, gloss=0.3, grout=0.004, seed=17)))


def wood(kind="light"):
    presets = {
        "light": dict(color=(0.55, 0.38, 0.22), gloss=0.38, seed=7, plank=0.125),
        "dark": dict(color=(0.27, 0.16, 0.09), gloss=0.32, seed=9, plank=0.1),
        "hinoki": dict(color=(0.72, 0.56, 0.38), gloss=0.55, seed=21, plank=0.09),
    }
    p = presets[kind]
    return _once(f"wood_{kind}", lambda: pbr_material(f"Wood_{kind}", wood_textures(f"Wood_{kind}", **p)))


def brass():
    return _once("brass", lambda: material("Brass", (0.62, 0.45, 0.2), roughness=0.3, metallic=1.0))


def chrome():
    return _once("chrome", lambda: material("Chrome", (0.8, 0.8, 0.82), roughness=0.12, metallic=1.0))


def enamel(color, name):
    return _once(name, lambda: material(name, color, roughness=0.18))


def granite():
    return _once("granite", lambda: material("CapGranite", (0.12, 0.12, 0.13), roughness=0.22))


# ---- Three-space helpers: author in runtime coordinates (y up, model faces +z) ----
import math
from common import box, cylinder, collider


def P(x, y, z):
    """Three (x, y, z) -> Blender (x, -z, y)."""
    return (x, -z, y)


def S(sx, sy, sz):
    return (sx, sz, sy)


def tbox(name, size, pos, mat=None):
    return box(name, S(*size), P(*pos), mat)


def tcol(name, size, pos):
    return collider(name, S(*size), P(*pos))


def tcyl(name, r, length, pos, mat=None, axis="y", verts=20):
    """Cylinder along a Three axis."""
    o = cylinder(name, r, length, P(*pos), mat, verts=verts)
    o.rotation_euler = {"y": (0, 0, 0), "x": (0, math.pi / 2, 0), "z": (math.pi / 2, 0, 0)}[axis]
    return o


def tcyl_between(name, r, a, b, mat=None, verts=12):
    """Cylinder from Three point a to b."""
    from mathutils import Vector
    pa, pb = Vector(P(*a)), Vector(P(*b))
    d = pb - pa
    o = cylinder(name, r, d.length, tuple((pa + pb) / 2), mat, verts=verts)
    o.rotation_euler = Vector((0, 0, 1)).rotation_difference(d.normalized()).to_euler()
    return o


def wedge(name, pts_yz, x0, x1, mat=None):
    """Prism: polygon in Three (z, y) extruded from x0 to x1."""
    import bpy
    verts = []
    for x in (x0, x1):
        for z, y in pts_yz:
            verts.append(P(x, y, z))
    n = len(pts_yz)
    faces = [tuple(range(n))[::-1], tuple(range(n, 2 * n))]
    for i in range(n):
        j = (i + 1) % n
        faces.append((i, j, n + j, n + i))
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    me.update()
    me.validate()
    # consistent outward normals
    import bmesh
    bm = bmesh.new()
    bm.from_mesh(me)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(o)
    if mat:
        me.materials.append(mat)
    return o


def torus(name, major, minor, pos, mat=None, axis="z"):
    import bpy
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor, location=P(*pos),
                                     major_segments=24, minor_segments=8)
    o = bpy.context.active_object
    o.name = name
    o.rotation_euler = {"y": (0, 0, 0), "x": (0, math.pi / 2, 0), "z": (math.pi / 2, 0, 0)}[axis]
    if mat:
        o.data.materials.append(mat)
    return o


def all_meshes():
    import bpy
    return [o for o in bpy.context.scene.objects if o.type == "MESH"]
