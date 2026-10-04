"""Plaza fountain: tapered basin, still water, central pillar."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403

reset_scene()
stone = material("FountainStone", (0.19, 0.24, 0.31), roughness=0.45, metallic=0.25)
water = material("FountainWater", (0.29, 0.56, 0.66), roughness=0.08, metallic=0.85, emission=(0.1, 0.25, 0.34), strength=0.6)
water.blend_method = "BLEND"
water.node_tree.nodes["Principled BSDF"].inputs["Alpha"].default_value = 0.55
metal = material("FountainMetal", (0.27, 0.33, 0.42), roughness=0.35, metallic=0.55)
orb = material("FountainOrb", (0.6, 0.7, 0.8), roughness=0.2, metallic=0.7, emission=(0.53, 0.67, 0.8), strength=1.2)

cone("Basin", 3.0, 2.6, 0.55, (0, 0, 0.275), stone, verts=48)
cone("Rim", 2.62, 2.62, 0.06, (0, 0, 0.58), metal, verts=48)
bpy.ops.mesh.primitive_cylinder_add(radius=2.35, depth=0.02, vertices=48, location=(0, 0, 0.57))
pool = bpy.context.active_object; pool.name = "Water"; pool.data.materials.append(water)
cone("Pillar", 0.4, 0.28, 1.5, (0, 0, 1.25), metal, verts=16)
cone("Bowl", 0.25, 0.7, 0.2, (0, 0, 1.75), stone, verts=24)
sphere("Orb", 0.35, (0, 0, 2.05), orb, segments=24)
join_visual("Fountain")

collider("Basin", (5.4, 5.4, 0.6), (0, 0, 0.3))
collider("Pillar", (0.8, 0.8, 2.4), (0, 0, 1.2))
export_glb(out_path())
