"""Tray return cabinet with a neat stack of trays nobody used."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403

reset_scene()
steel = material("ReturnSteel", (0.45, 0.48, 0.5), roughness=0.35, metallic=0.6)
slot = material("ReturnSlot", (0.05, 0.05, 0.06), roughness=0.9)
tray = material("ReturnTray", (0.68, 0.72, 0.74), roughness=0.28, metallic=0.75)
box("Body", (2.4, 1.0, 1.1), (0, 0, 0.55), steel)
for i in range(3):
    box(f"Slot_{i}", (2.1, 0.02, 0.18), (0, -0.51, 0.3 + i * 0.3), slot)
for i in range(9):
    box(f"Tray_{i}", (0.42, 0.32, 0.025), (0.5, 0, 1.115 + i * 0.03), tray)
join_visual("TrayReturn")
collider("Body", (2.4, 1.0, 1.1), (0, 0, 0.55))
export_glb(out_path())
