"""Plaza ticket booth. Origin at floor center; counter window faces +X. Blender Y = -Three Z."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403

reset_scene()
wall = material("BoothWall", (0.027, 0.035, 0.06), roughness=0.75, metallic=0.08)
glow = material("BoothWindow", (1.0, 0.8, 0.55), roughness=0.5, emission=(1.0, 0.55, 0.2), strength=4.0)
awning = material("BoothAwning", (0.55, 0.11, 0.14), roughness=0.55, metallic=0.1)
roof = material("BoothRoof", (0.62, 0.17, 0.21), roughness=0.55, emission=(0.05, 0.005, 0.01), strength=1.0)
trim = material("BoothTrim", (0.02, 0.025, 0.035), roughness=0.4, metallic=0.6)

box("Body", (4.6, 3.4, 2.7), (0, 0, 1.35), wall)
box("Plinth", (4.8, 3.6, 0.18), (0, 0, 0.09), trim)
box("Window", (0.08, 1.8, 1.1), (2.33, 0, 1.55), glow)
box("Sill", (0.4, 2.1, 0.08), (2.45, 0, 0.98), trim)
for i, y in enumerate((-0.95, 0.95)):
    box(f"Jamb_{i}", (0.1, 0.1, 1.3), (2.35, y, 1.55), trim)
box("Awning", (5.4, 1.6, 0.12), (0, -1.1, 2.85), awning)
box("Roof", (5.0, 3.8, 0.45), (0, 0, 3.15), roof)
box("RoofCap", (5.2, 4.0, 0.08), (0, 0, 3.41), trim)
join_visual("TicketBooth")

collider("Body", (4.8, 3.6, 2.7), (0, 0, 1.35))
anchor("Queue", (3.4, 0, 0))
export_glb(out_path())
