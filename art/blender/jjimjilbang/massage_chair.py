"""Massage chair, 0.8 m wide (x), 1.2 m high, 1.1 m deep, faces +z. Origin = footprint centre at floor level.
Dark leatherette on a beige shell. One of the row runs by itself at runtime (the model itself is static)."""
import math, os, random, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403
from quality import finish, export_pbr_glb  # noqa: E402
import jjim_common as j  # noqa: E402
from jjim_common import P, tbox, tcol, tcyl, torus  # noqa: E402

reset_scene()
leather = j.flat("ChairLeather", (0.11, 0.075, 0.06), 0.5)
shell = j.flat("ChairShell", (0.62, 0.57, 0.48), 0.45)
o = [
    tbox("Base", (0.7, 0.24, 0.9), (0, 0.12, -0.02), shell),
    tbox("Seat", (0.5, 0.14, 0.56), (0, 0.4, 0.1), leather),
    tbox("Head", (0.3, 0.16, 0.1), (0, 1.12, -0.42), leather),
]
back = tbox("Back", (0.52, 0.95, 0.16), (0, 0.82, -0.3), leather)
back.rotation_euler = (-0.33, 0, 0)
o.append(back)
foot = tbox("Foot", (0.5, 0.32, 0.26), (0, 0.24, 0.5), leather)
foot.rotation_euler = (0.5, 0, 0)
o.append(foot)
for s in (-1, 1):
    o.append(tbox(f"Arm{s}", (0.15, 0.42, 0.84), (s * 0.325, 0.5, 0.02), shell))
    o.append(tbox(f"ArmPad{s}", (0.11, 0.03, 0.6), (s * 0.325, 0.725, 0.05), leather))
o.append(tbox("Remote", (0.05, 0.14, 0.02), (0.41, 0.6, 0.25), j.flat("RemoteGrey", (0.2, 0.2, 0.21), 0.4)))
tcol("Chair", (0.8, 1.2, 1.1), (0, 0.6, 0))
finish(o, name="MassageChair", bevel_width=0.02, uv=False)
export_pbr_glb(out_path())
