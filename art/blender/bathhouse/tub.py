"""Walk-in main tub, 14 x 7 m opening, 0.6 m deep. Origin = opening center at floor level.
Runtime (BathHallZone TUB) owns the colliders: floor at -0.6, edge walls, ramp at local x 0.8..3.2."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403
from quality import finish, export_pbr_glb  # noqa: E402
from bath_common import *  # noqa: E402,F403

reset_scene()
W, D, DEP = 14.0, 7.0, 0.6
mos = tile_mosaic()
cap = granite()
o = []
o.append(tbox("Bottom", (W, 0.1, D), (0, -DEP - 0.05, 0), mos))
for s in (-1, 1):
    o.append(tbox(f"WallZ{s}", (W + 0.1, DEP, 0.1), (0, -DEP / 2, s * D / 2), mos))
    o.append(tbox(f"WallX{s}", (0.1, DEP, D), (s * W / 2, -DEP / 2, 0), mos))
    # rim cap on the surrounding floor
    o.append(tbox(f"CapZ{s}", (W + 0.44, 0.035, 0.22), (0, 0.0175, s * (D / 2 + 0.11)), cap))
    o.append(tbox(f"CapX{s}", (0.22, 0.035, D), (s * (W / 2 + 0.11), 0.0175, 0), cap))
# ramp: top from the front edge (z=+3.5, y=0) down to the tub floor at z=+1.1
o.append(wedge("Ramp", [(3.5, 0.0), (1.1, -DEP), (3.5, -DEP)], 0.8, 3.2, mos))
chr_ = chrome()
o.append(tcyl_between("Rail", 0.022, (0.85, 0.9, 3.4), (0.85, 0.3, 1.3), chr_))
o.append(tcyl("PostTop", 0.022, 0.9, (0.85, 0.45, 3.3), chr_))
o.append(tcyl("PostLow", 0.022, 0.75, (0.85, -0.075, 1.5), chr_))
# brass spout in the back wall, a little above the water line
br = brass()
o.append(tbox("SpoutPlate", (0.5, 0.4, 0.04), (-3, 0.25, -D / 2 + 0.07), br))
o.append(tcyl("Spout", 0.05, 0.35, (-3, 0.28, -D / 2 + 0.25), br, axis="z"))
finish(o, name="Tub", bevel_width=0.004)
export_pbr_glb(out_path())
