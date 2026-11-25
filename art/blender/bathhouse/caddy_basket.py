"""Plastic bath caddy (お風呂かご) 0.30 x 0.12 x 0.20 m with a carry handle, two shampoo bottles,
a soap box and a rolled towel. Pastel pink plastic with a lattice of slots. Origin = body center.
Runtime: BathProp kind 'caddy' (cuboid half 0.15 x 0.06 x 0.10, handle not collided)."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403
from quality import finish, export_pbr_glb  # noqa: E402
from bath_common import *  # noqa: E402,F403

reset_scene()
pl = material("CaddyPink", (0.93, 0.62, 0.66), roughness=0.35)
W, H, D, T = 0.30, 0.12, 0.20, 0.008
o = [tbox("Base", (W, T, D), (0, -H / 2 + T / 2, 0), pl)]
# slotted walls: posts + rails so it reads as a ventilated basket
for s in (-1, 1):
    o.append(tbox(f"RailX{s}", (W, 0.014, T), (0, H / 2 - 0.007, s * (D / 2 - T / 2)), pl))
    o.append(tbox(f"LowX{s}", (W, 0.02, T), (0, -H / 2 + 0.01, s * (D / 2 - T / 2)), pl))
    o.append(tbox(f"RailZ{s}", (T, 0.014, D), (s * (W / 2 - T / 2), H / 2 - 0.007, 0), pl))
    o.append(tbox(f"LowZ{s}", (T, 0.02, D), (s * (W / 2 - T / 2), -H / 2 + 0.01, 0), pl))
    for i in range(7):
        x = -W / 2 + 0.02 + i * (W - 0.04) / 6
        o.append(tbox(f"PostX{s}{i}", (0.012, H, T), (x, 0, s * (D / 2 - T / 2)), pl))
    for i in range(5):
        z = -D / 2 + 0.02 + i * (D - 0.04) / 4
        o.append(tbox(f"PostZ{s}{i}", (T, H, 0.012), (s * (W / 2 - T / 2), 0, z), pl))
# arched handle across the long side
for s in (-1, 1):
    o.append(tbox(f"HandleUp{s}", (0.014, 0.08, 0.02), (s * 0.06, H / 2 + 0.04, 0), pl))
o.append(tbox("HandleTop", (0.134, 0.016, 0.022), (0, H / 2 + 0.085, 0), pl))
# contents
bottles = (((0.95, 0.95, 0.9), "BottleWhite"), ((0.55, 0.75, 0.6), "BottleGreen"))
for k, (c, n) in enumerate(bottles):
    m = enamel(c, n)
    x = -0.09 + k * 0.06
    o.append(tcyl(f"Bottle{k}", 0.024, 0.16, (x, -H / 2 + 0.008 + 0.08, -0.04), m, verts=14))
    o.append(tcyl(f"Cap{k}", 0.014, 0.025, (x, -H / 2 + 0.008 + 0.172, -0.04), enamel((0.3, 0.3, 0.32), "CapGrey"), verts=12))
o.append(tbox("SoapBox", (0.09, 0.035, 0.06), (0.08, -H / 2 + 0.026, -0.05), enamel((0.6, 0.8, 0.9), "SoapBlue")))
o.append(tcyl("Towel", 0.03, 0.13, (0.05, -H / 2 + 0.038, 0.05), enamel((0.97, 0.95, 0.9), "TowelWhite"), axis="x", verts=14))
finish(o, name="CaddyBasket", bevel_width=0.002)
export_pbr_glb(out_path())
