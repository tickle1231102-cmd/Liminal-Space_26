"""Midway ghost-house facade: hipped roof, three lit windows (middle one dim), door."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403

reset_scene()
wall = material("GhostWall", (0.07, 0.05, 0.08), roughness=0.88)
roof = material("GhostRoof", (0.04, 0.03, 0.05), roughness=0.9)
frame = material("GhostFrame", (0.12, 0.09, 0.07), roughness=0.8)
lit = material("GhostWindowLit", (0.42, 0.29, 0.16), roughness=0.6, emission=(1.0, 0.6, 0.24), strength=2.5)
dim = material("GhostWindowDim", (0.42, 0.29, 0.16), roughness=0.6, emission=(1.0, 0.6, 0.24), strength=0.6)
door = material("GhostDoor", (0.03, 0.02, 0.02), roughness=0.7)

box("Facade", (11, 2.2, 5.2), (0, 0, 2.6), wall)
r = cone("Roof", 7.2, 0.0, 2.6, (0, 0, 6.5), roof, verts=4)
r.rotation_euler = (0, 0, math.pi / 4)
r.scale = (1.0, 0.3, 1.0)
for i, (x, z, m) in enumerate(((-3, 2.2, lit), (0, 2.8, dim), (3, 2.2, lit))):
    box(f"Window_{i}", (1.2, 0.05, 1.6), (x, -1.12, z), m)
    box(f"Frame_{i}", (1.4, 0.06, 1.8), (x, -1.1, z), frame)
box("Door", (1.4, 0.06, 2.3), (0, -1.12, 1.15), door)
join_visual("GhostHouse")
collider("Facade", (11, 2.2, 5.2), (0, 0, 2.6))
export_glb(out_path())
