"""Cafeteria table with attached benches: top 5.4 x 1.1 at 0.72 m, benches at Three z = +/-1.0."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403

reset_scene()
wood = material("TableTop", (0.55, 0.4, 0.2), roughness=0.7)
steel = material("TableFrame", (0.25, 0.28, 0.3), roughness=0.4, metallic=0.5)
box("Top", (5.4, 1.1, 0.08), (0, 0, 0.72), wood)
for x in (-2.3, 2.3):
    box(f"Leg_{x}", (0.12, 0.9, 0.68), (x, 0, 0.34), steel)
    box(f"Foot_{x}", (0.14, 2.3, 0.05), (x, 0, 0.025), steel)
for y in (-1.0, 1.0):
    box(f"Bench_{y}", (5.0, 0.34, 0.07), (0, y, 0.42), wood)
    for x in (-2.3, 2.3):
        box(f"BenchLeg_{x}_{y}", (0.08, 0.08, 0.39), (x, y, 0.195), steel)
join_visual("CafeteriaTable")
collider("Top", (5.4, 1.1, 0.08), (0, 0, 0.72))
for y in (-1.0, 1.0):
    collider(f"Bench_{y}", (5.0, 0.34, 0.07), (0, y, 0.42))
for x in (-2.3, 2.3):
    collider(f"Leg_{x}", (0.12, 2.3, 0.4), (x, 0, 0.2))
export_glb(out_path())
