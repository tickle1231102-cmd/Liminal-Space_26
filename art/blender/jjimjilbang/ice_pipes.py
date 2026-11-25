"""Frosted cooling coil for the ice-room wall: 4 m wide (x), rows from 0.5 to 1.9 m, 12 cm off the wall.
Origin = wall plane, floor level, coil centre; the coil stands on the +z side. No collider (hugs the wall)."""
import math, os, random, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403
from quality import finish, export_pbr_glb  # noqa: E402
import jjim_common as j  # noqa: E402
from jjim_common import P, tbox, tcol, tcyl, torus  # noqa: E402

reset_scene()
frost = j.flat("Frost", (0.88, 0.93, 0.96), 0.95)
steel = j.steel()
o = []
ROWS = 8
for r in range(ROWS):
    y = 0.5 + r * 0.2
    o.append(tcyl(f"Run{r}", 0.035, 4.0, (0, y, 0.09), frost, axis="x", verts=10))
    if r < ROWS - 1:
        side = 1 if r % 2 == 0 else -1
        o.append(tcyl(f"Bend{r}", 0.035, 0.2, (side * 2.0, y + 0.1, 0.09), frost, verts=10))
for x in (-1.5, 0, 1.5):
    o.append(tbox(f"Bracket{x}", (0.04, 1.6, 0.05), (x, 1.2, 0.03), steel))
o.append(tbox("Tray", (4.1, 0.03, 0.2), (0, 0.36, 0.1), steel))
finish(o, name="IcePipes", bevel_width=0, uv=False)
export_pbr_glb(out_path())
