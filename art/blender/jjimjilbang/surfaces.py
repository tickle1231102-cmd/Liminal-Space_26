"""Shared surface materials for the floors, walls and ceilings the runtime builds from boxes.
One small plane per material; runtime (JjimKit useSurface) clones the material by name and tiles
it per box size (1 texture period = 1 m). Names here are the runtime contract."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403
from quality import box_uv, export_pbr_glb  # noqa: E402
import jjim_common as j  # noqa: E402

reset_scene()
mats = {
    "Surf_Jangpan": j.jangpan(),
    "Surf_Carpet": j.carpet(),
    "Surf_Plaster": j.plaster(),
    "Surf_Concrete": j.concrete(),
    "Surf_Hwangto": j.hwangto(),
    "Surf_ClayBrick": j.clay_brick(),
    "Surf_SaltBrick": j.salt_brick(),
    "Surf_Charcoal": j.charcoal(),
    "Surf_Stone": j.stone(),
    "Surf_IcePanel": j.ice_panel(),
    "Surf_Wood": j.wood("light"),
    "Surf_WoodDark": j.wood("dark"),
}
for i, (name, mat) in enumerate(mats.items()):
    mat.name = name
    o = box(name, (1, 1, 0.01), (i * 1.2, 0, 0), mat)
    o.name = name
    bpy.context.view_layer.update()
    box_uv(o, 1.0, offset=(i * 1.2 - 0.5, 0, -0.5))
export_pbr_glb(out_path())
