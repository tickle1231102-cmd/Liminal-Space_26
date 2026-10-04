"""South gate arch toward the midway. 9.6 m clear opening along X; neon + sign stay in code."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403

reset_scene()
frame = material("GateFrame", (0.03, 0.04, 0.07), roughness=0.4, metallic=0.45)
cap = material("GateCap", (0.05, 0.06, 0.09), roughness=0.35, metallic=0.6)
for side, x in (("L", -4.8), ("R", 4.8)):
    box(f"Pillar{side}", (0.45, 0.55, 3.2), (x, 0, 1.6), frame)
    box(f"Foot{side}", (0.7, 0.8, 0.25), (x, 0, 0.125), cap)
    sphere(f"Finial{side}", 0.2, (x, 0, 3.8), cap, segments=12)
box("Beam", (10.2, 0.55, 0.4), (0, 0, 3.35), frame)
box("BeamCap", (10.4, 0.65, 0.06), (0, 0, 3.58), cap)
join_visual("GateArch")
collider("PillarL", (0.7, 0.8, 3.2), (-4.8, 0, 1.6))
collider("PillarR", (0.7, 0.8, 3.2), (4.8, 0, 1.6))
collider("Beam", (10.2, 0.55, 0.4), (0, 0, 3.35))
export_glb(out_path())
