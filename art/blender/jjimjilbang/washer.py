"""Front-loading commercial washer, 0.9 m wide (x), 1.0 m high, 0.9 m deep, door faces +z.
Origin = footprint centre at floor level. The runtime spins the load behind the glass of the one that runs."""
import math, os, random, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403
from quality import finish, export_pbr_glb  # noqa: E402
import jjim_common as j  # noqa: E402
from jjim_common import P, tbox, tcol, tcyl, torus  # noqa: E402

reset_scene()
white = j.flat("WasherWhite", (0.86, 0.88, 0.88), 0.35)
o = [
    tbox("Body", (0.9, 1.0, 0.88), (0, 0.5, -0.01), white),
    tbox("Panel", (0.86, 0.14, 0.012), (0, 0.9, 0.436), j.flat("PanelGrey", (0.25, 0.26, 0.27), 0.4)),
    tcyl("Knob", 0.035, 0.03, (0.3, 0.9, 0.455), j.steel(), axis="z", verts=16),
    torus("DoorRing", 0.25, 0.03, (0, 0.46, 0.44), j.steel(), axis="z"),
    tcyl("DoorGlass", 0.235, 0.012, (0, 0.46, 0.436), j.flat("DoorGlass", (0.05, 0.06, 0.07), 0.08), axis="z", verts=28),
    tbox("Handle", (0.03, 0.12, 0.03), (0.27, 0.46, 0.47), j.steel()),
]
tcol("Washer", (0.9, 1.0, 0.9), (0, 0.5, 0))
finish(o, name="Washer", bevel_width=0.008, uv=False)
export_pbr_glb(out_path())
