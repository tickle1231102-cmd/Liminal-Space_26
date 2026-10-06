"""Glass-door milk fridge 1.0 x 1.8 x 0.8 m with bottled milk (plain, coffee, fruit).
Faces +Z, origin floor center. Interior light is emissive; runtime adds no lamp."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403
from quality import finish, export_pbr_glb  # noqa: E402
from bath_common import *  # noqa: E402,F403

reset_scene()
import random
rng = random.Random(8)
body = enamel((0.88, 0.88, 0.85), "FridgeBody")
glass = material("FridgeGlass", (0.75, 0.85, 0.9), roughness=0.05)
glass.blend_method = "BLEND"
glass.node_tree.nodes["Principled BSDF"].inputs["Alpha"].default_value = 0.18
milk = material("MilkGlass", (0.92, 0.9, 0.84), roughness=0.15)
caps = [enamel(c, n) for c, n in (((0.85, 0.2, 0.3), "CapPink"), ((0.45, 0.28, 0.14), "CapCoffee"), ((0.95, 0.75, 0.15), "CapFruit"))]
lamp = material("FridgeLamp", (1, 1, 1), emission=(0.85, 0.95, 1.0), strength=3.0)
sign = enamel((0.7, 0.08, 0.08), "FridgeSign")
o = []
W, H, D = 1.0, 1.8, 0.8
o.append(tbox("Back", (W, H, 0.05), (0, H / 2, -D / 2 + 0.025), body))
for s in (-1, 1):
    o.append(tbox(f"Side{s}", (0.05, H, D), (s * (W / 2 - 0.025), H / 2, 0), body))
o.append(tbox("Top", (W, 0.25, D), (0, H - 0.125, 0), body))
o.append(tbox("Bottom", (W, 0.15, D), (0, 0.075, 0), body))
o.append(tbox("Sign", (W - 0.1, 0.16, 0.01), (0, H - 0.125, D / 2 + 0.005), sign))
o.append(tbox("Lamp", (W - 0.14, 0.02, 0.04), (0, H - 0.27, 0.2), lamp))
for k, y in enumerate((0.15, 0.52, 0.89, 1.26)):
    o.append(tbox(f"Shelf{k}", (W - 0.1, 0.015, D - 0.12), (0, y, -0.03), enamel((0.6, 0.62, 0.62), "Wire")))
    for i in range(7):
        for j in range(3):
            if rng.random() < 0.18:
                continue  # gaps: some bottles already taken
            x, z = -0.38 + i * 0.125, -0.28 + j * 0.15
            o.append(tcyl(f"B{k}{i}{j}", 0.033, 0.17, (x, y + 0.093, z), milk, verts=14))
            o.append(tcyl(f"C{k}{i}{j}", 0.034, 0.012, (x, y + 0.183, z), caps[(i + j + k) % 3], verts=14))
o.append(tbox("Door", (W - 0.1, H - 0.4, 0.02), (0, 0.15 + (H - 0.4) / 2, D / 2 - 0.01), glass))
o.append(tbox("Handle", (0.03, 0.4, 0.04), (W / 2 - 0.1, 0.9, D / 2 + 0.02), chrome()))
tcol("Fridge", (W, H, D), (0, H / 2, 0))
finish(o, name="MilkFridge", bevel_width=0.003)
export_pbr_glb(out_path())
