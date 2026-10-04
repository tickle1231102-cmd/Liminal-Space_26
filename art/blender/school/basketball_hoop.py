"""Wall-less hoop on a post: backboard and rim face Three -Z (Blender +Y); rotate pi for the far end."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403

reset_scene()
steel = material("HoopPost", (0.18, 0.2, 0.22), roughness=0.35, metallic=0.6)
board = material("Backboard", (0.85, 0.84, 0.8), roughness=0.5)
line = material("BoardLine", (0.6, 0.15, 0.08), roughness=0.6)
rimm = material("Rim", (0.75, 0.3, 0.1), roughness=0.5, metallic=0.4)
net = material("Net", (0.9, 0.9, 0.88), roughness=0.9)
box("Post", (0.16, 0.16, 3.4), (0, 0, 1.7), steel)
box("Arm", (0.1, 0.5, 0.1), (0, 0.25, 3.0), steel)
box("Board", (1.8, 0.08, 1.1), (0, 0.5, 3.3), board)
box("Square", (0.6, 0.085, 0.45), (0, 0.5, 3.1), line)
box("SquareIn", (0.5, 0.09, 0.37), (0, 0.5, 3.12), board)
bpy.ops.mesh.primitive_torus_add(major_radius=0.24, minor_radius=0.018, location=(0, 0.85, 2.95))
t = bpy.context.active_object; t.name = "Rim"; t.data.materials.append(rimm)
cone("Net", 0.24, 0.16, 0.4, (0, 0.85, 2.73), net, verts=12)
join_visual("Hoop")
collider("Post", (0.16, 0.16, 3.4), (0, 0, 1.7))
collider("Board", (1.8, 0.08, 1.1), (0, 0.5, 3.3))
export_glb(out_path())
