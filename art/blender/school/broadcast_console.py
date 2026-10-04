"""Broadcast room console, 1.0 x 1.0 x 4.2 (Y). Operator side faces -X. Level meters stay lit."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403

reset_scene()
body = material("ConsoleBody", (0.1, 0.12, 0.14), roughness=0.45, metallic=0.45)
panel = material("ConsolePanel", (0.04, 0.045, 0.05), roughness=0.6)
meter = material("ConsoleMeter", (0.56, 0.94, 0.78), roughness=0.4, emission=(0.42, 0.88, 0.69), strength=4.0)
knob = material("ConsoleKnob", (0.7, 0.7, 0.68), roughness=0.3, metallic=0.6)
screen = material("ConsoleScreen", (0.02, 0.03, 0.03), roughness=0.1, emission=(0.05, 0.12, 0.1), strength=1.0)
box("Body", (1.0, 4.2, 0.95), (0, 0, 0.475), body)
p = box("Panel", (0.75, 4.0, 0.04), (-0.12, 0, 1.0), panel)
p.rotation_euler = (0, math.radians(-12), 0)
for dz in (-1.2, 0, 1.2):
    box(f"Meter_{dz}", (0.22, 0.6, 0.02), (-0.4, dz, 1.04), meter)
import random
rnd = random.Random(3)
for i in range(24):
    cylinder(f"Knob_{i}", 0.025, 0.04, (-0.05 + rnd.random() * 0.3, -1.8 + i * 0.15, 1.06), knob, verts=8)
box("Monitor", (0.06, 0.8, 0.5), (0.4, 0, 1.4), screen)
join_visual("BroadcastConsole")
collider("Body", (1.0, 4.2, 1.0), (0, 0, 0.5))
export_glb(out_path())
