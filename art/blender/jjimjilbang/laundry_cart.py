"""Canvas laundry cart, 0.9 x 0.8 x 0.55 m, heaped with returned sauna clothes. Origin = body centre."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403
from quality import finish, export_pbr_glb  # noqa: E402
import jjim_common as j  # noqa: E402
from jjim_common import P, tbox, tcyl, torus  # noqa: E402

reset_scene()
import random
rng = random.Random(15)
canvas = j.flat("CartCanvas", (0.72, 0.68, 0.56), 0.9)
frame = j.steel()
cloths = [j.flat("ClothOrange", (0.8, 0.4, 0.12), 0.95), j.flat("ClothPink", (0.82, 0.5, 0.56), 0.95)]
o = [tbox("Bin", (0.86, 0.55, 0.51), (0, -0.05, 0), canvas)]
for x in (-0.43, 0.43):
    for z in (-0.255, 0.255):
        o.append(tcyl(f"Post{x}{z}", 0.012, 0.66, (x, -0.02, z), frame, verts=8))
        o.append(sphere(f"Wheel{x}{z}", 0.04, P(x, -0.36, z), j.flat("WheelBlack", (0.05, 0.05, 0.05), 0.6), segments=10))
for z in (-0.255, 0.255):
    o.append(tcyl(f"Rail{z}", 0.012, 0.86, (0, 0.31, z), frame, axis="x", verts=8))
for k in range(9):
    o.append(tbox(f"Heap{k}", (rng.uniform(0.25, 0.4), 0.05, rng.uniform(0.2, 0.3)),
                  (rng.uniform(-0.25, 0.25), 0.25 + k * 0.012, rng.uniform(-0.1, 0.1)), cloths[rng.randrange(2)]))
finish(o, name="LaundryCart", bevel_width=0.006, uv=False)
export_pbr_glb(out_path())
