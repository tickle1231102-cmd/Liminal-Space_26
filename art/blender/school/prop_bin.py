"""Cleaning-supply locker, 0.45 x 0.45 x 1.5, centered. Door vent slots face Three +Z."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403

reset_scene()
steel = material("BinSteel", (0.33, 0.4, 0.43), roughness=0.55, metallic=0.35)
dark = material("BinDark", (0.08, 0.1, 0.11), roughness=0.6)
box("Body", (0.45, 0.45, 1.5), (0, 0, 0), steel)
box("DoorGap", (0.41, 0.005, 1.44), (0, -0.226, 0), dark)
box("Door", (0.4, 0.01, 1.42), (0, -0.23, 0), steel)
for i in range(4):
    box(f"Vent_{i}", (0.24, 0.012, 0.02), (0, -0.237, 0.5 + i * 0.05), dark)
box("Handle", (0.03, 0.03, 0.12), (0.15, -0.245, 0.1), dark)
join_visual("CleaningLocker")
export_glb(out_path())
