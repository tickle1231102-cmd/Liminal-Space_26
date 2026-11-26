"""Shoe-locker module: 1 m wide (x), 2 m high, 0.4 m deep, doors face +z. 5 x 8 small numbered doors.
Origin = footprint centre at floor level. A key hangs in a door only when the cell is empty — almost
every key is gone (the lockers are nearly full, yet nobody is here)."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403
from quality import finish, export_pbr_glb  # noqa: E402
import jjim_common as j  # noqa: E402
from jjim_common import tbox, tcol  # noqa: E402

reset_scene()
W, Hh, Dp = 1.0, 2.0, 0.4
COLS, ROWS = 5, 8
dark, light = j.wood("dark"), j.wood("light")
o = [
    tbox("Carcass", (W, Hh, Dp - 0.02), (0, Hh / 2, -0.01), dark),
    tbox("Plinth", (W, 0.08, Dp), (0, 0.04, 0), j.flat("PlinthBlack", (0.05, 0.05, 0.05), 0.5)),
]
cw, ch = (W - 0.04) / COLS, (Hh - 0.12) / ROWS
plate = j.flat("NumberPlate", (0.86, 0.83, 0.74), 0.6)
KEYS = {(1, 3), (6, 0), (4, 4)}  # (row, col) with a key still in the door
for r in range(ROWS):
    for c in range(COLS):
        x = -W / 2 + 0.02 + (c + 0.5) * cw
        y = 0.1 + (r + 0.5) * ch
        o.append(tbox(f"Door{r}{c}", (cw - 0.012, ch - 0.012, 0.018), (x, y, Dp / 2 - 0.009), light))
        o.append(tbox(f"Plate{r}{c}", (0.05, 0.028, 0.004), (x, y + ch / 2 - 0.035, Dp / 2 + 0.002), plate))
        o.append(tbox(f"Lock{r}{c}", (0.022, 0.03, 0.006), (x + cw / 2 - 0.03, y, Dp / 2 + 0.003), j.steel()))
        if (r, c) in KEYS:
            o.append(tbox(f"Key{r}{c}", (0.012, 0.02, 0.02), (x + cw / 2 - 0.03, y, Dp / 2 + 0.016), j.brass()))
            o.append(tbox(f"Tag{r}{c}", (0.03, 0.05, 0.004), (x + cw / 2 - 0.03, y - 0.04, Dp / 2 + 0.02), j.flat("TagOrange", (0.85, 0.42, 0.1), 0.6)))
tcol("Locker", (W, Hh, Dp), (0, Hh / 2, 0))
finish(o, name="ShoeLocker", bevel_width=0.004)
export_pbr_glb(out_path())
