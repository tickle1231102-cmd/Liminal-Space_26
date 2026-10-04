"""High-bay gym light on a short drop rod (hangs from origin)."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403

reset_scene()
housing = material("GymHousing", (0.2, 0.21, 0.23), roughness=0.4, metallic=0.6)
lens = material("GymLens", (1.0, 0.96, 0.88), roughness=0.3, emission=(1.0, 0.93, 0.8), strength=8.0)
cylinder("Rod", 0.02, 0.4, (0, 0, 0.2), housing, verts=6)
box("Housing", (1.1, 1.1, 0.14), (0, 0, -0.07), housing)
box("Lens", (1.0, 1.0, 0.03), (0, 0, -0.15), lens)
join_visual("GymLight")
export_glb(out_path())
