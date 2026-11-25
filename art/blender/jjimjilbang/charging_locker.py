"""Phone charging locker, 1.4 m wide (x), 1.6 m high, 0.45 m deep, doors face +z.
Origin = footprint centre at floor level. 4 x 6 smoked doors; the runtime adds the blinking indicator lights."""
import math, os, random, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403
from quality import finish, export_pbr_glb  # noqa: E402
import jjim_common as j  # noqa: E402
from jjim_common import P, tbox, tcol, tcyl, torus  # noqa: E402

reset_scene()
W, Hh, Dp = 1.4, 1.6, 0.45
body = j.flat("LockerGrey", (0.5, 0.52, 0.53), 0.4)
smoke = j.flat("SmokedDoor", (0.08, 0.09, 0.1), 0.12)
o = [tbox("Body", (W, Hh, Dp - 0.02), (0, Hh / 2, -0.01), body)]
COLS, ROWS = 4, 6
cw, ch = (W - 0.08) / COLS, (Hh - 0.2) / ROWS
for r in range(ROWS):
    for c in range(COLS):
        x, y = -W / 2 + 0.04 + (c + 0.5) * cw, 0.12 + (r + 0.5) * ch
        o.append(tbox(f"Door{r}{c}", (cw - 0.02, ch - 0.02, 0.012), (x, y, Dp / 2 - 0.006), smoke))
        o.append(tbox(f"Key{r}{c}", (0.03, 0.04, 0.008), (x + cw / 2 - 0.04, y, Dp / 2 + 0.004), j.steel()))
tcol("Locker", (W, Hh, Dp), (0, Hh / 2, 0))
finish(o, name="ChargingLocker", bevel_width=0.004, uv=False)
export_pbr_glb(out_path())
