"""Wheeled towel cart 0.9 x 1.0 x 0.5 m with folded towel stacks. Origin = body center."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403
from quality import finish, export_pbr_glb  # noqa: E402
from bath_common import *  # noqa: E402,F403

reset_scene()
import random
rng = random.Random(6)
frame, chr_ = enamel((0.15, 0.17, 0.18), "CartFrame"), chrome()
towels = [enamel(c, n) for c, n in (((0.92, 0.9, 0.84), "TowelWhite"), ((0.55, 0.7, 0.78), "TowelBlue"), ((0.9, 0.8, 0.6), "TowelBeige"))]
o = []
for y in (-0.38, 0.0, 0.38):
    o.append(tbox(f"Shelf{y}", (0.9, 0.025, 0.5), (0, y, 0), frame))
for x in (-0.43, 0.43):
    for z in (-0.23, 0.23):
        o.append(tcyl(f"Post{x}{z}", 0.012, 0.85, (x, 0.0, z), chr_, verts=10))
        o.append(sphere(f"Wheel{x}{z}", 0.035, P(x, -0.46, z), frame, segments=10))
o.append(tcyl("Handle", 0.014, 0.5, (0.47, 0.32, 0), chr_, axis="z", verts=10))
for y in (0.01, 0.39):
    for i, x in enumerate((-0.27, 0.0, 0.27)):
        n = rng.randint(2, 5)
        for k in range(n):
            o.append(tbox(f"T{y}{i}{k}", (0.24, 0.045, 0.3), (x + rng.uniform(-0.01, 0.01), y + 0.035 + k * 0.047, rng.uniform(-0.02, 0.02)), towels[rng.randrange(3)]))
finish(o, name="TowelCart", bevel_width=0.006, uv=False)
export_pbr_glb(out_path())
