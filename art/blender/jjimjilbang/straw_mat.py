"""Straw sack cushion (gamani) for the kiln floor, 0.6 x 0.04 x 0.6 m. Origin = centre."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403
from quality import finish, export_pbr_glb  # noqa: E402
import jjim_common as j  # noqa: E402
from jjim_common import P, tbox, tcyl, torus  # noqa: E402

reset_scene()
straw = j.flat("Straw", (0.62, 0.5, 0.28), 0.95)
dark = j.flat("StrawDark", (0.45, 0.35, 0.18), 0.95)
o = [tbox("Pad", (0.6, 0.034, 0.6), (0, 0, 0), straw)]
for i in range(6):
    o.append(tbox(f"Weave{i}", (0.6, 0.004, 0.025), (0, 0.019, -0.25 + i * 0.1), dark))
finish(o, name="StrawMat", bevel_width=0.006, uv=False)
export_pbr_glb(out_path())
