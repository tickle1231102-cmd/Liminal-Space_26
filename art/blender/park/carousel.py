"""Midway carousel. Animated: node "Platform" turns (15 s loop) carrying 8 horses
that bob 4x per turn. Riders/props mount to "Platform" at runtime.
Horses sit at 22.5 deg + k*45 deg so the boardable seat at angle 0 fills a gap."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403

reset_scene()
frames = loop_timeline(15)

deck = material("CarouselDeck", (0.02, 0.025, 0.035), roughness=0.6, metallic=0.3)
canopy = material("CarouselCanopy", (0.55, 0.12, 0.16), roughness=0.55, emission=(0.1, 0.01, 0.03), strength=1.0)
glow = material("CarouselGlow", (1.0, 0.45, 0.55), roughness=0.4, emission=(1.0, 0.35, 0.45), strength=3.0)
brass = material("CarouselBrass", (0.66, 0.5, 0.13), roughness=0.3, metallic=0.75)
saddle = material("HorseSaddle", (0.45, 0.08, 0.12), roughness=0.5)
hoof = material("HorseHoof", (0.1, 0.07, 0.05), roughness=0.6)
coats = [material("HorseCream", (0.91, 0.8, 0.58), roughness=0.45),
         material("HorsePink", (0.8, 0.46, 0.58), roughness=0.45)]

base = cylinder("Skirt", 4.75, 0.12, (0, 0, 0.06), deck, verts=48)
join_visual("CarouselBase", [base])

p = [cylinder("Deck", 4.6, 0.24, (0, 0, 0.18), deck, verts=48),
     cylinder("Pole", 0.22, 3.2, (0, 0, 1.9), brass, verts=16),
     cone("Canopy", 4.8, 0.2, 1.6, (0, 0, 3.3), canopy, verts=16),
     cylinder("CanopyRing", 4.5, 0.12, (0, 0, 2.5), glow, verts=48),
     sphere("Finial", 0.25, (0, 0, 4.2), brass, segments=12)]
for i in range(16):
    a = i / 16 * 2 * math.pi
    p.append(sphere(f"Bulb_{i}", 0.07, (math.cos(a) * 4.62, math.sin(a) * 4.62, 2.38), glow, segments=8))
platform_mesh = join_visual("PlatformMesh", p)
platform = empty("Platform")
parent_keep(platform_mesh, platform)

def horse(i, a, coat):
    """Stylized horse facing travel direction; built at origin then placed."""
    parts = [
        box("Body", (0.32, 0.9, 0.42), (0, 0, 0), coat),
        box("Neck", (0.2, 0.22, 0.45), (0, -0.4, 0.28), coat),
        box("Head", (0.2, 0.42, 0.2), (0, -0.55, 0.5), coat),
        box("Saddle", (0.34, 0.32, 0.06), (0, 0.05, 0.23), saddle),
        box("Tail", (0.06, 0.06, 0.35), (0, 0.48, -0.05), hoof),
    ]
    for j, (x, y, ry) in enumerate(((-0.1, -0.3, 0.5), (0.1, -0.3, 0.3), (-0.1, 0.3, -0.4), (0.1, 0.3, -0.2))):
        leg = box(f"Leg_{j}", (0.07, 0.07, 0.5), (x, y, -0.36), coat)
        leg.rotation_euler = (ry, 0, 0)
        parts.append(leg)
    parts.append(cylinder("HPole", 0.035, 3.0, (0, 0, 0.55), brass, verts=8))
    m = join_visual(f"HorseMesh_{i}", parts)
    r = 2.9
    pivot = empty(f"Horse_{i}", (math.cos(a) * r, math.sin(a) * r, 1.05))
    m.location = pivot.location
    m.rotation_euler = (0, 0, a + math.pi)  # head (built toward -Y) leads the counter-clockwise turn
    parent_keep(m, pivot)
    parent_keep(pivot, platform)
    key_bob(pivot, frames, cycles=4, amplitude=0.22, phase=i * 0.7)

for i in range(8):
    horse(i, (i + 0.5) / 8 * 2 * math.pi, coats[i % 2])

key_spin(platform, 2, frames, turns=1.0)

collider("Pole", (0.6, 0.6, 3.2), (0, 0, 1.6))
export_glb(out_path(), animated=True)
