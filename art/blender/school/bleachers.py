"""Folded gym bleachers: 2.6 deep (X) x 1.8 tall x 22 long (Y). Folded slats face +X."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403

reset_scene()
wood = material("BleacherWood", (0.4, 0.3, 0.2), roughness=0.85)
frame = material("BleacherFrame", (0.12, 0.13, 0.14), roughness=0.5, metallic=0.5)
box("Body", (2.4, 22, 1.8), (-0.1, 0, 0.9), frame)
for i in range(6):
    box(f"Slat_{i}", (0.06, 21.8, 0.24), (1.11 + i * 0.0, 0, 0.18 + i * 0.29), wood)
join_visual("Bleachers")
collider("Body", (2.6, 22, 1.8), (0, 0, 0.9))
export_glb(out_path())
