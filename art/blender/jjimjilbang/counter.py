"""Reception counter, 5 m long along x, 0.8 m deep, 1.1 m high. Customers stand on the +z side.
Origin = footprint centre at floor level. Folded sauna clothes (orange / pink) are stacked on top and a
key-bracelet board stands at one end with a single empty hook."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403
from quality import finish, export_pbr_glb  # noqa: E402
import jjim_common as j  # noqa: E402
from jjim_common import tbox, tcol, tcyl, torus  # noqa: E402

reset_scene()
L, Dp, Hh = 5.0, 0.8, 1.1
dark, light = j.wood("dark"), j.wood("light")
o = [
    tbox("Body", (L, Hh - 0.05, Dp - 0.1), (0, (Hh - 0.05) / 2, -0.05), dark),
    tbox("Top", (L + 0.08, 0.05, Dp + 0.06), (0, Hh - 0.025, 0), light),
    tbox("Kick", (L, 0.1, 0.02), (0, 0.05, Dp / 2 - 0.09), j.flat("KickBlack", (0.05, 0.05, 0.05), 0.5)),
]
# front panel battens
n = 16
for i in range(n):
    x = -L / 2 + (i + 0.5) * L / n
    o.append(tbox(f"Batten{i}", (0.04, Hh - 0.3, 0.02), (x, (Hh - 0.3) / 2 + 0.12, Dp / 2 - 0.04), light))

# folded clothes: two colours, stacks of different heights
orange = j.flat("ClothOrange", (0.8, 0.4, 0.12), 0.95)
pink = j.flat("ClothPink", (0.82, 0.5, 0.56), 0.95)
for x, mat, count in ((-1.9, orange, 6), (-1.35, orange, 4), (-0.7, pink, 6), (-0.15, pink, 5)):
    for k in range(count):
        o.append(tbox(f"Fold{x}{k}", (0.42 - 0.004 * (k % 2), 0.034, 0.3), (x, Hh + 0.02 + k * 0.036, -0.1), mat))

# key-bracelet board: 4 x 6 hooks, one empty
board_x = 1.7
o.append(tbox("Board", (0.9, 0.55, 0.03), (board_x, Hh + 0.3, -0.3), dark))
for s in (-1, 1):
    o.append(tbox(f"BoardLeg{s}", (0.03, 0.06, 0.2), (board_x + s * 0.4, Hh + 0.03, -0.3), dark))
band = j.flat("BandBlue", (0.12, 0.3, 0.5), 0.6)
for r in range(4):
    for c in range(6):
        hx, hy = board_x - 0.36 + c * 0.144, Hh + 0.5 - r * 0.12
        o.append(tcyl(f"Hook{r}{c}", 0.006, 0.03, (hx, hy, -0.275), j.brass(), axis="z", verts=6))
        if (r, c) == (2, 4):
            continue  # the one missing bracelet
        o.append(torus(f"Band{r}{c}", 0.028, 0.006, (hx, hy - 0.03, -0.268), band, axis="z"))

# desk bell and ledger
o.append(tcyl("Bell", 0.05, 0.03, (0.8, Hh + 0.015, 0.12), j.brass(), verts=16))
o.append(tbox("Ledger", (0.3, 0.02, 0.22), (0.3, Hh + 0.01, -0.05), j.flat("LedgerGreen", (0.1, 0.2, 0.14), 0.8)))
o.append(tbox("LedgerPage", (0.27, 0.004, 0.2), (0.3, Hh + 0.022, -0.05), j.flat("Paper", (0.85, 0.82, 0.72), 0.9)))

tcol("Counter", (L, Hh, Dp), (0, Hh / 2, 0))
finish(o, name="Counter", bevel_width=0.006)
export_pbr_glb(out_path())
