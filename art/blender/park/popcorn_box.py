"""Dropped striped popcorn box (food alley clutter)."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403

reset_scene()
red = material("BoxRed", (0.75, 0.08, 0.12), roughness=0.7)
white = material("BoxWhite", (0.9, 0.88, 0.82), roughness=0.7)
corn = material("Popcorn", (1.0, 0.9, 0.6), roughness=0.9, emission=(0.4, 0.3, 0.1), strength=0.4)
cone("Box", 0.11, 0.15, 0.3, (0, 0, 0), red, verts=4)
for i in range(4):
    import math
    a = math.pi / 4 + i * math.pi / 2
    box(f"Stripe_{i}", (0.03, 0.03, 0.29), (0.11 * math.cos(a) * 1.0, 0.11 * math.sin(a), 0), white)
for i, (x, y) in enumerate(((0, 0), (0.05, 0.04), (-0.05, 0.02), (0.02, -0.05))):
    sphere(f"Corn_{i}", 0.05, (x, y, 0.16), corn, segments=8)
join_visual("PopcornBox")
export_glb(out_path())
