"""Bandai: the raised attendant's booth. Faces +Z. Footprint 1.6 x 1.2 m, counter at 1.25 m."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403
from quality import finish, export_pbr_glb  # noqa: E402
from bath_common import *  # noqa: E402,F403

reset_scene()
dark, light, br = wood("dark"), wood("light"), brass()
o = []
o.append(tbox("Base", (1.6, 1.15, 1.2), (0, 0.575, 0), dark))
o.append(tbox("Plinth", (1.64, 0.08, 1.24), (0, 0.04, 0), enamel((0.08, 0.06, 0.05), "Plinth")))
o.append(tbox("Top", (1.8, 0.06, 1.4), (0, 1.18, 0.05), light))
for s in (-1, 1):
    o.append(tbox(f"Side{s}", (0.04, 0.45, 1.3), (s * 0.86, 1.43, 0.0), light))
o.append(tbox("Back", (1.76, 0.45, 0.04), (0, 1.43, -0.63), light))
# panels on the front face
for i, x in enumerate((-0.52, 0, 0.52)):
    o.append(tbox(f"Panel{i}", (0.44, 0.8, 0.02), (x, 0.62, 0.61), light))
# cash tray, abacus, bell, ticket box
o.append(tbox("Tray", (0.3, 0.03, 0.2), (0.4, 1.225, 0.45), light))
o.append(tbox("Abacus", (0.4, 0.03, 0.12), (-0.3, 1.225, 0.5), dark))
for k in range(9):
    o.append(tcyl(f"Rod{k}", 0.004, 0.11, (-0.48 + k * 0.045, 1.245, 0.5), br, axis="z"))
o.append(tcyl("Bell", 0.04, 0.05, (0.05, 1.235, 0.55), br))
o.append(tbox("Tickets", (0.18, 0.1, 0.14), (-0.65, 1.26, 0.3), enamel((0.75, 0.68, 0.5), "TicketBox")))
tcol("Booth", (1.8, 1.25, 1.4), (0, 0.625, 0.05))
finish(o, name="Bandai", bevel_width=0.006)
export_pbr_glb(out_path())
