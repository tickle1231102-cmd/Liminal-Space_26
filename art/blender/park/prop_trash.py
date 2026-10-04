"""Tied trash bag."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403

reset_scene()
bag = material("BagBlack", (0.03, 0.035, 0.045), roughness=0.3, metallic=0.1)
bpy.ops.mesh.primitive_ico_sphere_add(radius=0.14, subdivisions=2, location=(0, 0, -0.02))
b = bpy.context.active_object; b.name = "Bag"; b.scale = (1, 1, 1.15); b.data.materials.append(bag)
cone("Knot", 0.05, 0.02, 0.08, (0, 0, 0.15), bag, verts=8)
join_visual("TrashBag")
export_glb(out_path())
