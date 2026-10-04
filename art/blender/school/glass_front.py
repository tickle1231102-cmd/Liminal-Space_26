"""Entrance glass front, 18 m along X, 3.4 m tall. Interior side faces Three -Z (Blender +Y).
Aluminium mullions, dark glass that never shows outside, a locked double door in the middle."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403

reset_scene()
alu = material("FrontAlu", (0.25, 0.27, 0.3), roughness=0.35, metallic=0.8)
glass = material("FrontGlass", (0.02, 0.025, 0.035), roughness=0.08, metallic=0.5)
bar = material("FrontPushBar", (0.6, 0.62, 0.65), roughness=0.25, metallic=0.9)
W, H = 18.0, 3.4
box("Glass", (W, 0.06, H), (0, 0, H / 2), glass)
box("Sill", (W, 0.3, 0.12), (0, 0, 0.06), alu)
box("Head", (W, 0.3, 0.18), (0, 0, H - 0.09), alu)
box("Transom", (W, 0.2, 0.08), (0, 0, 2.6), alu)
for i in range(13):
    x = -W / 2 + i * W / 12
    box(f"Mullion_{i}", (0.1, 0.22, H), (x, 0, H / 2), alu)
for s in (-1, 1):
    box(f"DoorStile_{s}", (0.08, 0.2, 2.5), (s * 1.5, 0, 1.25), alu)
    box(f"PushBar_{s}", (1.0, 0.05, 0.05), (s * 0.75, 0.14, 1.05), bar)
join_visual("GlassFront")
collider("Front", (W, 0.3, H), (0, 0, H / 2))
export_glb(out_path())
