"""Upright boiler on a concrete pad: riveted bands, burner door, gauge, valve wheel, flue pipe.
Origin floor center; flue reaches 2.6 m (boiler-room ceiling)."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403
from quality import finish, export_pbr_glb  # noqa: E402
from bath_common import *  # noqa: E402,F403

reset_scene()
paint = material("BoilerPaint", (0.1, 0.18, 0.14), roughness=0.5, metallic=0.25)
steel = material("Steel", (0.45, 0.46, 0.47), roughness=0.4, metallic=0.8)
conc = material("Concrete", (0.36, 0.35, 0.33), roughness=0.95)
red = enamel((0.6, 0.06, 0.05), "ValveRed")
gl = material("GaugeFace", (0.92, 0.9, 0.84), roughness=0.3)
o = [tbox("Pad", (2.0, 0.15, 2.0), (0, 0.075, 0), conc)]
o.append(tcyl("Body", 0.85, 1.9, (0, 1.1, 0), paint, verts=32))
dome = sphere("Dome", 0.85, P(0, 2.05, 0), paint, segments=24)
dome.scale = (1, 1, 0.35)  # shallow head: stays under the 2.6 m boiler-room ceiling
o.append(dome)
for y in (0.35, 1.0, 1.7):
    o.append(tcyl(f"Band{y}", 0.87, 0.05, (0, y, 0), steel, verts=32))
o.append(tbox("Door", (0.5, 0.45, 0.06), (0, 0.6, 0.86), steel))
o.append(tcyl("DoorHandle", 0.02, 0.18, (0.15, 0.6, 0.92), steel, axis="x"))
o.append(tcyl("Gauge", 0.09, 0.04, (0.35, 1.45, 0.83), steel, axis="z", verts=24))
o.append(tcyl("GaugeFace", 0.075, 0.01, (0.35, 1.45, 0.855), gl, axis="z", verts=24))
o.append(tcyl("Flue", 0.16, 0.7, (0, 2.6, 0), steel))
o.append(tcyl("FeedPipe", 0.06, 1.2, (-0.6, 1.3, 0.5), steel, axis="x"))
o.append(torus("Wheel", 0.12, 0.015, (-1.15, 1.3, 0.5), red, axis="x"))
tcol("Boiler", (1.75, 2.2, 1.75), (0, 1.1, 0))
finish(o, name="Boiler", bevel_width=0.004)
export_pbr_glb(out_path())
