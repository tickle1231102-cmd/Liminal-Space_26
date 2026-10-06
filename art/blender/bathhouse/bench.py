"""Dressing-room bench, 4 m long along X, 1.2 m deep, seat at 0.44 m. Hinoki slats on a dark frame."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403
from quality import finish, export_pbr_glb  # noqa: E402
from bath_common import *  # noqa: E402,F403

reset_scene()
dark, hin = wood("dark"), wood("hinoki")
o = []
n = 9
for i in range(n):
    z = -0.6 + (i + 0.5) * 1.2 / n
    o.append(tbox(f"Slat{i}", (4.0, 0.04, 1.2 / n - 0.02), (0, 0.42, z), hin))
for x in (-1.8, 0, 1.8):
    for z in (-0.5, 0.5):
        o.append(tbox(f"Leg{x}{z}", (0.08, 0.4, 0.08), (x, 0.2, z), dark))
    o.append(tbox(f"Rail{x}", (0.06, 0.06, 1.1), (x, 0.36, 0), dark))
for z in (-0.55, 0.55):
    o.append(tbox(f"Apron{z}", (3.9, 0.08, 0.04), (0, 0.36, z), dark))
tcol("Seat", (4.0, 0.44, 1.2), (0, 0.22, 0))
finish(o, name="Bench", bevel_width=0.006)
export_pbr_glb(out_path())
