"""School ceiling fluorescent, 2.4 m along X, hangs from origin. Tube material is named "Tube"
so the runtime can dim/flicker each fixture."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403

reset_scene()
housing = material("FixtureHousing", (0.6, 0.6, 0.58), roughness=0.6, metallic=0.2)
tube = material("Tube", (0.95, 0.96, 1.0), roughness=0.3, emission=(0.95, 0.97, 1.0), strength=6.0)
box("Housing", (2.4, 0.26, 0.05), (0, 0, -0.025), housing)
box("Diffuser", (2.3, 0.2, 0.04), (0, 0, -0.07), tube)
for i, x in enumerate((-1.18, 1.18)):
    box(f"Cap_{i}", (0.04, 0.24, 0.08), (x, 0, -0.06), housing)
join_visual("Fluorescent")
export_glb(out_path())
