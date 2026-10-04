"""Student chair. Origin = seat center (legs reach -0.44, backrest toward Three -Z)."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403

reset_scene()
ply = material("ChairPly", (0.48, 0.3, 0.12), roughness=0.75)
steel = material("ChairSteel", (0.22, 0.26, 0.28), roughness=0.42, metallic=0.55)
box("Seat", (0.42, 0.42, 0.04), (0, 0, 0), ply)
box("Back", (0.42, 0.03, 0.26), (0, 0.19, 0.42), ply)
for x in (-0.17, 0.17):
    for y in (-0.17, 0.17):
        cylinder(f"Leg_{x}_{y}", 0.012, 0.44, (x, y, -0.22), steel, verts=8)
    cylinder(f"Upright_{x}", 0.012, 0.5, (x, 0.19, 0.25), steel, verts=8)
join_visual("Chair")
export_glb(out_path())
