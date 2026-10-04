"""Folded event flyer lying flat."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403

reset_scene()
paper = material("FlyerPaper", (0.9, 0.89, 0.85), roughness=0.85)
ink = material("FlyerInk", (0.55, 0.12, 0.35), roughness=0.85)
box("Sheet", (0.35, 0.45, 0.01), (0, 0, 0), paper)
box("Band", (0.35, 0.12, 0.012), (0, 0.12, 0.001), ink)
join_visual("Flyer")
export_glb(out_path())
