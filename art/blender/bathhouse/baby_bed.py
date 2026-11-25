"""Baby bed (ベビーベッド): the infant changing bed of a women's sento dressing room.
Faces +Z, origin = floor centre, footprint exactly 1.0 (x) x 0.6 (z), top rail just under 1.0 m.

Cream enamel steel tray on four tube legs with small casters (one caster has swung a little off
line), a lower shelf at 0.25 m holding a rattan basket and two folded towels, and a three-panel
pale mint vinyl pad on the platform (platform top y 0.80, pad top y 0.865). Low spindle railings
(~0.18 m above the platform) close the back and both short ends; the front (+Z) has only a low lip
rail, so it reads as a changing table. A small folded hand towel lies on the pad, slightly askew,
as if someone left it there.
"""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403
from quality import finish, export_pbr_glb, bevel  # noqa: E402
from bath_common import *  # noqa: E402,F403
from mathutils import Matrix, Vector  # noqa: E402

reset_scene()
frame = enamel((0.8, 0.77, 0.68), "BabyBedFrame")
pad = material("BabyPadVinyl", (0.46, 0.72, 0.6), roughness=0.3)
rubber = material("CasterRubber", (0.08, 0.08, 0.085), roughness=0.75)
towel_w = material("BabyTowelWhite", (0.9, 0.88, 0.83), roughness=0.92)
towel_y = material("BabyTowelYellow", (0.93, 0.84, 0.58), roughness=0.92)
stripe = material("BabyTowelStripe", (0.45, 0.62, 0.78), roughness=0.9)
rattan = wood("hinoki")
steel = chrome()
o = []


def soft(obj, width, segments=3):
    """Round a soft part (pad, towel) beyond finish()'s small bevel; applied right away."""
    bpy.ops.object.select_all(action="DESELECT")
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    bevel(obj, width=width, segments=segments, angle_deg=30)
    for m in list(obj.modifiers):
        bpy.ops.object.modifier_apply(modifier=m.name)
    return obj


def place(objs, at, yaw):
    """Rotate parts built around the local origin by `yaw` about Three y, then move them to `at`."""
    bpy.context.view_layer.update()
    M = Matrix.Translation(Vector(P(*at))) @ Matrix.Rotation(yaw, 4, "Z")
    for ob in objs:
        ob.matrix_world = M @ ob.matrix_world


W, D = 1.0, 0.6            # footprint
TOP = 0.80                 # platform top
LX, LZ = 0.468, 0.266      # leg / post centres
PR = 0.016                 # post tube radius
RAIL_Y = 0.98              # top rail centre (top of rail ~0.992, caps ~0.996)
FRONT_Y = 0.885            # low front lip rail
LEG_Y0 = 0.075             # post bottom, on the caster stem

# ---- tray: skirt band + board ----
SK_T, SK_Y0, SK_Y1 = 0.02, 0.72, 0.81
sk_h, sk_c = SK_Y1 - SK_Y0, (SK_Y0 + SK_Y1) / 2
for s in (-1, 1):
    o.append(tbox(f"SkirtZ{s}", (W, sk_h, SK_T), (0, sk_c, s * (D / 2 - SK_T / 2)), frame))
    o.append(tbox(f"SkirtX{s}", (SK_T, sk_h, D - 2 * SK_T), (s * (W / 2 - SK_T / 2), sk_c, 0), frame))
o.append(tbox("Board", (W - 2 * SK_T, 0.03, D - 2 * SK_T), (0, TOP - 0.015, 0), frame))
# rolled rim along the top of the skirt (tube centred on the skirt wall, so it stays inside the footprint)
RIM = SK_T / 2
for s in (-1, 1):
    o.append(tcyl_between(f"RimZ{s}", RIM, (-W / 2 + RIM, SK_Y1, s * (D / 2 - RIM)), (W / 2 - RIM, SK_Y1, s * (D / 2 - RIM)), frame, verts=12))
    o.append(tcyl_between(f"RimX{s}", RIM, (s * (W / 2 - RIM), SK_Y1, -D / 2 + RIM), (s * (W / 2 - RIM), SK_Y1, D / 2 - RIM), frame, verts=12))
    for t in (-1, 1):
        o.append(sphere(f"RimCorner{s}{t}", RIM, P(s * (W / 2 - RIM), SK_Y1, t * (D / 2 - RIM)), frame, segments=12))
o.append(tbox("UnderBrace", (W - 2 * SK_T, 0.03, 0.04), (0, SK_Y0 + 0.015, 0), frame))

# ---- posts (floor caster to top rail), corner caps ----
for sx in (-1, 1):
    for sz in (-1, 1):
        x, z = sx * LX, sz * LZ
        o.append(tcyl(f"Post{sx}{sz}", PR, RAIL_Y - LEG_Y0, (x, (LEG_Y0 + RAIL_Y) / 2, z), frame, verts=16))
        o.append(sphere(f"Cap{sx}{sz}", 0.0165, P(x, RAIL_Y, z), frame, segments=12))
        # foot collar where the caster stem enters the tube
        o.append(tcyl(f"Collar{sx}{sz}", PR + 0.003, 0.02, (x, LEG_Y0 + 0.01, z), frame, verts=16))

# ---- railings: back + both ends with spindles, front only a low lip ----
RR = 0.012
o.append(tcyl_between("RailBack", RR, (-LX, RAIL_Y, -LZ), (LX, RAIL_Y, -LZ), frame, verts=16))
for sx in (-1, 1):
    o.append(tcyl_between(f"RailEnd{sx}", RR, (sx * LX, RAIL_Y, -LZ), (sx * LX, RAIL_Y, LZ), frame, verts=16))
o.append(tcyl_between("RailFront", 0.011, (-LX, FRONT_Y, LZ), (LX, FRONT_Y, LZ), frame, verts=16))
SR = 0.0075
for i in range(1, 11):     # back spindles, ~8.5 cm pitch
    x = -LX + i * (2 * LX) / 11
    o.append(tcyl_between(f"SpBack{i}", SR, (x, SK_Y1, -LZ), (x, RAIL_Y, -LZ), frame, verts=12))
for sx in (-1, 1):
    for i in range(1, 6):  # end spindles, 9 cm pitch
        z = -LZ + i * (2 * LZ) / 6
        o.append(tcyl_between(f"SpEnd{sx}{i}", SR, (sx * LX, SK_Y1, z), (sx * LX, RAIL_Y, z), frame, verts=12))

# ---- lower shelf at 0.25 with a tube rim ----
SH = 0.25
o.append(tbox("Shelf", (2 * LX - 0.01, 0.012, 2 * LZ - 0.01), (0, SH - 0.006, 0), frame))
for sz in (-1, 1):
    o.append(tcyl_between(f"ShelfRailX{sz}", 0.011, (-LX, SH + 0.012, sz * LZ), (LX, SH + 0.012, sz * LZ), frame, verts=12))
for sx in (-1, 1):
    o.append(tcyl_between(f"ShelfRailZ{sx}", 0.011, (sx * LX, SH + 0.012, -LZ), (sx * LX, SH + 0.012, LZ), frame, verts=12))

# ---- casters: swivel plate, fork, rubber wheel (wheel axis along x by default) ----
WR, WW = 0.03, 0.02


def caster(tag):
    parts = [
        tcyl(f"Stem{tag}", 0.009, 0.014, (0, 0.068, 0), steel, verts=12),
        tbox(f"Plate{tag}", (0.038, 0.006, 0.042), (0, 0.062, 0), steel),
        tcyl(f"Wheel{tag}", WR, WW, (0, WR, 0), rubber, axis="x", verts=16),
        tcyl(f"Hub{tag}", 0.012, WW + 0.004, (0, WR, 0), steel, axis="x", verts=12),
    ]
    for s in (-1, 1):
        parts.append(tbox(f"Fork{tag}{s}", (0.004, 0.034, 0.026), (s * 0.0135, 0.044, 0), steel))
    return parts


for sx in (-1, 1):
    for sz in (-1, 1):
        tag = f"{sx}{sz}"
        parts = caster(tag)
        # the back-right caster has swivelled ~35 degrees, the others sit square
        place(parts, (sx * LX, 0, sz * LZ), math.radians(35) if (sx, sz) == (1, -1) else 0.0)
        o.extend(parts)

# ---- three-panel vinyl pad on the platform ----
PAD_T, PAD_D = 0.065, 0.49
pw = 0.894 / 3
for i in range(3):
    x = -0.894 / 2 + pw * (i + 0.5)
    o.append(soft(tbox(f"Pad{i}", (pw - 0.003, PAD_T, PAD_D), (x, TOP + PAD_T / 2, 0), pad), 0.022))
PAD_TOP = TOP + PAD_T

# ---- small folded hand towel left on the pad, askew ----
tw = []
L, Dt, T = 0.26, 0.165, 0.012
tw.append(soft(tbox("TowelLow", (L, T, Dt), (0.004, T / 2, 0.003), towel_w), 0.005, 2))
tw.append(soft(tbox("TowelTop", (L - 0.008, T, Dt - 0.004), (0, T * 1.5, 0), towel_w), 0.005, 2))
for s in (-1, 1):   # woven border band near each short end, on the top face
    tw.append(tbox(f"TowelBand{s}", (0.018, 0.001, Dt - 0.02), (s * (L / 2 - 0.035), 2 * T + 0.0004, 0), stripe))
place(tw, (0.16, PAD_TOP - 0.001, 0.035), math.radians(-14))
o.extend(tw)

# ---- lower shelf contents: rattan basket (left), folded towel stack (right) ----
BX, BW, BH, BD = -0.2, 0.3, 0.12, 0.22
base_y = SH
o.append(tbox("BasketBase", (BW, 0.012, BD), (BX, base_y + 0.006, 0), rattan))
for s in (-1, 1):
    o.append(tbox(f"BasketSideX{s}", (0.012, BH, BD), (BX + s * (BW / 2 - 0.006), base_y + BH / 2, 0), rattan))
    o.append(tbox(f"BasketSideZ{s}", (BW, BH, 0.012), (BX, base_y + BH / 2, s * (BD / 2 - 0.006)), rattan))
    o.append(tcyl(f"BasketRimZ{s}", 0.008, BW + 0.01, (BX, base_y + BH, s * (BD / 2 - 0.006)), rattan, axis="x", verts=12))
    o.append(tcyl(f"BasketRimX{s}", 0.008, BD, (BX + s * (BW / 2 - 0.006), base_y + BH, 0), rattan, axis="z", verts=12))
o.append(soft(tbox("BasketCloth", (BW - 0.04, 0.05, BD - 0.04), (BX, base_y + 0.012 + 0.025, 0), towel_y), 0.008, 2))
o.append(tcyl("BasketRoll", 0.028, BD - 0.05, (BX + 0.06, base_y + 0.062 + 0.026, 0), towel_w, axis="z", verts=16))

stack = [
    soft(tbox("ShelfTowel0", (0.26, 0.034, 0.19), (0, 0.017, 0), towel_w), 0.008, 2),
    soft(tbox("ShelfTowel1", (0.25, 0.034, 0.185), (0.004, 0.051, -0.004), towel_y), 0.008, 2),
]
place(stack, (0.22, SH, 0.0), math.radians(4))
o.extend(stack)

tcol("BabyBed", (1.0, 1.0, 0.6), (0, 0.5, 0))
finish(o, name="BabyBed", bevel_width=0.004)
export_pbr_glb(out_path())
