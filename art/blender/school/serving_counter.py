"""Cafeteria serving line: 10 m stainless counter, sneeze guard, three heat lamps left on."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403

reset_scene()
steel = material("CounterSteel", (0.55, 0.58, 0.6), roughness=0.28, metallic=0.75)
top = material("CounterTop", (0.7, 0.74, 0.77), roughness=0.2, metallic=0.85)
glass = material("SneezeGlass", (0.6, 0.7, 0.75), roughness=0.05, metallic=0.1)
glass.blend_method = "BLEND"
glass.node_tree.nodes["Principled BSDF"].inputs["Alpha"].default_value = 0.25
lamp = material("HeatLamp", (1.0, 0.72, 0.47), roughness=0.4, emission=(1.0, 0.6, 0.3), strength=5.0)
rod = material("LampRod", (0.2, 0.2, 0.22), roughness=0.4, metallic=0.7)
box("Body", (10, 1.1, 0.9), (0, 0, 0.45), steel)
box("Top", (9.6, 0.9, 0.05), (0, 0, 0.925), top)
for i in range(5):
    box(f"Well_{i}", (1.6, 0.6, 0.02), (-3.6 + i * 1.8, 0, 0.955), rod)
box("Guard", (9.6, 0.02, 0.45), (0, 0.35, 1.3), glass)
for x in (-3.5, 0, 3.5):
    box(f"Lamp_{x}", (1.6, 0.4, 0.1), (x, 0, 2.1), lamp)
    box(f"LampHood_{x}", (1.7, 0.45, 0.06), (x, 0, 2.18), rod)
    cylinder(f"LampRod_{x}", 0.015, 1.5, (x, 0, 2.95), rod, verts=6)
join_visual("ServingCounter")
collider("Body", (10, 1.1, 0.95), (0, 0, 0.475))
export_glb(out_path())
