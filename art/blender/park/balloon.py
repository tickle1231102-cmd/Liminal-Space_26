"""Party balloon: teardrop envelope, tied knot, slightly curved string. Origin at envelope center.
The envelope material "BalloonSkin" is re-tinted per seed at runtime."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403

reset_scene()
skin = material("BalloonSkin", (0.91, 0.36, 0.46), roughness=0.22)
bsdf = skin.node_tree.nodes["Principled BSDF"]
bsdf.inputs["Coat Weight"].default_value = 0.65
bsdf.inputs["Coat Roughness"].default_value = 0.25
knot = material("BalloonKnot", (0.95, 0.91, 0.85), roughness=0.5)
string = material("BalloonString", (0.91, 0.87, 0.82), roughness=0.6)

bpy.ops.mesh.primitive_uv_sphere_add(radius=0.48, segments=32, ring_count=16, location=(0, 0, 0))
env = bpy.context.active_object; env.name = "Envelope"; env.data.materials.append(skin)
for v in env.data.vertices:  # teardrop: pinch the lower half toward the knot
    if v.co.z < 0:
        k = 1 - 0.35 * (-v.co.z / 0.48) ** 1.6
        v.co.x *= k; v.co.y *= k
        v.co.z *= 1.12
bpy.ops.object.shade_smooth()
cone("Knot", 0.07, 0.03, 0.08, (0, 0, -0.57), knot, verts=10)
pts = [(0.0, 0.0, -0.6), (0.03, 0.0, -0.85), (-0.02, 0.01, -1.1), (0.02, 0.0, -1.35)]
for i in range(len(pts) - 1):
    (x0, y0, z0), (x1, y1, z1) = pts[i], pts[i + 1]
    seg = cylinder(f"String_{i}", 0.006, math.dist(pts[i], pts[i + 1]),
                   ((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2), string, verts=5)
    seg.rotation_euler = (0, math.atan2(x1 - x0, z1 - z0), 0)
join_visual("Balloon")
export_glb(out_path())
