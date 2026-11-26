"""Cypress (hinoki) ball for the foot channel, 10 cm. Origin = centre (runtime: ball collider, floats)."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403
from quality import finish, export_pbr_glb  # noqa: E402
import jjim_common as j  # noqa: E402
from jjim_common import P, tbox, tcyl, torus  # noqa: E402

reset_scene()
wood = j.flat("HinokiBall", (0.78, 0.6, 0.38), 0.6)
b = sphere("Ball", 0.05, P(0, 0, 0), wood, segments=16)
finish([b], name="HinokiBall", bevel_width=0, uv=False)
export_pbr_glb(out_path())
