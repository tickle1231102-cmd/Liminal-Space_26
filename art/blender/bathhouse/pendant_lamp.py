"""Enamel pendant lamp: white-inside/green-outside cone shade, warm bulb, cord up 0.6 m.
Origin = bulb center. The bulb is emissive; runtime adds the point light."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403
from quality import finish, export_pbr_glb  # noqa: E402
from bath_common import *  # noqa: E402,F403

reset_scene()
outside = enamel((0.12, 0.28, 0.2), "ShadeGreen")
inside = enamel((0.92, 0.9, 0.84), "ShadeWhite")
bulb = material("Bulb", (1, 0.95, 0.85), emission=(1.0, 0.78, 0.5), strength=6.0)
cord = enamel((0.05, 0.05, 0.05), "Cord")
sh = cone("Shade", 0.24, 0.05, 0.16, P(0, 0.06, 0), outside, verts=32)
sh_in = cone("ShadeIn", 0.235, 0.048, 0.155, P(0, 0.058, 0), inside, verts=32)
for f in sh_in.data.polygons:
    f.flip()
b = sphere("Bulb", 0.05, P(0, -0.01, 0), bulb, segments=14)
c = tcyl("Cord", 0.006, 0.6, (0, 0.44, 0), cord, verts=8)
cap = tcyl("Cap", 0.03, 0.05, (0, 0.15, 0), enamel((0.6, 0.5, 0.3), "Socket"))
finish([sh, sh_in, b, c, cap], name="PendantLamp", bevel_width=0, uv=False)
export_pbr_glb(out_path())
