"""Interior wall module: 2 m along X, 3.4 m tall, 0.24 m thick. Classic Korean school finish on
both faces — cream plaster above, pale green wainscot below, wood chair rail, dark baseboard.
Runtime stretches it per wall (WallSlab), so details scale with the wall."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403

reset_scene()
W, H, T = 2.0, 3.4, 0.24
plaster = material("WallPlaster", (0.52, 0.5, 0.43), roughness=0.9)
wains = material("WallWainscot", (0.22, 0.32, 0.26), roughness=0.75)
rail = material("WallRail", (0.25, 0.15, 0.08), roughness=0.6)
base = material("WallBaseboard", (0.1, 0.14, 0.12), roughness=0.7)
box("Plaster", (W, T, H), (0, 0, H / 2), plaster)
for s in (-1, 1):
    y = s * (T / 2 + 0.005)
    box(f"Wainscot_{s}", (W, 0.012, 1.1), (0, y, 0.55), wains)
    box(f"Rail_{s}", (W, 0.04, 0.06), (0, s * (T / 2 + 0.02), 1.12), rail)
    box(f"Base_{s}", (W, 0.03, 0.14), (0, s * (T / 2 + 0.015), 0.07), base)
join_visual("WallModule")
export_glb(out_path())
