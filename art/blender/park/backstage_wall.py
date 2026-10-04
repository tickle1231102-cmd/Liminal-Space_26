"""Backstage corridor wall module: 4 m along X, 4.6 m tall, 0.45 m thick.
Both faces get a baseboard and a conduit run; tile with ModuleRun."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403

reset_scene()
W, H, T = 4.0, 4.6, 0.45
wall = material("BackWall", (0.05, 0.065, 0.1), roughness=0.9)
base = material("BackBaseboard", (0.02, 0.025, 0.035), roughness=0.7, metallic=0.2)
pipe = material("BackConduit", (0.16, 0.18, 0.2), roughness=0.4, metallic=0.6)
seam = material("BackSeam", (0.015, 0.02, 0.03), roughness=0.95)
box("Wall", (W, T, H), (0, 0, H / 2), wall)
box("Seam", (0.04, T + 0.01, H), (-W / 2 + 0.02, 0, H / 2), seam)
for s in (-1, 1):
    y = s * (T / 2 + 0.02)
    box(f"Baseboard_{s}", (W, 0.04, 0.18), (0, y, 0.09), base)
    c = cylinder(f"Conduit_{s}", 0.04, W, (0, s * (T / 2 + 0.07), 3.6), pipe, verts=8)
    c.rotation_euler = (0, math.pi / 2, 0)
    for k, x in enumerate((-1.2, 1.2)):
        box(f"Clamp_{s}_{k}", (0.05, 0.1, 0.12), (x, s * (T / 2 + 0.05), 3.6), pipe)
join_visual("BackstageWall")
collider("Wall", (W, T, H), (0, 0, H / 2))
export_glb(out_path())
