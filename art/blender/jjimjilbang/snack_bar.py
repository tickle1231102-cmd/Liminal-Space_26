"""Snack bar counter, 7 m long (x), 0.9 m deep, 1.1 m high, customers on the +z side.
Origin = footprint centre at floor level. A basket piled with baked eggs, a stack of paper cups,
and a glass display case with nothing in it."""
import math, os, random, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403
from quality import finish, export_pbr_glb  # noqa: E402
import jjim_common as j  # noqa: E402
from jjim_common import P, tbox, tcol, tcyl, torus  # noqa: E402

reset_scene()
rng = random.Random(27)
dark, light = j.wood("dark"), j.wood("light")
L, Dp, Hh = 7.0, 0.9, 1.1
o = [
    tbox("Body", (L, Hh - 0.05, Dp - 0.1), (0, (Hh - 0.05) / 2, -0.05), dark),
    tbox("Top", (L + 0.08, 0.05, Dp + 0.06), (0, Hh - 0.025, 0), light),
    tbox("Kick", (L, 0.1, 0.02), (0, 0.05, Dp / 2 - 0.09), j.flat("KickBlack", (0.05, 0.05, 0.05), 0.5)),
]
# empty display case
glass = j.flat("CaseGlass", (0.55, 0.66, 0.68), 0.08)
cx = -2.4
o.append(tbox("CaseGlass", (1.5, 0.4, 0.5), (cx, Hh + 0.2, -0.05), glass))
for sx in (-1, 1):
    for sz in (-1, 1):
        o.append(tbox(f"CasePost{sx}{sz}", (0.025, 0.42, 0.025), (cx + sx * 0.75, Hh + 0.21, -0.05 + sz * 0.25), j.steel()))
o.append(tbox("CaseTop", (1.54, 0.02, 0.54), (cx, Hh + 0.41, -0.05), j.steel()))
# egg basket
wicker = j.flat("Wicker", (0.5, 0.36, 0.2), 0.9)
bx = 0.6
o.append(tbox("Basket", (0.5, 0.1, 0.36), (bx, Hh + 0.05, 0.05), wicker))
egg = j.flat("EggBrown", (0.5, 0.33, 0.2), 0.55)
for layer, n in ((0, 22), (1, 12), (2, 5)):
    for k in range(n):
        spread = 0.2 - layer * 0.06
        e = sphere(f"Egg{layer}{k}", 0.022, P(bx + rng.uniform(-spread, spread), Hh + 0.11 + layer * 0.035, 0.05 + rng.uniform(-spread * 0.7, spread * 0.7)), egg, segments=8)
        e.scale = (1.3, 1.0, 1.0)
        e.rotation_euler = (0, 0, rng.uniform(0, 3.14))
        o.append(e)
# paper cups
cup = j.flat("PaperCup", (0.92, 0.9, 0.84), 0.7)
for k in range(9):
    o.append(tcyl(f"Cup{k}", 0.035, 0.02, (2.0, Hh + 0.01 + k * 0.014, 0.1), cup, verts=12))
# till
o.append(tbox("Till", (0.4, 0.2, 0.36), (3.0, Hh + 0.1, -0.05), j.flat("TillGrey", (0.3, 0.3, 0.31), 0.5)))
tcol("SnackBar", (L, Hh, Dp), (0, Hh / 2, 0))
finish(o, name="SnackBar", bevel_width=0.006)
export_pbr_glb(out_path())
