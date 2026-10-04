"""Stainless compartment meal tray."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403

reset_scene()
steel = material("TraySteel", (0.68, 0.72, 0.74), roughness=0.28, metallic=0.75)
dent = material("TrayWell", (0.55, 0.58, 0.6), roughness=0.3, metallic=0.75)
box("Base", (0.42, 0.32, 0.03), (0, 0, -0.01), steel)
for x, y, w, d in ((-0.1, 0.06, 0.18, 0.14), (0.1, 0.06, 0.18, 0.14), (-0.12, -0.08, 0.14, 0.11), (0.0, -0.08, 0.06, 0.11), (0.12, -0.08, 0.14, 0.11)):
    box(f"Well_{x}_{y}", (w, d, 0.006), (x, y, 0.008), dent)
for s in (-1, 1):
    box(f"LipX_{s}", (0.42, 0.012, 0.03), (0, s * 0.154, 0.01), steel)
    box(f"LipY_{s}", (0.012, 0.32, 0.03), (s * 0.204, 0, 0.01), steel)
join_visual("Tray")
export_glb(out_path())
