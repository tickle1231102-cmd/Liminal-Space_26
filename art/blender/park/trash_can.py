"""Park trash can (0.9 m) with a dome lid."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403

reset_scene()
green = material("BinGreen", (0.05, 0.12, 0.09), roughness=0.55, metallic=0.4)
metal = material("BinMetal", (0.04, 0.04, 0.05), roughness=0.35, metallic=0.7)
cylinder("Can", 0.3, 0.8, (0, 0, 0.4), green, verts=16)
for i, z in enumerate((0.15, 0.65)):
    cylinder(f"Band_{i}", 0.31, 0.05, (0, 0, z), metal, verts=16)
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.32, segments=16, ring_count=8, location=(0, 0, 0.8))
lid = bpy.context.active_object; lid.name = "Lid"; lid.scale = (1, 1, 0.45); lid.data.materials.append(metal)
join_visual("TrashCan")
collider("Can", (0.62, 0.62, 0.95), (0, 0, 0.475))
export_glb(out_path())
