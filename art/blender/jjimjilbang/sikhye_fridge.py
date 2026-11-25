"""Glass-door drink fridge, 1.2 m wide (x), 2 m high, 0.8 m deep, door faces +z.
Origin = footprint centre at floor level. Lit inside and completely empty."""
import math, os, random, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403
from quality import finish, export_pbr_glb  # noqa: E402
import jjim_common as j  # noqa: E402
from jjim_common import P, tbox, tcol, tcyl, torus  # noqa: E402

reset_scene()
W, Hh, Dp, T = 1.2, 2.0, 0.8, 0.05
white = j.flat("FridgeWhite", (0.88, 0.9, 0.9), 0.35)
light = material("FridgeLight", (0.95, 0.98, 1.0), roughness=0.6, emission=(0.85, 0.95, 1.0), strength=2.5)
o = [
    tbox("Back", (W, Hh, T), (0, Hh / 2, -Dp / 2 + T / 2), white),
    tbox("Top", (W, 0.28, Dp), (0, Hh - 0.14, 0), white),
    tbox("Bottom", (W, 0.2, Dp), (0, 0.1, 0), white),
    tbox("Glow", (W - 2 * T, Hh - 0.5, 0.01), (0, Hh / 2 - 0.04, -Dp / 2 + T + 0.006), light),
    tbox("Header", (W - 0.06, 0.2, 0.01), (0, Hh - 0.14, Dp / 2 + 0.005), j.flat("HeaderBrown", (0.42, 0.25, 0.1), 0.5)),
]
for s in (-1, 1):
    o.append(tbox(f"Side{s}", (T, Hh, Dp), (s * (W - T) / 2, Hh / 2, 0), white))
    o.append(tbox(f"DoorStile{s}", (0.04, Hh - 0.5, 0.03), (s * (W / 2 - 0.07), Hh / 2 - 0.04, Dp / 2 - 0.015), j.steel()))
o.append(tbox("DoorMullion", (0.04, Hh - 0.5, 0.03), (0, Hh / 2 - 0.04, Dp / 2 - 0.015), j.steel()))
for k in range(4):
    o.append(tbox(f"Shelf{k}", (W - 2 * T, 0.012, Dp - 0.16), (0, 0.42 + k * 0.36, 0), j.steel()))
tcol("Fridge", (W, Hh, Dp), (0, Hh / 2, 0))
finish(o, name="SikhyeFridge", bevel_width=0.006, uv=False)
export_pbr_glb(out_path())
