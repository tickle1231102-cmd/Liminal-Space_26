"""Women's dressing-room vanity (化粧台), Showa-era sento: one 2.4 m unit with two seats.
Cream laminate counter with a dark edge, wooden pedestals with small drawers either side of each
open knee recess, a wooden backboard up to 2.1 m with two chrome-framed mirrors, a bare
fluorescent tube under a cream hood above each mirror (emissive; runtime adds no light), and per
seat a pastel hand dryer hanging on a hook beside its mirror under a coin-op timer box, plus
lotion bottles, a comb and a cotton-swab box on the counter.
Footprint 2.4 x 0.5 m, back face at z=-0.25 against the wall. Faces +Z, origin = floor centre.
Everything stays inside x in [-1.2, 1.2] so units placed 2.4 m apart tile into one long counter
(the end pedestals of two neighbours join into a pedestal as wide as the middle one)."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403
from quality import finish, export_pbr_glb, box_uv  # noqa: E402
from bath_common import *  # noqa: E402,F403

reset_scene()
light, hinoki = wood("light"), wood("hinoki")
dark = material("VanityEdge", (0.1, 0.05, 0.025), roughness=0.28)   # lacquered trim: no plank seams on thin bands
chr_, br = chrome(), brass()
cream = enamel((0.82, 0.74, 0.56), "VanityCream")
pink = enamel((0.84, 0.43, 0.48), "VanityPink")
blue = enamel((0.36, 0.58, 0.72), "VanityBlue")
amber = material("VanityAmber", (0.28, 0.1, 0.025), roughness=0.15)
black = material("VanityDark", (0.05, 0.05, 0.05), roughness=0.5)
red = enamel((0.72, 0.1, 0.08), "VanityRed")
mirror = material("VanityMirror", (0.85, 0.87, 0.88), roughness=0.06, metallic=1.0)
lamp = material("VanityLamp", (1, 1, 1), emission=(0.88, 0.94, 1.0), strength=2.5)

W, D = 2.4, 0.5
ZB, ZF = -D / 2, D / 2          # back (wall) / front
CT = 0.75                       # counter top
UB = 0.715                      # underside of the counter slab
KICK = 0.08
FC = 0.21                       # front face of the pedestal carcass
SEATS = (-0.6, 0.6)
o = []


def rot_y(obj, deg):
    """Rotate about the Three y axis (= Blender z)."""
    obj.rotation_euler[2] = math.radians(deg)
    return obj


# ---- counter ----
o.append(tbox("Top", (W, CT - UB, 0.488), (0, (CT + UB) / 2, ZB + 0.244), cream))
o.append(tbox("Edge", (W, 0.045, 0.012), (0, CT - 0.0225, ZF - 0.006), dark))

# ---- pedestals: half-width at each end (neighbours complete them), full width in the middle ----
for name, x0, x1 in (("L", -1.2, -0.95), ("M", -0.25, 0.25), ("R", 0.95, 1.2)):
    cx, w = (x0 + x1) / 2, x1 - x0
    o.append(tbox(f"Ped{name}", (w, UB - KICK, FC - ZB), (cx, (UB + KICK) / 2, (FC + ZB) / 2), light))
    o.append(tbox(f"Kick{name}", (w, KICK, FC - 0.03 - ZB), (cx, KICK / 2, (FC - 0.03 + ZB) / 2), dark))
# drawer columns, 0.25 wide: one on each side of every knee recess
for c, x0 in enumerate((-1.2, -0.25, 0.0, 0.95)):
    cx = x0 + 0.125
    for r in range(3):
        y = 0.1 + 0.2 * r + 0.1
        o.append(tbox(f"Drawer{c}{r}", (0.234, 0.188, 0.018), (cx, y, FC + 0.009), hinoki))
        o.append(tbox(f"Pull{c}{r}", (0.07, 0.012, 0.012), (cx, y + 0.05, FC + 0.024), br))
# knee recesses: modesty panel at the back, apron rail with a shallow drawer under the counter
for i, sx in enumerate(SEATS):
    o.append(tbox(f"Modesty{i}", (0.7, UB - KICK, 0.02), (sx, (UB + KICK) / 2, ZB + 0.01), light))
    o.append(tbox(f"Apron{i}", (0.7, 0.06, 0.02), (sx, UB - 0.03, FC - 0.01), light))
    o.append(tbox(f"Tray{i}", (0.42, 0.046, 0.012), (sx, UB - 0.03, FC + 0.006), hinoki))
    o.append(tbox(f"TrayPull{i}", (0.08, 0.01, 0.01), (sx, UB - 0.03, FC + 0.017), br))

# ---- backboard: counter to 2.1 m, 4 cm thick at the back ----
ZW = ZB + 0.04                  # backboard front face
back = tbox("Backboard", (W, 2.1 - CT, 0.04), (0, (2.1 + CT) / 2, ZB + 0.02), light)
# 1.2 m UV period: planks become 15 cm and a plank seam lands exactly on each 2.4 m unit joint
bpy.context.view_layer.update()
box_uv(back, period=1.2)
back["keep_uv"] = True
o.append(back)
o.append(tbox("Splash", (W, 0.03, 0.014), (0, CT + 0.015, ZW + 0.007), dark))
o.append(tbox("Cap", (W, 0.03, 0.07), (0, 2.085, ZB + 0.035), dark))

for i, sx in enumerate(SEATS):
    # mirror: glass 0.92 x 0.91 m inside a 2 cm chrome frame (0.96 x 0.95 overall, y 0.95-1.9)
    my = (0.95 + 1.9) / 2
    o.append(tbox(f"Mirror{i}", (0.92, 0.91, 0.006), (sx, my, ZW + 0.005), mirror))
    for s in (-1, 1):
        o.append(tbox(f"FrameH{i}{s}", (0.96, 0.02, 0.014), (sx, my + s * 0.465, ZW + 0.007), chr_))
        o.append(tbox(f"FrameV{i}{s}", (0.02, 0.91, 0.014), (sx + s * 0.47, my, ZW + 0.007), chr_))

    # fluorescent tube under a cream hood above the mirror
    o.append(tbox(f"Hood{i}", (0.94, 0.012, 0.11), (sx, 2.034, ZW + 0.055), cream))
    o.append(tbox(f"HoodLip{i}", (0.94, 0.024, 0.008), (sx, 2.02, ZW + 0.106), cream))
    o.append(tcyl(f"Tube{i}", 0.013, 0.86, (sx, 1.995, ZW + 0.06), lamp, axis="x", verts=12))
    for s in (-1, 1):
        o.append(tbox(f"Socket{i}{s}", (0.03, 0.045, 0.04), (sx + s * 0.445, 2.0, ZW + 0.06), cream))
        o.append(tbox(f"Bracket{i}{s}", (0.02, 0.012, 0.06), (sx + s * 0.445, 2.0, ZW + 0.03), cream))

    # ---- hand dryer on a hook at the left of its mirror, coin timer box above ----
    xd = sx - 0.6 + 0.06
    o.append(tbox(f"CoinBox{i}", (0.09, 0.13, 0.05), (xd, 1.82, ZW + 0.025), cream))
    o.append(tbox(f"CoinPlate{i}", (0.056, 0.034, 0.004), (xd, 1.852, ZW + 0.052), br))
    o.append(tbox(f"CoinSlot{i}", (0.03, 0.005, 0.003), (xd, 1.852, ZW + 0.0545), black))
    o.append(tcyl(f"Button{i}", 0.011, 0.01, (xd, 1.792, ZW + 0.055), red, axis="z", verts=12))
    o.append(tcyl(f"Cord{i}", 0.004, 0.09, (xd + 0.02, 1.71, ZW + 0.03), black, verts=8))
    o.append(tcyl(f"Hook{i}", 0.006, 0.05, (xd, 1.672, ZW + 0.025), chr_, axis="z", verts=8))
    o.append(tcyl(f"HookTip{i}", 0.006, 0.022, (xd, 1.683, ZW + 0.05), chr_, verts=8))
    zh = ZW + 0.045             # handle plane, hangs from the hook
    o.append(torus(f"Loop{i}", 0.012, 0.004, (xd, 1.668, zh), cream, axis="z"))
    o.append(tbox(f"Handle{i}", (0.03, 0.115, 0.036), (xd, 1.6, zh), cream))
    o.append(tbox(f"Switch{i}", (0.012, 0.03, 0.006), (xd, 1.6, zh + 0.02), pink))
    o.append(tcyl(f"Body{i}", 0.042, 0.13, (xd, 1.5, zh + 0.03), pink, axis="z", verts=16))
    o.append(tcyl(f"Vent{i}", 0.034, 0.006, (xd, 1.5, zh - 0.036), black, axis="z", verts=16))
    o.append(tcyl(f"Nozzle{i}", 0.025, 0.07, (xd, 1.5, zh + 0.13), cream, axis="z", verts=14))
    o.append(tcyl(f"NozzleTip{i}", 0.02, 0.004, (xd, 1.5, zh + 0.166), black, axis="z", verts=14))
    o.append(tcyl_between(f"CordDrop{i}", 0.004, (xd + 0.02, 1.665, ZW + 0.03), (xd + 0.008, 1.652, zh), black, verts=8))

    # ---- counter items: bottles on the far side from the dryer, comb and swabs vary per seat ----
    bx = sx + 0.3
    for k, (dx, dz, r, h, body, cap) in enumerate((
            (0.0, -0.17, 0.028, 0.17, pink, cream),
            (0.065, -0.165, 0.024, 0.13, cream, br),
            (0.03, -0.105, 0.022, 0.15, amber, cream))[: 3 - i]):
        x = bx + dx
        o.append(tcyl(f"Bottle{i}{k}", r, h, (x, CT + h / 2, dz), body, verts=14))
        o.append(tcyl(f"Neck{i}{k}", r * 0.45, 0.015, (x, CT + h + 0.0075, dz), body, verts=10))
        o.append(tcyl(f"BCap{i}{k}", r * 0.6, 0.028, (x, CT + h + 0.029, dz), cap, verts=12))
    # comb lying a little askew
    cx, cz, ang = (sx + 0.05, 0.03, 14) if i == 0 else (sx - 0.12, 0.05, -9)
    comb = [tbox(f"CombSpine{i}", (0.17, 0.008, 0.012), (0, CT + 0.004, -0.012), amber)]
    for t in range(14):
        comb.append(tbox(f"CombTooth{i}{t}", (0.005, 0.005, 0.024), (-0.078 + t * 0.012, CT + 0.0025, 0.006), amber))
    a = math.radians(ang)
    for c_ in comb:
        # rotate about the comb centre (Blender z = Three y), then move into place (Blender y = -Three z)
        p = c_.location.copy()
        c_.location = (p.x * math.cos(a) - p.y * math.sin(a) + cx, p.x * math.sin(a) + p.y * math.cos(a) - cz, p.z)
        rot_y(c_, ang)
    o += comb
    # cotton-swab box with a few swabs poking out
    sbx, sbz = (sx + 0.1, -0.16) if i == 0 else (sx - 0.3, -0.14)
    o.append(tbox(f"SwabBox{i}", (0.07, 0.05, 0.045), (sbx, CT + 0.025, sbz), blue))
    o.append(tbox(f"SwabLid{i}", (0.072, 0.008, 0.047), (sbx, CT + 0.054, sbz), cream))
    for j, (dx, lean) in enumerate(((-0.015, -0.01), (0.0, 0.004), (0.016, 0.012))):
        a0 = (sbx + dx, CT + 0.04, sbz)
        b0 = (sbx + dx + lean, CT + 0.085, sbz + 0.006)
        o.append(tcyl_between(f"Swab{i}{j}", 0.0016, a0, b0, cream, verts=6))
        o.append(tcyl_between(f"SwabTip{i}{j}", 0.0035, b0, (b0[0] + lean * 0.12, b0[1] + 0.01, b0[2]), cream, verts=8))

# ---- colliders ----
tcol("Counter", (W, 0.78, D), (0, 0.39, 0))
tcol("Backboard", (W, 2.1, 0.06), (0, 1.05, ZB + 0.03))
finish(o, name="VanityMirror", bevel_width=0.003)
export_pbr_glb(out_path())
