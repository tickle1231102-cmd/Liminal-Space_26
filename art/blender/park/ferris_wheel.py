"""Midway ferris wheel. Double rim (front/back, 1.2 m apart) on an axle 8 m up, held by two
A-frames outside the rims. Open gondola cars hang *between* the rims so nothing crosses their sweep;
the lowest cabin clears the ground by ~0.4 m. Boarding deck + operator booth sit in front.

Animated (45 s loop): "Wheel" spins about the axle, each "Gondola_i" counter-rotates to hang level.
Blender -Y = Three +Z (the side facing the midway path)."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403

reset_scene()
frames = loop_timeline(45)

steel = material("FerrisSteel", (0.14, 0.17, 0.24), roughness=0.35, metallic=0.65)
rim = material("FerrisRim", (0.32, 0.37, 0.48), roughness=0.28, metallic=0.7)
neon = material("FerrisNeon", (0.37, 0.78, 0.91), roughness=0.4, emission=(0.37, 0.78, 0.91), strength=3.0)
hubm = material("FerrisHub", (0.53, 0.58, 0.68), roughness=0.2, metallic=0.8)
base = material("FerrisBase", (0.025, 0.03, 0.045), roughness=0.5, metallic=0.4)
roofm = material("GondolaRoof", (0.8, 0.84, 0.9), roughness=0.5, metallic=0.3)
COLORS = [(0.8, 0.11, 0.17), (0.11, 0.58, 0.8), (0.89, 0.66, 0.15), (0.48, 0.79, 0.57),
          (0.57, 0.36, 0.99), (0.93, 0.42, 0.2), (1.0, 0.27, 0.36), (0.38, 0.65, 0.95)]
HUB_Z, R = 8.0, 6.2
RIM_Y = 0.6          # rims at y = ±RIM_Y
LEG_Y = 1.15         # A-frames outside the rims
LEG_SPREAD = 3.2     # foot distance from center along X
CAB = (1.0, 0.8, 1.2)  # gondola cabin (x, y between rims, z)

# --- static frame
static = []
leg_len = math.hypot(LEG_SPREAD, HUB_Z)
lean = math.atan2(LEG_SPREAD, HUB_Z)
for y in (-LEG_Y, LEG_Y):
    for sx in (-1, 1):
        leg = box(f"Leg_{sx}_{y}", (0.25, 0.25, leg_len), (sx * LEG_SPREAD / 2, y, HUB_Z / 2), steel)
        leg.rotation_euler = (0, sx * -lean, 0)  # foot at ±LEG_SPREAD, top meets the axle
        static.append(leg)
    static.append(box(f"Brace_{y}", (LEG_SPREAD, 0.15, 0.15), (0, y, HUB_Z * 0.35), steel))
    static.append(box(f"Footing_{y}", (LEG_SPREAD * 2 + 0.8, 0.5, 0.2), (0, y, 0.1), base))
axle = cylinder("Axle", 0.18, LEG_Y * 2 + 0.4, (0, 0, HUB_Z), hubm, verts=12)
axle.rotation_euler = (math.pi / 2, 0, 0)
static.append(axle)
# boarding deck in front of the lowest cabin + operator booth to the side
static.append(box("Deck", (3.2, 1.6, 0.3), (0, -2.1, 0.15), base))
static.append(box("Booth", (1.6, 1.4, 2.0), (-4.4, -2.2, 1.0), base))
static.append(box("BoothRoof", (1.9, 1.7, 0.12), (-4.4, -2.2, 2.06), steel))
join_visual("FerrisFrame", static)

# --- rotating wheel, built around the origin then lifted onto the axle
wheel = empty("Wheel")
parts = []
for y in (-RIM_Y, RIM_Y):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=0.12, major_segments=64,
                                     minor_segments=10, location=(0, y, 0), rotation=(math.pi / 2, 0, 0))
    t = bpy.context.active_object; t.name = f"Rim_{y}"; t.data.materials.append(rim); parts.append(t)
    for i in range(8):
        a = i / 8 * 2 * math.pi
        sp = box(f"Spoke_{y}_{i}", (R, 0.06, 0.06), (math.cos(a) * R / 2, y, math.sin(a) * R / 2), steel)
        sp.rotation_euler = (0, -a, 0)
        parts.append(sp)
bpy.ops.mesh.primitive_torus_add(major_radius=5.4, minor_radius=0.06, major_segments=64,
                                 minor_segments=8, location=(0, -RIM_Y - 0.1, 0), rotation=(math.pi / 2, 0, 0))
n = bpy.context.active_object; n.name = "NeonRing"; n.data.materials.append(neon); parts.append(n)
hub = cylinder("Hub", 0.5, RIM_Y * 2 + 0.3, (0, 0, 0), hubm, verts=16)
hub.rotation_euler = (math.pi / 2, 0, 0)
parts.append(hub)
for i in range(8):  # cross bars the gondolas hang from
    a = i / 8 * 2 * math.pi + math.pi / 8
    bar = cylinder(f"HangBar_{i}", 0.05, RIM_Y * 2, (math.cos(a) * R, 0, math.sin(a) * R), steel, verts=8)
    bar.rotation_euler = (math.pi / 2, 0, 0)
    parts.append(bar)
wheel_mesh = join_visual("WheelMesh", parts)
parent_keep(wheel_mesh, wheel)

for i in range(8):
    a = i / 8 * 2 * math.pi + math.pi / 8
    px, pz = math.cos(a) * R, math.sin(a) * R
    pivot = empty(f"Gondola_{i}", (px, 0, pz))
    cab = material(f"Gondola_{i}", COLORS[i], roughness=0.4, metallic=0.15, emission=COLORS[i], strength=0.5)
    # Open car (riders look out): floor, waist-high panels, corner posts, roof
    top = pz - 0.34
    bottom = top - CAB[2]
    g = [box("Hanger", (0.06, 0.06, 0.3), (px, 0, pz - 0.15), steel),
         box("Roof", (CAB[0] + 0.1, CAB[1] + 0.06, 0.08), (px, 0, top + 0.04), roofm),
         box("Floor", (CAB[0], CAB[1], 0.06), (px, 0, bottom + 0.03), cab)]
    wall = 0.5
    for sx in (-1, 1):
        g.append(box(f"SideX_{sx}", (0.04, CAB[1], wall), (px + sx * CAB[0] / 2, 0, bottom + wall / 2), cab))
        g.append(box(f"SideY_{sx}", (CAB[0], 0.04, wall), (px, sx * CAB[1] / 2, bottom + wall / 2), cab))
        for sy in (-1, 1):
            g.append(box(f"Post_{sx}_{sy}", (0.05, 0.05, CAB[2]), (px + sx * CAB[0] / 2, sy * CAB[1] / 2, bottom + CAB[2] / 2), steel))
    g.append(box("Bench", (CAB[0] - 0.1, 0.3, 0.06), (px, CAB[1] / 2 - 0.2, bottom + 0.42), roofm))
    parent_keep(join_visual(f"GondolaMesh_{i}", g), pivot)
    parent_keep(pivot, wheel)
    key_spin(pivot, 1, frames, turns=1.0)  # counter-rotation keeps the cabin level

wheel.location.z = HUB_Z
key_spin(wheel, 1, frames, turns=-1.0)

for y in (-LEG_Y, LEG_Y):
    collider(f"Footing_{y}", (LEG_SPREAD * 2 + 0.8, 0.5, 0.4), (0, y, 0.2))
collider("Deck", (3.2, 1.6, 0.3), (0, -2.1, 0.15))
collider("Booth", (1.6, 1.4, 2.0), (-4.4, -2.2, 1.0))
export_glb(out_path(), animated=True)
