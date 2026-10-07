"""Rubber duck, ~12 cm. Origin = body center (runtime: dynamic body, floats via useBuoyancy)."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403
from quality import finish, export_pbr_glb  # noqa: E402
from bath_common import *  # noqa: E402,F403

reset_scene()
yel = material("DuckYellow", (0.95, 0.72, 0.08), roughness=0.35)
beak = material("DuckBeak", (0.95, 0.38, 0.05), roughness=0.4)
eye = material("DuckEye", (0.02, 0.02, 0.02), roughness=0.2)
body = sphere("Body", 0.06, P(0, 0, 0), yel, segments=20)
body.scale = (1.0, 1.25, 0.8)
head = sphere("Head", 0.038, P(0, 0.055, 0.035), yel, segments=16)
bk = sphere("Beak", 0.018, P(0, 0.05, 0.072), beak, segments=12)
bk.scale = (1.3, 1.4, 0.5)
tail = sphere("Tail", 0.022, P(0, 0.025, -0.07), yel, segments=10)
e1 = sphere("EyeL", 0.007, P(-0.02, 0.068, 0.062), eye, segments=8)
e2 = sphere("EyeR", 0.007, P(0.02, 0.068, 0.062), eye, segments=8)
finish([body, head, bk, tail, e1, e2], name="Duck", bevel_width=0, uv=False)
export_pbr_glb(out_path())
