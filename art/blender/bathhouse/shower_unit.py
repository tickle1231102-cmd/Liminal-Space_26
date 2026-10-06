"""Seated shower bay, 2.6 m wide, two stations. Faces +Z (Three); origin = back-bottom center,
so the unit sits flush against a wall placed at local z=0. Depth 0.47 m."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403
from quality import finish, export_pbr_glb  # noqa: E402
from bath_common import *  # noqa: E402,F403

reset_scene()
L = 2.6
blue, white, cap, chr_ = tile_blue(), tile_white(), granite(), chrome()
red, cold = enamel((0.7, 0.07, 0.05), "KnobRed"), enamel((0.06, 0.2, 0.62), "KnobBlue")
mirror = material("Mirror", (0.55, 0.6, 0.62), roughness=0.06, metallic=0.7)
o = []
o.append(tbox("Block", (L, 0.7, 0.35), (0, 0.35, 0.175), blue))
o.append(tbox("Ledge", (L + 0.02, 0.04, 0.47), (0, 0.72, 0.235), cap))
o.append(tbox("Back", (L, 1.1, 0.12), (0, 0.74 + 0.55, 0.06), white))
tcol("Block", (L, 0.74, 0.47), (0, 0.37, 0.235))
tcol("Back", (L, 1.85, 0.12), (0, 0.925, 0.06))
for i, x in enumerate((-L / 4, L / 4)):
    # mirror with chrome frame
    o.append(tbox(f"Mir{i}", (0.62, 0.48, 0.012), (x, 1.32, 0.126), mirror))
    o.append(tbox(f"MirFrame{i}", (0.66, 0.52, 0.008), (x, 1.32, 0.121), chr_))
    # mixer: hot/cold knobs + spout on the block front
    for dx, m in ((-0.12, red), (0.12, cold)):
        o.append(tcyl(f"Knob{i}{dx}", 0.032, 0.05, (x + dx, 0.55, 0.375), chr_, axis="z"))
        o.append(tcyl(f"Cap{i}{dx}", 0.02, 0.012, (x + dx, 0.55, 0.405), m, axis="z"))
    o.append(tcyl(f"Spout{i}", 0.018, 0.14, (x, 0.47, 0.42), chr_, axis="z"))
    o.append(tbox(f"Push{i}", (0.06, 0.06, 0.03), (x + 0.3, 0.55, 0.365), chr_))
    # hand shower on its hook + hose dropping to the mixer
    o.append(tcyl(f"Hook{i}", 0.012, 0.08, (x - 0.38, 1.62, 0.16), chr_, axis="z"))
    o.append(tcyl(f"Handle{i}", 0.018, 0.2, (x - 0.38, 1.55, 0.2), chr_))
    o.append(tcyl(f"Head{i}", 0.045, 0.03, (x - 0.38, 1.66, 0.22), chr_, axis="z"))
    o.append(tcyl_between(f"Hose{i}", 0.01, (x - 0.38, 1.45, 0.2), (x - 0.1, 0.58, 0.38), chr_))
finish(o, name="ShowerUnit", bevel_width=0.003)
export_pbr_glb(out_path())
