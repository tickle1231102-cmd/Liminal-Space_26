"""Sleep-cave module: two stacked arched burrows in a red-clay wall. 2 m wide (x), 2.4 m high, 2.2 m deep.
Origin = front-centre at floor level; the openings face +z, the burrows run back to z = -2.2.
Tiles side by side into a honeycomb wall. Each burrow has a mat and a wooden pillow; a ladder climbs the
right pier. One collider for the whole block (whitebox rule: burrows are looked into, not entered)."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403
from quality import finish, export_pbr_glb  # noqa: E402
import jjim_common as j  # noqa: E402
from jjim_common import tbox, tcol, tcyl, prism_xy  # noqa: E402

reset_scene()
W, H, D = 2.0, 2.4, 2.2
OPEN = 1.5          # opening width
FRONT = 0.2         # front wall thickness
FLOORS = (0.12, 1.3)   # burrow floor heights
SPRING = 0.55       # arch springs this far above the burrow floor
RISE = 0.32
clay, dark, hin = j.hwangto(), j.wood("dark"), j.wood("hinoki")
o = []

# side piers (full height) and inner dividers
for s in (-1, 1):
    px = s * (OPEN / 2 + (W - OPEN) / 4)
    o.append(tbox(f"Pier{s}", ((W - OPEN) / 2, H, FRONT), (px, H / 2, -FRONT / 2), clay))
    o.append(tbox(f"Side{s}", (0.08, H, D - FRONT), (s * (W / 2 - 0.04), H / 2, -FRONT - (D - FRONT) / 2), clay))
# back wall and slabs
o.append(tbox("Back", (W, H, 0.06), (0, H / 2, -D + 0.03), clay))
o.append(tbox("Base", (W, FLOORS[0], D), (0, FLOORS[0] / 2, -D / 2), clay))
o.append(tbox("Mid", (W, 0.12, D), (0, FLOORS[1] - 0.06, -D / 2), clay))
o.append(tbox("Roof", (W, 0.08, D), (0, H - 0.04, -D / 2), clay))

# arch spandrels: rectangle with a half-ellipse cut from below
tops = (FLOORS[1] - 0.12, H)
for i, (fl, top) in enumerate(zip(FLOORS, tops)):
    sp = fl + SPRING
    pts = [(-OPEN / 2, top), (OPEN / 2, top), (OPEN / 2, sp)]
    n = 14
    for k in range(1, n):
        a = math.pi * k / n
        pts.append((OPEN / 2 * math.cos(a), sp + RISE * math.sin(a)))
    pts.append((-OPEN / 2, sp))
    o.append(prism_xy(f"Arch{i}", pts, -FRONT, 0, clay))
    # wooden sill, floor boards, mat and pillow inside
    o.append(tbox(f"Sill{i}", (OPEN, 0.05, FRONT + 0.06), (0, fl + 0.025, -FRONT / 2 + 0.03), dark))
    o.append(tbox(f"Boards{i}", (W - 0.16, 0.02, D - FRONT - 0.06), (0, fl + 0.01, -FRONT - (D - FRONT) / 2), hin))
    o.append(tbox(f"Mat{i}", (0.75, 0.05, 1.7), (-0.1, fl + 0.045, -1.15), j.flat("MatOlive", (0.33, 0.36, 0.22), 0.9)))
    o.append(tbox(f"Pillow{i}", (0.3, 0.1, 0.16), (-0.1, fl + 0.12, -1.85), dark))
    # blank brass number plate above the arch
    o.append(tbox(f"Plate{i}", (0.16, 0.08, 0.012), (0, sp + RISE + 0.1, 0.006), j.brass()))

# ladder on the right pier up to the upper burrow
lx = OPEN / 2 + 0.13
for s in (-1, 1):
    o.append(tbox(f"Rail{s}", (0.03, FLOORS[1] + 0.25, 0.03), (lx + s * 0.11, (FLOORS[1] + 0.25) / 2, 0.035), dark))
for k in range(4):
    o.append(tbox(f"Rung{k}", (0.22, 0.03, 0.03), (lx, 0.28 + k * 0.3, 0.035), dark))

tcol("Block", (W, H, D), (0, H / 2, -D / 2))
finish(o, name="CaveBank", bevel_width=0.008)
export_pbr_glb(out_path())
