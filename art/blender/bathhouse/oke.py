"""Yellow plastic bath bucket (Kerorin-style oke), 22 cm across, 12 cm tall. Origin = center.
Hollow (open top) so it bobs upright; runtime uses a cylinder-ish cuboid collider."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403
from quality import finish, export_pbr_glb  # noqa: E402
from bath_common import *  # noqa: E402,F403

reset_scene()
import bmesh
pl = material("OkeYellow", (0.95, 0.78, 0.12), roughness=0.3)
ink = material("OkeInk", (0.62, 0.08, 0.06), roughness=0.3)
bpy.ops.mesh.primitive_cylinder_add(radius=0.11, depth=0.12, vertices=32, location=(0, 0, 0))
o = bpy.context.active_object
o.name = "Bucket"
o.data.materials.append(pl)
bm = bmesh.new(); bm.from_mesh(o.data)
top = [f for f in bm.faces if f.normal.z > 0.9]
bmesh.ops.delete(bm, geom=top, context="FACES")
bm.to_mesh(o.data); bm.free()
# taper the bottom a little
for v in o.data.vertices:
    if v.co.z < 0:
        v.co.x *= 0.88; v.co.y *= 0.88
sol = o.modifiers.new("Wall", "SOLIDIFY"); sol.thickness = 0.006
rim = torus("Rim", 0.11, 0.006, (0, 0.06, 0), pl, axis="y")
label = tbox("Label", (0.09, 0.03, 0.004), (0, 0.0, 0.1), ink)
bpy.ops.object.select_all(action="DESELECT")
bpy.context.view_layer.objects.active = o; o.select_set(True)
bpy.ops.object.modifier_apply(modifier="Wall")
finish([o, rim, label], name="Oke", bevel_width=0, uv=False)
export_pbr_glb(out_path())
