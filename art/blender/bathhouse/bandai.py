"""Bandai: the raised attendant's booth, straddling the men's / women's partition.
Faces +Z. Footprint 1.6 x 1.2 m, counter top at 1.21 m.

Runtime places it at world (-10, 0, 7.225) with rotationY = PI, so its local x = 0 plane lies exactly
on the partition line and the front (+Z) looks into both dressing rooms at once: local -X is the
men's side, local +X the women's side. Everything on the counter is mirrored per side:
  TrayM (-0.45, 1.225, 0.42) / TrayW (0.45, 1.225, 0.42)  cash trays, 0.3 x 0.03 x 0.2, top at y 1.24
                                                           (runtime drops leftover coins on them)
  abacus on the men's side, brass desk bell on the women's side, one ticket box per side.
A koshi lattice divider (dark wood, x = 0, y 1.21..2.28, z -0.62..0.62) stands on the counter right
under the partition lintel (underside 2.30); its slat gaps let the other room show through.
Nothing sits on the counter within |x| < 0.08. COL_Divider keeps players from climbing across.
"""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403
from quality import finish, export_pbr_glb  # noqa: E402
from bath_common import *  # noqa: E402,F403

reset_scene()
dark, light, br = wood("dark"), wood("light"), brass()
o = []
o.append(tbox("Base", (1.6, 1.15, 1.2), (0, 0.575, 0), dark))
# closes the slit between the base and the genkan wall so the rooms don't see each other under the counter
o.append(tbox("BackBoard", (1.6, 1.15, 0.05), (0, 0.575, -0.625), dark))
o.append(tbox("Plinth", (1.64, 0.08, 1.24), (0, 0.04, 0), enamel((0.08, 0.06, 0.05), "Plinth")))
o.append(tbox("Top", (1.8, 0.06, 1.4), (0, 1.18, 0.05), light))
for s in (-1, 1):
    o.append(tbox(f"Side{s}", (0.04, 0.45, 1.3), (s * 0.86, 1.43, 0.0), light))
o.append(tbox("Back", (1.76, 0.45, 0.04), (0, 1.43, -0.63), light))
# front panels, one per side: the partition wall (0.25 thick) butts against the front at x = 0
for s in (-1, 1):
    o.append(tbox(f"Panel{s}", (0.54, 0.8, 0.02), (s * 0.46, 0.62, 0.61), light))



def one_board(obj, lane, plank=0.125):
    """UVs that fit the whole piece inside one plank of the wood texture: a single board, grain along x."""
    bpy.context.view_layer.update()
    me = obj.data
    uv = me.uv_layers.active or me.uv_layers.new(name="UVMap")
    co = [obj.matrix_world @ v.co for v in me.vertices]
    y0, y1 = min(p.y for p in co), max(p.y for p in co)
    for poly in me.polygons:
        for li in poly.loop_indices:
            p = co[me.loops[li].vertex_index]
            u = lane * plank + 0.012 + (p.y - y0) / (y1 - y0) * (plank - 0.024)
            uv.data[li].uv = (u, p.x + (p.z if abs(poly.normal.x) > 0.5 else 0.0))
    obj["keep_uv"] = True


# ---- counter items, mirrored per side (men -X, women +X) ----
for tag, s in (("M", -1), ("W", 1)):
    tray = tbox(f"Tray{tag}", (0.3, 0.03, 0.2), (s * 0.45, 1.225, 0.42), light)
    one_board(tray, lane=3 if s < 0 else 6)
    o.append(tray)
    o.append(tbox(f"Tickets{tag}", (0.18, 0.1, 0.14), (s * 0.72, 1.26, -0.32),
                  enamel((0.75, 0.68, 0.5), "TicketBox")))
# abacus (men's side): dark slab, brass rods, beads
AX, AZ = -0.45, 0.02
o.append(tbox("Abacus", (0.4, 0.03, 0.12), (AX, 1.225, AZ), dark))
# beam splits one "heaven" bead (+z) from four "earth" beads; a sum is left half-entered
o.append(tbox("AbacusBeam", (0.4, 0.012, 0.008), (AX, 1.246, AZ + 0.022), dark))
bead = enamel((0.16, 0.1, 0.06), "AbacusBead")
counted = (0, 2, 0, 4, 1, 0, 3, 0, 0)          # earth beads pushed up to the beam, per rod
for k in range(9):
    x = AX - 0.18 + k * 0.045
    o.append(tcyl(f"Rod{k}", 0.004, 0.11, (x, 1.245, AZ), br, axis="z", verts=8))
    up = k in (3, 6)                            # heaven bead lowered onto the beam
    # beads are 1.6 cm boxes, not cylinders: at this size the silhouette is the same for a tenth of the triangles
    o.append(tbox(f"Heaven{k}", (0.016, 0.016, 0.01), (x, 1.245, AZ + (0.033 if up else 0.048)), bead))
    for j in range(4):
        z = AZ + 0.011 - 0.0105 * j if j < counted[k] else AZ - 0.048 + 0.0105 * (3 - j)
        o.append(tbox(f"Earth{k}{j}", (0.016, 0.016, 0.01), (x, 1.245, z), bead))
# brass desk bell (women's side): base disc, dome, plunger
BX, BZ = 0.45, 0.02
o.append(tcyl("BellBase", 0.04, 0.012, (BX, 1.216, BZ), enamel((0.1, 0.08, 0.07), "BellBase"), verts=20))
bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=8, radius=0.034, location=P(BX, 1.222, BZ))
dome = bpy.context.active_object
dome.name = "BellDome"
dome.scale = (1, 1, 0.9)
bpy.ops.object.mode_set(mode="EDIT")
import bmesh  # noqa: E402
bm = bmesh.from_edit_mesh(dome.data)
bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < -1e-4], context="VERTS")
bmesh.update_edit_mesh(dome.data)
bpy.ops.object.mode_set(mode="OBJECT")
dome.data.materials.append(br)
o.append(dome)
o.append(tcyl("BellPin", 0.005, 0.03, (BX, 1.263, BZ), br, verts=8))
o.append(tcyl("BellKnob", 0.009, 0.006, (BX, 1.28, BZ), br, verts=12))

# ---- koshi lattice divider on the partition line (x = 0) ----
Y0, Y1 = 1.21, 2.28          # counter top .. just under the lintel (2.30)
ZE = 0.62                    # outer face of the end posts
H = Y1 - Y0
for s in (-1, 1):
    o.append(tbox(f"KoshiPost{s}", (0.04, H, 0.04), (0, (Y0 + Y1) / 2, s * (ZE - 0.02)), dark))
RAIL = 0.05
inner = 2 * (ZE - 0.04)      # span between the posts
o.append(tbox("KoshiTop", (0.04, RAIL, inner), (0, Y1 - RAIL / 2, 0), dark))
o.append(tbox("KoshiBottom", (0.04, RAIL, inner), (0, Y0 + RAIL / 2, 0), dark))
N = 12
pitch = inner / (N + 1)      # ~0.089 m, ~6 cm see-through gaps
slat_h = H - 2 * RAIL
for i in range(N):
    z = -inner / 2 + pitch * (i + 1)
    o.append(tbox(f"KoshiSlat{i}", (0.025, slat_h, 0.03), (0, (Y0 + Y1) / 2, z), dark))
# one thin horizontal kumiko bar threaded through the slats, high up, so it reads as koshi, not a fence
o.append(tbox("KoshiNuki", (0.034, 0.022, inner), (0, Y1 - 0.3, 0), dark))

tcol("Booth", (1.8, 1.25, 1.4), (0, 0.625, 0.05))
tcol("Divider", (0.06, 1.07, 1.3), (0, 1.745, 0.0))
finish(o, name="Bandai", bevel_width=0.006)
export_pbr_glb(out_path())
