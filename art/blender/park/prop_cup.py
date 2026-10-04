"""Paper soda cup with lid and straw."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403

reset_scene()
paper = material("CupPaper", (0.85, 0.77, 0.65), roughness=0.75)
lid = material("CupLid", (0.9, 0.9, 0.9), roughness=0.4)
straw = material("CupStraw", (0.9, 0.3, 0.4), roughness=0.5)
cone("Cup", 0.08, 0.11, 0.26, (0, 0, 0), paper, verts=14)
cylinder("Lid", 0.115, 0.02, (0, 0, 0.14), lid, verts=14)
cylinder("Straw", 0.008, 0.16, (0.02, 0, 0.22), straw, verts=6)
join_visual("Cup")
export_glb(out_path())
