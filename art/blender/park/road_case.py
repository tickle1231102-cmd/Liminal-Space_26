"""Backstage road case / utility crate: 1.35 x 1.05 x 1.1 m, metal corners, stencil band."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403

reset_scene()
body = material("CaseBody", (0.12, 0.14, 0.18), roughness=0.7, metallic=0.25)
edge = material("CaseEdge", (0.5, 0.52, 0.55), roughness=0.3, metallic=0.85)
band = material("CaseBand", (0.6, 0.45, 0.1), roughness=0.6)
W, D, H = 1.35, 1.05, 1.1
box("Body", (W, D, H), (0, 0, H / 2), body)
box("Band", (W + 0.01, D + 0.01, 0.12), (0, 0, H * 0.7), band)
for x in (-1, 1):
    for y in (-1, 1):
        box(f"Corner_{x}_{y}", (0.08, 0.08, H + 0.02), (x * (W / 2 - 0.03), y * (D / 2 - 0.03), H / 2), edge)
for i, x in enumerate((-0.35, 0.35)):
    box(f"Handle_{i}", (0.25, 0.04, 0.06), (x, -D / 2 - 0.02, H * 0.5), edge)
join_visual("RoadCase")
collider("Body", (W, D, H), (0, 0, H / 2))
export_glb(out_path())
