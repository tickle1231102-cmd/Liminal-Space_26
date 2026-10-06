"""Genkan shoe locker 3 x 1.9 x 0.8 m: 10 x 5 cubbies, each with a wooden key plate (geta-bako fuda).
Faces +Z, origin floor center."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403
from quality import finish, export_pbr_glb  # noqa: E402
from bath_common import *  # noqa: E402,F403

reset_scene()
dark, hin, ink = wood("dark"), wood("hinoki"), enamel((0.05, 0.05, 0.06), "Ink")
W, H, D = 3.0, 1.9, 0.8
COLS, ROWS = 10, 5
o = [tbox("Carcass", (W, H, D - 0.03), (0, H / 2, -0.015), dark)]
cw, ch = (W - 0.08) / COLS, (H - 0.3) / ROWS
for r in range(ROWS):
    for c in range(COLS):
        x = -W / 2 + 0.04 + cw * (c + 0.5)
        y = 0.15 + ch * (r + 0.5)
        o.append(tbox(f"Door{r}{c}", (cw - 0.01, ch - 0.01, 0.02), (x, y, D / 2 - 0.02), dark))
        o.append(tbox(f"Fuda{r}{c}", (0.05, 0.15, 0.012), (x, y, D / 2 - 0.002), hin))
        o.append(tbox(f"Mark{r}{c}", (0.03, 0.006, 0.002), (x, y + 0.03 * ((r + c) % 3 - 1), D / 2 + 0.005), ink))
tcol("Locker", (W, H, D), (0, H / 2, 0))
finish(o, name="ShoeLocker", bevel_width=0.003)
export_pbr_glb(out_path())
