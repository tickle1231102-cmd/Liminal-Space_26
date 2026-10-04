"""Shoe locker bank: 1.4 deep (X) x 1.9 tall x 3.4 long (Y=Three Z). Cubbies open toward +X."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403

reset_scene()
steel = material("LockerSteel", (0.28, 0.35, 0.38), roughness=0.55, metallic=0.25)
inner = material("LockerInner", (0.04, 0.05, 0.06), roughness=0.9)
shoe = [material("ShoeWhite", (0.8, 0.8, 0.78), roughness=0.7), material("ShoeBlue", (0.1, 0.15, 0.35), roughness=0.7)]
box("Back", (1.2, 3.4, 1.9), (-0.1, 0, 0.95), steel)
box("Inset", (0.02, 3.3, 1.8), (0.51, 0, 0.95), inner)
cols, rows = 8, 6
for c in range(cols + 1):
    box(f"V_{c}", (0.2, 0.03, 1.8), (0.6, -1.65 + c * 3.3 / cols, 0.95), steel)
for r in range(rows + 1):
    box(f"H_{r}", (0.2, 3.3, 0.03), (0.6, 0, 0.05 + r * 1.8 / rows), steel)
import random
rnd = random.Random(7)
for c in range(cols):
    for r in range(rows):
        if rnd.random() < 0.18:  # a few pairs left behind
            y = -1.65 + (c + 0.5) * 3.3 / cols
            box(f"Shoe_{c}_{r}", (0.26, 0.24, 0.1), (0.48, y, 0.12 + r * 0.3), shoe[(c + r) % 2])
join_visual("ShoeLocker")
collider("Body", (1.4, 3.4, 1.9), (0, 0, 0.95))
export_glb(out_path())
