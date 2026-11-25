"""Comic-book shelf, 5 m wide (x), 2 m high, 0.45 m deep, faces +z. Origin = footprint centre at floor level.
Four rows packed with spines; one gap where a single volume is missing."""
import math, os, random, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403
from quality import finish, export_pbr_glb  # noqa: E402
import jjim_common as j  # noqa: E402
from jjim_common import P, tbox, tcol, tcyl, torus  # noqa: E402

reset_scene()
rng = random.Random(33)
W, Hh, Dp = 5.0, 2.0, 0.45
wood = j.wood("light")
o = [
    tbox("Back", (W, Hh, 0.03), (0, Hh / 2, -Dp / 2 + 0.015), wood),
    tbox("Top", (W, 0.04, Dp), (0, Hh - 0.02, 0), wood),
]
for s in (-1, 0, 1):
    o.append(tbox(f"Upright{s}", (0.04, Hh, Dp), (s * (W / 2 - 0.02), Hh / 2, 0), wood))
ROWS = (0.1, 0.56, 1.02, 1.48)
for y in ROWS:
    o.append(tbox(f"Shelf{y}", (W, 0.04, Dp), (0, y - 0.02, 0), wood))
spines = [j.flat(f"Spine{i}", c, 0.7) for i, c in enumerate(
    ((0.7, 0.16, 0.14), (0.14, 0.3, 0.55), (0.85, 0.72, 0.2), (0.16, 0.42, 0.28), (0.86, 0.84, 0.78), (0.2, 0.2, 0.22), (0.8, 0.45, 0.15)))]
books = []
for r, y in enumerate(ROWS):
    for half in (-1, 1):
        x = (-W / 2 + 0.05) if half < 0 else 0.03
        end = -0.03 if half < 0 else W / 2 - 0.05
        k = 0
        while x < end - 0.05:
            w = rng.uniform(0.028, 0.05)
            hgt = rng.uniform(0.3, 0.38)
            if (r, half, k) == (2, 1, 9):
                x += 0.045  # the missing volume
            books.append(tbox(f"B{r}{half}{k}", (w - 0.003, hgt, 0.26), (x + w / 2, y + hgt / 2, 0.06), spines[rng.randrange(len(spines))]))
            x += w
            k += 1
join_visual("Books", books)
o.append(books[0])
tcol("Shelf", (W, Hh, Dp), (0, Hh / 2, 0))
finish(o, name="ComicShelf", bevel_width=0, uv=True)
export_pbr_glb(out_path())
