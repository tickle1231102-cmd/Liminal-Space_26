"""Food alley popcorn stand. Front (counter, sign) faces Blender -Y = Three +Z.
ANCHOR_Spill_* : where dropped popcorn boxes cluster; ANCHOR_Bin_* : trash can slots."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403

reset_scene()
body = material("PopBody", (0.56, 0.27, 0.09), roughness=0.65, metallic=0.1)
stripe = material("PopStripe", (0.85, 0.82, 0.74), roughness=0.6)
canopy = material("PopCanopy", (0.8, 0.1, 0.17), roughness=0.5, emission=(0.05, 0.004, 0.01), strength=1.0)
glass = material("PopGlass", (0.95, 0.85, 0.55), roughness=0.3, emission=(1.0, 0.75, 0.3), strength=2.5)
metal = material("PopMetal", (0.05, 0.05, 0.06), roughness=0.4, metallic=0.7)

box("Body", (3.6, 2.6, 1.1), (0, 0, 0.75), body)
for i, x in enumerate((-1.2, 0, 1.2)):
    box(f"Stripe_{i}", (0.35, 2.62, 1.0), (x, 0, 0.75), stripe)
box("Counter", (3.8, 2.8, 0.08), (0, 0, 1.34), metal)
box("Case", (1.4, 1.0, 0.9), (-0.8, -0.4, 1.83), glass)
for i, (x, y) in enumerate(((-1.7, -1.2), (1.7, -1.2), (-1.7, 1.2), (1.7, 1.2))):
    cylinder(f"Pole_{i}", 0.05, 1.6, (x, y, 2.18), metal, verts=8)
box("Canopy", (4.0, 3.0, 0.35), (0, 0, 3.15), canopy)
for i, x in enumerate((-1.6, -0.8, 0, 0.8, 1.6)):
    box(f"Valance_{i}", (0.38, 0.04, 0.3), (x, -1.52, 2.85), canopy if i % 2 == 0 else stripe)
for i, x in enumerate((-1.3, 1.3)):
    bpy.ops.mesh.primitive_cylinder_add(radius=0.28, depth=0.1, vertices=16, location=(x, -1.33, 0.28), rotation=(1.5708, 0, 0))
    w = bpy.context.active_object; w.name = f"Wheel_{i}"; w.data.materials.append(metal)
join_visual("PopcornStand")

collider("Body", (3.8, 2.8, 1.4), (0, 0, 0.7))
collider("Canopy", (4.0, 3.0, 0.35), (0, 0, 3.15))
for i, (x, y) in enumerate(((-1.2, -2.2), (0.6, -2.6), (2.4, -1.4))):
    anchor(f"Spill_{i}", (x, y, 0))
anchor("Bin_0", (2.5, 0.6, 0))
anchor("Bin_1", (-2.5, 0.6, 0))
export_glb(out_path())
