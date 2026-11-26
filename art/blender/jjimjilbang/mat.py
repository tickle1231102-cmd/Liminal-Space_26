"""Folding floor mat, 0.7 x 0.05 x 1.8 m in three hinged pads. Origin = centre (runtime: dynamic body).
The middle pad sits a little lower — pressed as if someone just got up."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403
from quality import finish, export_pbr_glb  # noqa: E402
import jjim_common as j  # noqa: E402
from jjim_common import P, tbox, tcyl, torus  # noqa: E402

reset_scene()
vinyl = j.flat("MatVinyl", (0.3, 0.36, 0.24), 0.75)
trim = j.flat("MatTrim", (0.16, 0.2, 0.13), 0.8)
o = []
for i, z in enumerate((-0.6, 0.0, 0.6)):
    dip = 0.008 if i == 1 else 0.0
    o.append(tbox(f"Pad{i}", (0.68, 0.045 - dip, 0.585), (0, -dip / 2, z), vinyl))
    o.append(tbox(f"Trim{i}", (0.7, 0.012, 0.6), (0, -0.019, z), trim))
finish(o, name="Mat", bevel_width=0.008, uv=False)
export_pbr_glb(out_path())
