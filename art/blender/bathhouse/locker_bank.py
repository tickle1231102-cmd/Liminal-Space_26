"""Wooden locker bank 3.4 x 2.0 x 0.7 m, 8 x 4 doors with enamel number plates and brass keys
on wooden tags. One key is missing (narrative fragment, PRD 13). Faces +Z, origin floor center."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403
from quality import finish, export_pbr_glb  # noqa: E402
from bath_common import *  # noqa: E402,F403

reset_scene()
import random
rng = random.Random(4)
dark, light, br = wood("dark"), wood("light"), brass()
plate = enamel((0.9, 0.88, 0.82), "NumberPlate")
tag = wood("hinoki")
W, H, D = 3.4, 2.0, 0.7
COLS, ROWS = 8, 4
o = [tbox("Carcass", (W, H, D - 0.03), (0, H / 2, -0.015), dark)]
o.append(tbox("Crown", (W + 0.06, 0.06, D + 0.04), (0, H + 0.03, 0), dark))
dw, dh = (W - 0.1) / COLS, (H - 0.22) / ROWS
missing = rng.randrange(COLS * ROWS)
for r in range(ROWS):
    for c in range(COLS):
        x = -W / 2 + 0.05 + dw * (c + 0.5)
        y = 0.14 + dh * (r + 0.5)
        o.append(tbox(f"Door{r}{c}", (dw - 0.012, dh - 0.012, 0.025), (x, y, D / 2 - 0.02), light))
        o.append(tbox(f"Plate{r}{c}", (0.08, 0.05, 0.004), (x, y + dh * 0.3, D / 2 - 0.006), plate))
        o.append(tcyl(f"Lock{r}{c}", 0.014, 0.01, (x + dw * 0.32, y, D / 2 - 0.004), br, axis="z"))
        if r * COLS + c != missing:
            o.append(tbox(f"Tag{r}{c}", (0.035, 0.09, 0.008), (x + dw * 0.32, y - 0.06, D / 2 + 0.006), tag))
tcol("Bank", (W, H, D), (0, H / 2, 0))
finish(o, name="LockerBank", bevel_width=0.003)
export_pbr_glb(out_path())
