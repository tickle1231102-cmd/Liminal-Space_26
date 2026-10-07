"""Rattan clothes basket 0.45 x 0.22 x 0.32 m; some hold a folded yukata. Origin = body center."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403
from quality import finish, export_pbr_glb  # noqa: E402
from bath_common import *  # noqa: E402,F403

reset_scene()
rat = wood("hinoki")
yuk = enamel((0.2, 0.28, 0.45), "Yukata")
o = [tbox("Base", (0.45, 0.02, 0.32), (0, -0.1, 0), rat)]
for s in (-1, 1):
    o.append(tbox(f"SideX{s}", (0.02, 0.2, 0.32), (s * 0.215, 0, 0), rat))
    o.append(tbox(f"SideZ{s}", (0.45, 0.2, 0.02), (0, 0, s * 0.15), rat))
    o.append(tcyl(f"Rim{s}", 0.012, 0.45, (0, 0.1, s * 0.15), rat, axis="x", verts=8))
o.append(tbox("Yukata", (0.36, 0.08, 0.24), (0, -0.04, 0), yuk))
finish(o, name="Basket", bevel_width=0.004)
export_pbr_glb(out_path())
