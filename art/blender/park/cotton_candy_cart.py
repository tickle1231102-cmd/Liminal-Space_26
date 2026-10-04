"""Cotton candy cart with glowing floss globe and umbrella. Front faces Three +Z."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403

reset_scene()
body = material("CandyBody", (0.42, 0.3, 0.62), roughness=0.5, emission=(0.08, 0.04, 0.14), strength=1.0)
trim = material("CandyTrim", (0.9, 0.88, 0.92), roughness=0.4)
metal = material("CandyMetal", (0.05, 0.05, 0.07), roughness=0.4, metallic=0.7)
floss = material("CandyFloss", (0.9, 0.75, 1.0), roughness=0.9, emission=(0.78, 0.6, 1.0), strength=2.0)
umb = material("CandyUmbrella", (0.92, 0.55, 0.78), roughness=0.6)

box("Body", (2.5, 2.1, 1.0), (0, 0, 0.7), body)
box("Top", (2.7, 2.3, 0.08), (0, 0, 1.24), trim)
box("Skirt", (2.6, 2.2, 0.12), (0, 0, 0.18), trim)
cylinder("Machine", 0.45, 0.35, (0, 0, 1.45), metal, verts=20)
sphere("Floss", 0.55, (0, 0, 2.0), floss, segments=20)
cylinder("UmbrellaPole", 0.04, 2.0, (0.9, 0.7, 2.2), metal, verts=8)
cone("Umbrella", 1.3, 0.05, 0.45, (0.9, 0.7, 3.3), umb, verts=10)
for i, x in enumerate((-0.9, 0.9)):
    bpy.ops.mesh.primitive_cylinder_add(radius=0.22, depth=0.08, vertices=14, location=(x, -1.08, 0.22), rotation=(1.5708, 0, 0))
    w = bpy.context.active_object; w.name = f"Wheel_{i}"; w.data.materials.append(metal)
join_visual("CottonCandyCart")

collider("Body", (2.7, 2.3, 1.3), (0, 0, 0.65))
for i, (x, y) in enumerate(((-1.0, -1.8), (1.3, -1.6))):
    anchor(f"Spill_{i}", (x, y, 0))
anchor("Bin_0", (-1.9, 0.4, 0))
export_glb(out_path())
