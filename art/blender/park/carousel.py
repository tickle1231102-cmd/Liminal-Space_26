"""Midway carousel. Animated: node "Platform" turns (15 s loop) carrying 8 horses
that bob 4x per turn. "RideMount_0" is the boardable horse slot (mounted at runtime).
Horses sit at 22.5 deg + k*45 deg so the boardable seat at angle 0 fills a gap."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403
from horse_common import build_horse, horse_materials  # noqa: E402

reset_scene()
frames = loop_timeline(15)
mats = horse_materials()
brass = mats["brass"]

deck = material("CarouselDeck", (0.02, 0.025, 0.035), roughness=0.6, metallic=0.3)
canopy = material("CarouselCanopy", (0.55, 0.12, 0.16), roughness=0.55, emission=(0.1, 0.01, 0.03), strength=1.0)
glow = material("CarouselGlow", (1.0, 0.45, 0.55), roughness=0.4, emission=(1.0, 0.35, 0.45), strength=3.0)
base = cylinder("Skirt", 4.75, 0.12, (0, 0, 0.06), deck, verts=48)
join_visual("CarouselBase", [base])

p = [cylinder("Deck", 4.6, 0.24, (0, 0, 0.18), deck, verts=48),
     cylinder("Pole", 0.22, 3.2, (0, 0, 1.9), brass, verts=16),
     cone("Canopy", 4.8, 0.2, 1.6, (0, 0, 3.3), canopy, verts=16),
     cylinder("Valance", 4.55, 0.3, (0, 0, 2.55), canopy, verts=48, capped=False),
     sphere("Finial", 0.25, (0, 0, 4.2), brass, segments=12)]
# Light band around the canopy edge (a ring, not a disc: riders look up into the canopy)
bpy.ops.mesh.primitive_torus_add(major_radius=4.6, minor_radius=0.05, major_segments=64, minor_segments=8,
                                 location=(0, 0, 2.42))
band = bpy.context.active_object; band.name = "LightBand"; band.data.materials.append(glow); p.append(band)
for i in range(16):
    a = i / 16 * 2 * math.pi
    p.append(sphere(f"Bulb_{i}", 0.07, (math.cos(a) * 4.62, math.sin(a) * 4.62, 2.38), glow, segments=8))
platform_mesh = join_visual("PlatformMesh", p)
platform = empty("Platform")
parent_keep(platform_mesh, platform)

def horse(i, a, mats):
    m = build_horse(f"HorseMesh_{i}", mats, coat_index=i % 2)
    r = 2.9
    pivot = empty(f"Horse_{i}", (math.cos(a) * r, math.sin(a) * r, 1.05))
    m.location = pivot.location
    m.rotation_euler = (0, 0, a + math.pi)  # head (built toward -Y) leads the counter-clockwise turn
    parent_keep(m, pivot)
    parent_keep(pivot, platform)
    key_bob(pivot, frames, cycles=4, amplitude=0.22, phase=i * 0.7)


for i in range(8):
    horse(i, (i + 0.5) / 8 * 2 * math.pi, mats)

# Boardable slot in the gap at angle 0: an empty the runtime mounts carousel_horse.glb + the rider on.
# Same radius, facing and bob as the baked horses so the ridden horse moves in step with them.
ride = empty("RideMount_0", (2.9, 0, 1.05))
ride.rotation_euler = (0, 0, math.pi)
parent_keep(ride, platform)
key_bob(ride, frames, cycles=4, amplitude=0.22, phase=-0.35)

key_spin(platform, 2, frames, turns=1.0)

collider("Pole", (0.6, 0.6, 3.2), (0, 0, 1.6))
export_glb(out_path(), animated=True)
