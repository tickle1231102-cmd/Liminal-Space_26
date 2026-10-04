"""Central stairs (group origin). 8 risers of 0.22 m climbing toward Three -Z, landing at 1.95 m,
dark landing window, sloped handrail. Stops at the landing — the upper floor is out of scope."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403

reset_scene()
conc = material("StairConcrete", (0.4, 0.39, 0.35), roughness=0.85)
nosing = material("StairNosing", (0.12, 0.13, 0.12), roughness=0.5, metallic=0.3)
dark = material("StairWindow", (0.015, 0.018, 0.025), roughness=0.98)
rail = material("StairRail", (0.3, 0.34, 0.36), roughness=0.35, metallic=0.6)
X = -2.4
for i in range(8):
    zt, yt = -0.3 - i * 0.3, 0.22 * (i + 1)   # Three coords
    box(f"Step_{i}", (3.0, 0.3, yt), (X, -zt, yt / 2), conc)
    box(f"Nose_{i}", (3.0, 0.04, 0.02), (X, -zt + 0.13, yt + 0.01), nosing)
    collider(f"Step_{i}", (3.0, 0.3, 0.22), (X, -zt, yt - 0.11))
box("Landing", (3.0, 1.6, 2.06), (X, 3.1, 1.03), conc)
collider("Landing", (3.0, 1.6, 0.22), (X, 3.1, 1.95))
box("Window", (3.2, 0.24, 1.8), (X, 3.95, 2.9), dark)
collider("Window", (3.2, 0.24, 1.8), (X, 3.95, 2.9))
# handrail: sloped from bottom step to landing on the open (+X) side
x = -0.85
for i, (yb, zb) in enumerate(((0.3, 0.22), (1.5, 1.1), (2.7, 1.9))):
    box(f"Baluster_{i}", (0.04, 0.04, 0.9), (x, yb, zb + 0.45), rail)
r = box("Rail", (0.05, 2.9, 0.05), (x, 1.5, 1.95), rail)
r.rotation_euler = (math.atan2(1.68, 2.4), 0, 0)
join_visual("Stairs")
export_glb(out_path())
