"""Shared surface materials for walls, ceilings and trim the runtime builds from boxes.
One small plane per material; runtime (BathKit useSurface) clones the material by name and tiles
it per box size (1 texture period = 1 m). Names here are the runtime contract."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403
from quality import pbr_material, plaster_textures, wood_textures, box_uv, export_pbr_glb  # noqa: E402
from bath_common import tile_white, tile_blue  # noqa: E402

reset_scene()
mats = {
    "Surf_Plaster": pbr_material("Surf_Plaster", plaster_textures("Plaster", size=512, color=(0.8, 0.77, 0.7), seed=19)),
    "Surf_Concrete": pbr_material("Surf_Concrete", plaster_textures("Concrete", size=512, color=(0.42, 0.41, 0.39), grain=2.0, rough=0.92, seed=23, pits=1.0)),
    "Surf_CeilingWood": pbr_material("Surf_CeilingWood", wood_textures("CeilingWood", color=(0.5, 0.36, 0.22), plank=0.2, gloss=0.5, seed=29)),
    "Surf_Hinoki": pbr_material("Surf_Hinoki", wood_textures("Hinoki", color=(0.74, 0.58, 0.4), plank=0.09, gloss=0.6, seed=31)),
    "Surf_WoodDark": pbr_material("Surf_WoodDark", wood_textures("WoodDark", color=(0.27, 0.16, 0.09), plank=0.15, gloss=0.35, seed=37)),
    "Surf_TileWhite": tile_white(),
    "Surf_TileBlue": tile_blue(),
}
for i, (name, mat) in enumerate(mats.items()):
    mat.name = name
    o = box(name, (1, 1, 0.01), (i * 1.2, 0, 0), mat)
    o.name = name
    bpy.context.view_layer.update()
    box_uv(o, 1.0, offset=(i * 1.2 - 0.5, 0, -0.5))
export_pbr_glb(out_path())
