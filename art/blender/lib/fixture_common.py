"""Shared fluorescent fixture geometry (2.6 m, hangs from its top at origin)."""
from common import box, cylinder, material, reset_scene, join_visual
import math


def build(lit):
    reset_scene()
    housing = material("FixtureHousing", (0.3, 0.32, 0.36), roughness=0.5, metallic=0.4)
    tube = material(
        "TubeLit" if lit else "TubeDead",
        (0.93, 0.95, 1.0),
        roughness=0.3,
        emission=(0.72, 0.78, 1.0),
        strength=8.0 if lit else 0.4,
    )
    box("Housing", (2.6, 0.32, 0.06), (0, 0, -0.03), housing)
    for i, y in enumerate((-0.08, 0.08)):
        t = cylinder(f"Tube_{i}", 0.025, 2.4, (0, y, -0.09), tube, verts=8)
        t.rotation_euler = (0, math.pi / 2, 0)
    for i, x in enumerate((-1.25, 1.25)):
        box(f"Cap_{i}", (0.06, 0.3, 0.08), (x, 0, -0.09), housing)
    join_visual("Fixture")
