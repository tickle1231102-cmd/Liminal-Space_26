"""Path bollard light (1 m)."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403

reset_scene()
iron = material("BollardIron", (0.04, 0.05, 0.07), roughness=0.4, metallic=0.5)
glow = material("BollardGlobe", (1.0, 0.9, 0.75), roughness=0.3, emission=(1.0, 0.8, 0.55), strength=7.0)
cone("Post", 0.08, 0.06, 0.9, (0, 0, 0.45), iron, verts=8)
sphere("Globe", 0.12, (0, 0, 0.95), glow, segments=12)
join_visual("Bollard")
export_glb(out_path())
