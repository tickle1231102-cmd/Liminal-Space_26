"""Closed textbook, 0.2 x 0.27 x 0.04."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403

reset_scene()
cover = material("BookCover", (0.2, 0.32, 0.45), roughness=0.85)
pages = material("BookPages", (0.85, 0.82, 0.72), roughness=0.95)
box("Pages", (0.19, 0.26, 0.032), (0.005, 0, 0), pages)
box("CoverTop", (0.2, 0.27, 0.004), (0, 0, 0.018), cover)
box("CoverBottom", (0.2, 0.27, 0.004), (0, 0, -0.018), cover)
box("Spine", (0.008, 0.27, 0.04), (-0.098, 0, 0), cover)
join_visual("Textbook")
export_glb(out_path())
