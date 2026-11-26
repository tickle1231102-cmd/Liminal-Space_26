"""Sauna hourglass, 12 cm across, 28 cm tall. Origin = base centre.
The sand sits half-and-half and does not run — every hourglass in the salt room stopped at the same level."""
import math, os, random, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403
from quality import finish, export_pbr_glb  # noqa: E402
import jjim_common as j  # noqa: E402
from jjim_common import P, tbox, tcol, tcyl, torus  # noqa: E402

reset_scene()
wood = j.wood("dark")
glass = j.flat("HourGlass", (0.75, 0.82, 0.82), 0.06)
sand = j.flat("Sand", (0.8, 0.62, 0.4), 0.9)
o = [tcyl("Base", 0.06, 0.015, (0, 0.0075, 0), wood, verts=16), tcyl("Cap", 0.06, 0.015, (0, 0.2725, 0), wood, verts=16)]
for k in range(3):
    a = k * 2.094
    o.append(tcyl(f"Post{k}", 0.005, 0.25, (0.05 * math.cos(a), 0.14, 0.05 * math.sin(a)), wood, verts=6))
o.append(cone("Lower", 0.04, 0.006, 0.12, P(0, 0.075, 0), glass, verts=16))
o.append(cone("Upper", 0.006, 0.04, 0.12, P(0, 0.205, 0), glass, verts=16))
o.append(cone("SandLow", 0.041, 0.024, 0.06, P(0, 0.046, 0), sand, verts=16))
o.append(cone("SandUp", 0.024, 0.041, 0.06, P(0, 0.234, 0), sand, verts=16))
finish(o, name="Hourglass", bevel_width=0, uv=False)
export_pbr_glb(out_path())
