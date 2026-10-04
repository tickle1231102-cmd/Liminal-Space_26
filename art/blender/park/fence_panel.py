"""Perimeter fence module: 2 m wide along X, 2.3 m tall. Tile end-to-end; post sits at -X end."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403

reset_scene()
iron = material("FenceIron", (0.012, 0.016, 0.027), roughness=0.55, metallic=0.35)
W, H = 2.0, 2.3
box("Post", (0.14, 0.14, H + 0.1), (-W / 2, 0, (H + 0.1) / 2), iron)
for i, z in enumerate((0.25, H - 0.15)):
    box(f"Rail_{i}", (W, 0.06, 0.08), (0, 0, z), iron)
for i in range(9):
    x = -W / 2 + (i + 0.5) * W / 9
    box(f"Bar_{i}", (0.035, 0.035, H - 0.2), (x, 0, H / 2), iron)
    cone(f"Spike_{i}", 0.04, 0.0, 0.14, (x, 0, H - 0.03), iron, verts=6)
join_visual("FencePanel")
collider("Panel", (W, 0.28, H), (0, 0, H / 2))
export_glb(out_path())
