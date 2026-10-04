"""Student desk. Origin 0.1 m below the top; book box under the top toward Three -Z."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403

reset_scene()
top = material("DeskTop", (0.55, 0.38, 0.17), roughness=0.72)
steel = material("DeskSteel", (0.22, 0.26, 0.28), roughness=0.42, metallic=0.55)
tray = material("DeskBox", (0.38, 0.4, 0.42), roughness=0.5, metallic=0.4)
box("Top", (0.7, 0.5, 0.04), (0, 0, 0.1), top)
box("Edge", (0.7, 0.5, 0.02), (0, 0, 0.07), steel)
box("BookBox", (0.66, 0.36, 0.14), (0, 0.06, -0.02), tray)
for x in (-0.3, 0.3):
    for y in (-0.2, 0.2):
        cylinder(f"Leg_{x}_{y}", 0.014, 0.55, (x, y, -0.2), steel, verts=8)
    box(f"Bar_{x}", (0.02, 0.4, 0.02), (x, 0, -0.38), steel)
join_visual("Desk")
export_glb(out_path())
