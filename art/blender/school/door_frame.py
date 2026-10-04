"""Classroom door frame for a 1.8 m opening (origin at the first post, opening along +X).
No door leaf — passage only. Deep enough to line a 0.3 m wall."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403

reset_scene()
wood = material("FrameWood", (0.3, 0.27, 0.22), roughness=0.7)
W, H, D = 1.8, 2.2, 0.34
box("PostA", (0.12, D, H), (0, 0, H / 2), wood)
box("PostB", (0.12, D, H), (W, 0, H / 2), wood)
box("Header", (W + 0.24, D, 0.14), (W / 2, 0, H + 0.07), wood)
box("Transom", (W, 0.04, 0.5), (W / 2, 0, H + 0.39), material("Transom", (0.05, 0.06, 0.08), roughness=0.15, metallic=0.4))
join_visual("DoorFrame")
collider("PostA", (0.12, D, H), (0, 0, H / 2))
collider("PostB", (0.12, D, H), (W, 0, H / 2))
collider("Header", (W + 0.24, D, 0.64), (W / 2, 0, H + 0.32))
export_glb(out_path())
