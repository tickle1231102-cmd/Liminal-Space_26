"""Sikhye (sweet rice drink) can, 6.6 cm across, 12 cm tall, upright along y. Origin = centre.
Cream body with a brown band — no lettering."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403
from quality import finish, export_pbr_glb  # noqa: E402
import jjim_common as j  # noqa: E402
from jjim_common import P, tbox, tcyl, torus  # noqa: E402

reset_scene()
body = j.flat("CanCream", (0.9, 0.86, 0.72), 0.35)
band = j.flat("CanBand", (0.45, 0.27, 0.12), 0.35)
o = [
    tcyl("Body", 0.033, 0.116, (0, 0, 0), body, verts=20),
    tcyl("Band", 0.0335, 0.04, (0, -0.01, 0), band, verts=20),
    tcyl("Top", 0.031, 0.004, (0, 0.058, 0), j.steel(), verts=20),
    tcyl("Bottom", 0.031, 0.004, (0, -0.058, 0), j.steel(), verts=20),
]
finish(o, name="SikhyeCan", bevel_width=0, uv=False)
export_pbr_glb(out_path())
