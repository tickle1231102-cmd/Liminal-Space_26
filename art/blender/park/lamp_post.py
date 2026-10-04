"""Plaza lamp post (3.5 m). Light source stays in code; globe is emissive."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403

reset_scene()
iron = material("LampIron", (0.02, 0.025, 0.04), roughness=0.4, metallic=0.6)
glow = material("LampGlobe", (1.0, 0.88, 0.66), roughness=0.3, emission=(1.0, 0.75, 0.48), strength=6.0)
cone("Base", 0.22, 0.14, 0.3, (0, 0, 0.15), iron, verts=12)
cone("Pole", 0.1, 0.07, 3.0, (0, 0, 1.75), iron, verts=10)
cone("Collar", 0.09, 0.16, 0.12, (0, 0, 3.2), iron, verts=12)
sphere("Globe", 0.22, (0, 0, 3.35), glow)
join_visual("LampPost")
collider("Pole", (0.3, 0.3, 3.3), (0, 0, 1.65))
export_glb(out_path())
