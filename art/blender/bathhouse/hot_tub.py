"""Raised hot tub (atsuyu), 5 x 5 m outside, rim 0.55 m — looked at, not entered.
Origin = footprint center at floor level. COL_ walls replace the runtime boxes."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403
from quality import finish, export_pbr_glb  # noqa: E402
from bath_common import *  # noqa: E402,F403

reset_scene()
W, RIM, T = 5.0, 0.55, 0.25
mos, blue, cap = tile_mosaic(), tile_blue(), granite()
o = [tbox("Floor", (W - 2 * T, 0.02, W - 2 * T), (0, 0.01, 0), mos)]
for s in (-1, 1):
    for axis in ("x", "z"):
        size = (W, RIM, T) if axis == "z" else (T, RIM, W - 2 * T)
        pos = (0, RIM / 2, s * (W - T) / 2) if axis == "z" else (s * (W - T) / 2, RIM / 2, 0)
        o.append(tbox(f"Wall{axis}{s}", size, pos, blue))
        tcol(f"Wall{axis}{s}", size, pos)
        csize = (W + 0.04, 0.04, T + 0.06) if axis == "z" else (T + 0.06, 0.04, W - 2 * T)
        o.append(tbox(f"Cap{axis}{s}", csize, (pos[0], RIM + 0.02, pos[2]), cap))
# inner mosaic lining
for s in (-1, 1):
    o.append(tbox(f"LineZ{s}", (W - 2 * T, RIM - 0.02, 0.01), (0, RIM / 2, s * (W / 2 - T - 0.005)), mos))
    o.append(tbox(f"LineX{s}", (0.01, RIM - 0.02, W - 2 * T), (s * (W / 2 - T - 0.005), RIM / 2, 0), mos))
br = brass()
o.append(tcyl("Pipe", 0.04, 1.4, (1.2, RIM + 0.7, -W / 2 + 0.12), br))
o.append(tcyl("Spout", 0.04, 0.5, (1.2, RIM + 1.38, -W / 2 + 0.36), br, axis="z"))
o.append(tcyl("Valve", 0.07, 0.03, (1.2, RIM + 0.9, -W / 2 + 0.2), enamel((0.6, 0.06, 0.05), "ValveRed"), axis="z"))
o.append(tbox("Sign", (0.6, 0.3, 0.02), (-1.2, RIM + 0.9, -W / 2 + 0.02), enamel((0.85, 0.82, 0.74), "SignCream")))
finish(o, name="HotTub", bevel_width=0.004)
export_pbr_glb(out_path())
