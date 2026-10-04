"""Midway ferris wheel (hub 7 m up). Animated: node "Wheel" spins about the axle,
each "Gondola_i" counter-rotates to hang level. One looping clip (45 s)."""
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
HUB_Z, R = 7.0, 6.2

# --- static: A-frame legs on both faces of the wheel, base booth, hub
static = [box("Base", (2.6, 2.6, 2.0), (0, 0, 1.0), base)]
for y in (-0.7, 0.7):
    for x, tilt in ((-1.2, 0.35), (1.2, -0.35)):
        leg = box(f"Leg_{x}_{y}", (0.25, 0.25, 8.0), (x, y, 3.5), steel)
        leg.rotation_euler = (0, -tilt, 0)
        static.append(leg)
axle = cylinder("Axle", 0.18, 1.8, (0, 0, HUB_Z), hubm, verts=12)
axle.rotation_euler = (math.pi / 2, 0, 0)
static.append(axle)
join_visual("FerrisFrame", static)

# --- rotating wheel: rim, neon ring, hub, spokes (wheel plane = Blender XZ)
parts = []
for name, major, minor, mat in (("Rim", R, 0.14, rim), ("NeonRing", 5.4, 0.07, neon)):
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor, major_segments=64,
                                     minor_segments=10, location=(0, 0, HUB_Z), rotation=(math.pi / 2, 0, 0))
    t = bpy.context.active_object; t.name = name; t.data.materials.append(mat); parts.append(t)
hub = cylinder("Hub", 0.45, 0.8, (0, 0, HUB_Z), hubm, verts=16)
hub.rotation_euler = (math.pi / 2, 0, 0)
parts.append(hub)
for i in range(8):
    a = i / 8 * 2 * math.pi
    sp = box(f"Spoke_{i}", (R, 0.06, 0.06), (math.cos(a) * R / 2, 0, HUB_Z + math.sin(a) * R / 2), steel)
    sp.rotation_euler = (0, -a, 0)
    parts.append(sp)
bpy.ops.object.select_all(action="DESELECT")
wheel_mesh = join_visual("WheelMesh", parts)
wheel = empty("Wheel", (0, 0, HUB_Z))
parent_keep(wheel_mesh, wheel)

# --- gondolas hang from pivots on the rim, in front of the wheel (Three +Z = Blender -Y)
for i in range(8):
    a = i / 8 * 2 * math.pi + math.pi / 8
    px, pz = math.cos(a) * R, HUB_Z + math.sin(a) * R
    pivot = empty(f"Gondola_{i}", (px, -0.55, pz))
    cab = material(f"Gondola_{i}", COLORS[i], roughness=0.4, metallic=0.15, emission=COLORS[i], strength=0.5)
    g = [box("Cabin", (1.05, 1.05, 1.25), (px, -0.55, pz - 0.75), cab),
         box("Roof", (1.15, 1.15, 0.08), (px, -0.55, pz - 0.08), roofm),
         box("Hanger", (0.06, 0.06, 0.2), (px, -0.55, pz), steel)]
    gm = join_visual(f"GondolaMesh_{i}", g)
    parent_keep(gm, pivot)
    parent_keep(pivot, wheel)
    key_spin(pivot, 1, frames, turns=1.0)   # counter-rotate: stays level

key_spin(wheel, 1, frames, turns=-1.0)

collider("Base", (2.6, 2.6, 2.0), (0, 0, 1.0))
export_glb(out_path(), animated=True)
