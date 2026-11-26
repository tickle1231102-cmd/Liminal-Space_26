"""Plastic foot-bath basin, 34 cm across, 14 cm tall, open top. Origin = centre. Pale pink plastic."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403
from quality import finish, export_pbr_glb  # noqa: E402
import jjim_common as j  # noqa: E402
from jjim_common import P, tbox, tcyl, torus  # noqa: E402

reset_scene()
import bmesh
pl = j.flat("BasinPink", (0.86, 0.55, 0.58), 0.35)
bpy.ops.mesh.primitive_cylinder_add(radius=0.17, depth=0.14, vertices=28, location=(0, 0, 0))
o = bpy.context.active_object
o.name = "Basin"
o.data.materials.append(pl)
bm = bmesh.new(); bm.from_mesh(o.data)
bmesh.ops.delete(bm, geom=[f for f in bm.faces if f.normal.z > 0.9], context="FACES")
bm.to_mesh(o.data); bm.free()
for v in o.data.vertices:
    if v.co.z < 0:
        v.co.x *= 0.82; v.co.y *= 0.82
sol = o.modifiers.new("Wall", "SOLIDIFY"); sol.thickness = 0.006
rim = torus("Rim", 0.17, 0.007, (0, 0.07, 0), pl, axis="y")
bpy.ops.object.select_all(action="DESELECT")
bpy.context.view_layer.objects.active = o; o.select_set(True)
bpy.ops.object.modifier_apply(modifier="Wall")
finish([o, rim], name="FootBucket", bevel_width=0, uv=False)
export_pbr_glb(out_path())
