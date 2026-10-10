"""Noren: indigo cotton curtain in three panels hanging from a wooden rod, with a brush-painted
white 'ゆ' across them. 3.0 m wide, 0.9 m drop. Origin = rod center (Three).
Panels have soft vertical folds that deepen toward the hem; each is its own node (Panel_0..2,
pivot at the top edge) so the runtime can sway them. No collider — the player walks through."""
import math, os, sys
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403
from quality import image_textures, pbr_material, export_pbr_glb  # noqa: E402
from bath_common import P, tcyl, wood, tbox  # noqa: E402

reset_scene()
W, DROP, N, GAP = 3.0, 0.9, 3, 0.012
PW = (W - GAP * (N - 1)) / N

# ---- texture: indigo cotton + brush 'ゆ' (image spans the whole curtain) ----
w, h = 1536, 460
ys, xs = np.mgrid[0:h, 0:w].astype(float)
u, v = xs / w, ys / h  # v = 0 top
rng = np.random.RandomState(4)
weave = 0.04 * np.sin(xs * 1.9) * np.sin(ys * 2.1) + 0.03 * rng.uniform(-1, 1, (h, w))
fade = 0.06 * np.sin(u * 7 + 1) * np.sin(v * 3)            # uneven dye
rgb = np.array([0.07, 0.11, 0.22])[None, None, :] * (1 + weave + fade)[..., None]

ink = np.zeros((h, w))
def stroke(pts, width, taper=True):
    """Brush stroke along a polyline (points in u,v), width in v-units; tapers at the end."""
    global ink
    pts = np.array(pts, float)
    # Catmull-Rom spline through the control points (ends duplicated) — smooth brush path
    q = np.vstack([pts[:1], pts, pts[-1:]])
    out = []
    for i in range(1, len(q) - 2):
        p0, p1, p2, p3 = q[i - 1], q[i], q[i + 1], q[i + 2]
        for tt in np.linspace(0, 1, 60, endpoint=False):
            out.append(0.5 * ((2 * p1) + (-p0 + p2) * tt + (2 * p0 - 5 * p1 + 4 * p2 - p3) * tt ** 2 + (-p0 + 3 * p1 - 3 * p2 + p3) * tt ** 3))
    out.append(q[-2])
    out = np.array(out)
    seg = out
    cu, cv = out[:, 0], out[:, 1]
    for k, (a, b) in enumerate(zip(cu, cv)):
        r = width * (1 - 0.6 * (k / len(seg)) ** 3 if taper else 1)
        d = ((u - a) * (w / h)) ** 2 + (v - b) ** 2
        ink = np.maximum(ink, np.clip(1 - (np.sqrt(d) - r) / 0.006, 0, 1))
# 'ゆ': left stem with a hook, big right bowl, centre stroke that drops and sweeps left
cx = 0.5
stroke([(cx - 0.12, 0.28), (cx - 0.125, 0.45), (cx - 0.12, 0.62), (cx - 0.1, 0.7), (cx - 0.08, 0.64)], 0.035)
bowl = [(cx - 0.08, 0.42)] + [(cx + 0.02 + 0.1 * math.cos(a), 0.47 + 0.17 * math.sin(a)) for a in np.linspace(-math.pi * 0.95, math.pi * 0.55, 14)]
stroke(bowl, 0.032)
stroke([(cx + 0.0, 0.18), (cx + 0.01, 0.4), (cx + 0.0, 0.62), (cx - 0.03, 0.78), (cx - 0.09, 0.86)], 0.034)
# dry-brush breakup
ink *= np.clip(0.85 + 0.25 * rng.uniform(-1, 1, (h, w)), 0, 1)
rgb = rgb * (1 - ink[..., None]) + np.array([0.9, 0.88, 0.82]) * ink[..., None]
# hem shadow band
rgb *= (1 - 0.25 * np.clip((v - 0.93) / 0.07, 0, 1))[..., None]
maps = image_textures("Noren", np.clip(rgb, 0, 1), gloss=0.9)
cloth = pbr_material("NorenCloth", maps)
cloth.use_backface_culling = False

# ---- geometry ----
rod = tcyl("Rod", 0.022, W + 0.16, (0, 0, 0), wood("dark"), axis="x", verts=16)
for s in (-1, 1):
    tcyl(f"RodEnd{s}", 0.03, 0.04, (s * (W / 2 + 0.08), 0, 0), wood("dark"), axis="x", verts=16)

for i in range(N):
    x0 = -W / 2 + i * (PW + GAP)
    pivot = empty(f"Panel_{i}", P(x0 + PW / 2, -0.03, 0))
    bpy.ops.mesh.primitive_grid_add(x_subdivisions=24, y_subdivisions=16, size=1, location=(0, 0, 0))
    g = bpy.context.active_object
    g.name = f"Cloth_{i}"
    me = g.data
    uv = me.uv_layers.active
    for vert in me.vertices:
        gx, gy = vert.co.x + 0.5, vert.co.y + 0.5          # 0..1 across, 0..1 bottom->top
        X = (gx - 0.5) * PW
        Y = -(1 - gy) * DROP                                # 0 at top, -DROP at hem
        depth = (1 - gy) ** 1.4                             # folds grow toward the hem
        Z = 0.035 * depth * math.sin(gx * math.pi * 5 + i * 1.7) + 0.012 * depth * math.sin(gx * math.pi * 11)
        Y += 0.02 * depth * math.sin(gx * math.pi * 3 + i)  # uneven hem
        vert.co = P(X, Y, Z)
    for poly in me.polygons:
        poly.use_smooth = True
        for li in poly.loop_indices:
            co = me.vertices[me.loops[li].vertex_index].co
            # map onto the shared image: U across the whole curtain, V down the drop
            uu = (x0 + PW / 2 + co.x + W / 2) / W
            vv = 1 + co.z / DROP    # Blender z = Three y (0 at top, -DROP at hem)
            uv.data[li].uv = (uu, vv)
    me.materials.append(cloth)
    sol = g.modifiers.new("Thick", "SOLIDIFY")
    sol.thickness = 0.004
    bpy.ops.object.modifier_apply(modifier="Thick")
    g.parent = pivot
    g.location = (0, 0, 0)

export_pbr_glb(out_path())
