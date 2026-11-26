"""Kiln (bulgama) vault: a shallow brick cap that turns the 10 x 10 m box room into a domed chamber.
Origin = room centre at floor level. The cap springs at 2.2 m and peaks at 3.9 m; its rim reaches past
the room walls (hidden outside them), so from inside the walls end in pendentive arcs. Seen from below only.
A soot ring and a small vent mark the crown. No colliders (above head height)."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403
from quality import export_pbr_glb  # noqa: E402
import bmesh  # noqa: E402
import jjim_common as j  # noqa: E402

reset_scene()
SPRING, PEAK, RIM = 2.2, 3.9, 7.2  # rim radius > half-diagonal of the room (7.07)
RISE = PEAK - SPRING
R = (RIM * RIM + RISE * RISE) / (2 * RISE)  # sphere radius of the cap
CY = PEAK - R  # sphere centre height
SEG, RINGS = 48, 10

bm = bmesh.new()
uv = bm.loops.layers.uv.new("UVMap")
top = math.asin(RIM / R)
rows = []
for r in range(RINGS + 1):
    a = top * r / RINGS  # 0 at crown
    ring = []
    for s in range(SEG):
        t = 2 * math.pi * s / SEG
        x, z, y = R * math.sin(a) * math.cos(t), R * math.sin(a) * math.sin(t), CY + R * math.cos(a)
        ring.append(bm.verts.new(j.P(x, y, z)))
    rows.append(ring)
for r in range(RINGS):
    for s in range(SEG):
        a, b = rows[r][s], rows[r][(s + 1) % SEG]
        c, d = rows[r + 1][(s + 1) % SEG], rows[r + 1][s]
        f = bm.faces.new((a, b, c, d)) if r else bm.faces.new((a, c, d))
        f.smooth = True
        for loop in f.loops:
            # planar from above, 1 UV unit = 1 m: brick courses read as concentric-ish rows
            loop[uv].uv = (loop.vert.co.x, loop.vert.co.y)
bmesh.ops.remove_doubles(bm, verts=rows[0], dist=1e-5)
bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
bmesh.ops.reverse_faces(bm, faces=bm.faces)  # face inward/down
me = bpy.data.meshes.new("KilnDome")
bm.to_mesh(me)
bm.free()
dome = bpy.data.objects.new("KilnDome", me)
bpy.context.collection.objects.link(dome)
me.materials.append(j.clay_brick())

# soot-dark crown ring and vent
soot = j.flat("Soot", (0.03, 0.028, 0.026), 0.95)
ring = j.torus("CrownRing", 0.55, 0.07, (0, PEAK - 0.06, 0), soot, axis="y")
vent = j.tcyl("Vent", 0.3, 0.05, (0, PEAK - 0.03, 0), soot, verts=20)
join_visual("KilnDome", [dome, ring, vent])
export_pbr_glb(out_path())
