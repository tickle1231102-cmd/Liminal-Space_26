"""Wooden pillow (mokchim), 0.3 x 0.1 x 0.16 m, with a shallow hollow for the head. Origin = centre."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403
from quality import finish, export_pbr_glb  # noqa: E402
import jjim_common as j  # noqa: E402
from jjim_common import P, tbox, tcyl, torus  # noqa: E402

reset_scene()
dark = j.wood("dark")
o = [tbox("Block", (0.3, 0.075, 0.16), (0, -0.0125, 0), dark)]
# raised ends leave a hollow in the middle
for s in (-1, 1):
    o.append(tbox(f"End{s}", (0.07, 0.025, 0.16), (s * 0.115, 0.0375, 0), dark))
finish(o, name="Mokchim", bevel_width=0.006)
export_pbr_glb(out_path())
