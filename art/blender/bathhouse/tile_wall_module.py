"""Bath hall wall module: 2 m along X, 6 m tall, 0.25 m thick, tiled on both faces.
Sento finish: blue 12.5 cm tiles up to 1.35 m, glazed bullnose cap, white 20 cm tiles above,
dark cove skirting. Tile sizes divide the 1 m texture period and the 2 m module, so the grout
grid continues unbroken across modules (runtime ModuleRun places them at native scale)."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403
from quality import box_uv, bevel, export_pbr_glb  # noqa: E402
from bath_common import tile_blue, tile_white  # noqa: E402

reset_scene()
W, H, T = 2.0, 6.0, 0.25
WAINS = 1.35
SKIRT = 0.12

blue = tile_blue()
white = tile_white()
cap = material("TileCap", (0.06, 0.16, 0.26), roughness=0.12)
skirt = material("Skirting", (0.05, 0.09, 0.12), roughness=0.3)
core = material("WallCore", (0.5, 0.5, 0.48), roughness=0.9)

box("Core", (W, T - 0.02, H), (0, 0, H / 2), core)
parts = []
for s in (-1, 1):
    y = s * (T / 2 - 0.005)
    lower = box(f"Blue_{s}", (W, 0.01, WAINS - SKIRT), (0, y, SKIRT + (WAINS - SKIRT) / 2), blue)
    upper = box(f"White_{s}", (W, 0.01, H - WAINS), (0, y, WAINS + (H - WAINS) / 2), white)
    for o in (lower, upper):
        bpy.context.view_layer.update()
        box_uv(o, period=1.0, offset=(-W / 2, 0, 0))
    # bullnose cap: half-round glazed trim along the wainscot top
    c = cylinder(f"Cap_{s}", 0.022, W, (0, s * (T / 2 + 0.002), WAINS), cap, verts=24)
    c.rotation_euler = (0, math.pi / 2, 0)
    # cove skirting
    k = box(f"Skirt_{s}", (W, 0.03, SKIRT), (0, s * (T / 2 + 0.008), SKIRT / 2), skirt)
    parts += [c, k]

for o in parts:
    bevel(o, width=0.008, segments=3)
    bpy.ops.object.select_all(action="DESELECT")
    bpy.context.view_layer.objects.active = o
    o.select_set(True)
    for m in list(o.modifiers):
        bpy.ops.object.modifier_apply(modifier=m.name)

join_visual("TileWall")  # one node; one draw call per material at runtime

export_pbr_glb(out_path())
