"""Basketball, r = 0.12 m, with seam lines."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403

reset_scene()
leather = material("BallLeather", (0.6, 0.22, 0.07), roughness=0.85)
seam = material("BallSeam", (0.05, 0.03, 0.02), roughness=0.9)
sphere("Ball", 0.12, (0, 0, 0), leather, segments=20)
for rot in ((0, 0, 0), (math.pi / 2, 0, 0), (0, math.pi / 2, 0)):
    bpy.ops.mesh.primitive_torus_add(major_radius=0.1205, minor_radius=0.003, major_segments=40, minor_segments=4, rotation=rot)
    t = bpy.context.active_object; t.data.materials.append(seam)
join_visual("Basketball")
export_glb(out_path())
