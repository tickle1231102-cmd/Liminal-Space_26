"""Shared jjimjilbang (Korean sauna) materials — one look across every jjimjilbang model.
Dry heat and yellowed fluorescent light: vinyl jangpan floors, red clay, salt brick, charcoal."""
import bpy
from common import material
from quality import tile_textures, wood_textures, plaster_textures, pbr_material
from bath_common import P, S, tbox, tcol, tcyl, tcyl_between, torus, all_meshes  # noqa: F401 (re-exported)

_cache = {}


def _once(key, make):
    if key not in _cache or _cache[key].name not in bpy.data.materials:
        _cache[key] = make()
    return _cache[key]


def jangpan():
    """Glossy ochre vinyl flooring, 50 cm printed squares with hairline seams."""
    return _once("jangpan", lambda: pbr_material("Jangpan", tile_textures(
        "Jangpan", tile=(0.5, 0.5), colors=((0.66, 0.52, 0.27), (0.69, 0.55, 0.3), (0.63, 0.5, 0.26)),
        grout_color=(0.5, 0.39, 0.2), jitter=0.03, gloss=0.26, grout=0.002, grout_rough=0.5, edge=0.002, seed=41)))


def carpet():
    """Hotel-basement carpet: deep maroon, fully matte, fine pile."""
    return _once("carpet", lambda: pbr_material("Carpet", plaster_textures(
        "Carpet", size=512, color=(0.2, 0.07, 0.08), grain=4.0, rough=1.0, seed=43)))


def plaster():
    return _once("plaster", lambda: pbr_material("Plaster", plaster_textures(
        "Plaster", size=512, color=(0.78, 0.73, 0.62), seed=47)))


def concrete():
    return _once("concrete", lambda: pbr_material("Concrete", plaster_textures(
        "Concrete", size=512, color=(0.42, 0.41, 0.39), grain=2.0, rough=0.92, seed=53, pits=1.0)))


def hwangto():
    """Troweled red clay wall."""
    return _once("hwangto", lambda: pbr_material("Hwangto", plaster_textures(
        "Hwangto", size=512, color=(0.56, 0.3, 0.16), grain=3.0, rough=0.95, seed=59)))


def clay_brick():
    """Kiln dome: fired clay bricks, 25 x 12.5 cm."""
    return _once("clay_brick", lambda: pbr_material("ClayBrick", tile_textures(
        "ClayBrick", tile=(0.25, 0.125), colors=((0.5, 0.25, 0.13), (0.56, 0.29, 0.15), (0.44, 0.21, 0.11), (0.6, 0.34, 0.18)),
        grout_color=(0.3, 0.2, 0.13), jitter=0.12, gloss=0.8, grout=0.012, grout_rough=0.95, edge=0.008, seed=61)))


def salt_brick():
    """Himalayan salt bricks, 25 x 12.5 cm — pale pink to orange, slightly glassy."""
    return _once("salt_brick", lambda: pbr_material("SaltBrick", tile_textures(
        "SaltBrick", tile=(0.25, 0.125), colors=((0.86, 0.56, 0.47), (0.9, 0.66, 0.55), (0.8, 0.46, 0.36), (0.93, 0.74, 0.62)),
        grout_color=(0.42, 0.26, 0.2), jitter=0.14, gloss=0.3, grout=0.008, edge=0.008, seed=67)))


def charcoal():
    return _once("charcoal", lambda: pbr_material("Charcoal", plaster_textures(
        "Charcoal", size=512, color=(0.07, 0.065, 0.06), grain=3.0, rough=0.9, seed=71, pits=2.0)))


def stone():
    """Foot-channel lining: 50 cm honed grey stone."""
    return _once("stone", lambda: pbr_material("Stone", tile_textures(
        "Stone", tile=(0.5, 0.5), colors=((0.5, 0.49, 0.45), (0.54, 0.52, 0.48), (0.47, 0.46, 0.43)),
        grout_color=(0.3, 0.3, 0.28), jitter=0.05, gloss=0.3, grout=0.004, seed=73)))


def ice_panel():
    """Ice-room insulated panels: pale blue-white, 50 cm, satin."""
    return _once("ice_panel", lambda: pbr_material("IcePanel", tile_textures(
        "IcePanel", tile=(0.5, 0.5), colors=((0.74, 0.84, 0.88), (0.78, 0.87, 0.9)),
        grout_color=(0.5, 0.58, 0.62), jitter=0.02, gloss=0.22, grout=0.006, seed=79)))


def wood(kind="light"):
    presets = {
        "light": dict(color=(0.55, 0.4, 0.24), gloss=0.4, seed=83, plank=0.125),
        "dark": dict(color=(0.24, 0.15, 0.09), gloss=0.34, seed=89, plank=0.1),
        "hinoki": dict(color=(0.72, 0.56, 0.38), gloss=0.55, seed=97, plank=0.1),
    }
    p = presets[kind]
    return _once(f"wood_{kind}", lambda: pbr_material(f"Wood_{kind}", wood_textures(f"Wood_{kind}", **p)))


def brass():
    return _once("brass", lambda: material("Brass", (0.62, 0.45, 0.2), roughness=0.3, metallic=1.0))


def steel():
    return _once("steel", lambda: material("Steel", (0.55, 0.57, 0.58), roughness=0.35, metallic=1.0))


def flat(name, color, roughness=0.7):
    return _once(name, lambda: material(name, color, roughness=roughness))


def prism_xy(name, pts_xy, z0, z1, mat=None):
    """Polygon in Three (x, y) extruded along Three z from z0 to z1 (may be concave: arch spandrels)."""
    import bmesh
    verts = [P(x, y, z) for z in (z0, z1) for x, y in pts_xy]
    n = len(pts_xy)
    faces = [tuple(range(n)), tuple(range(n, 2 * n))[::-1]]
    for i in range(n):
        j = (i + 1) % n
        faces.append((i, n + i, n + j, j))
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    me.update()
    me.validate()
    bm = bmesh.new()
    bm.from_mesh(me)
    bmesh.ops.triangulate(bm, faces=[f for f in bm.faces if len(f.verts) > 4])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(o)
    if mat:
        me.materials.append(mat)
    return o
