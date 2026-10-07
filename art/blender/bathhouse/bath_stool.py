"""Low plastic bath stool, 30 cm seat at 24 cm (Kerorin-ish cream). Origin = body center."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403
from quality import finish, export_pbr_glb  # noqa: E402
from bath_common import *  # noqa: E402,F403

reset_scene()
pl = material("StoolCream", (0.86, 0.82, 0.7), roughness=0.35)
o = [tbox("Seat", (0.3, 0.035, 0.24), (0, 0.1, 0), pl)]
for s in (-1, 1):
    # two slab legs with a cut-out, splayed slightly
    o.append(tbox(f"Leg{s}", (0.03, 0.2, 0.22), (s * 0.12, -0.02, 0), pl))
    o.append(tbox(f"Foot{s}", (0.05, 0.02, 0.24), (s * 0.13, -0.11, 0), pl))
o.append(tbox("Brace", (0.22, 0.03, 0.02), (0, -0.04, 0), pl))
finish(o, name="Stool", bevel_width=0.008, uv=False)
export_pbr_glb(out_path())
