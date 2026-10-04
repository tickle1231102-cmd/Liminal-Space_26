"""Gym wall module: 2 m along X, 6.6 m tall, 0.3 m thick — native gym height, so nothing is
stretched vertically. Both faces: navy crash pads (1.9 m, two 1 m panels), maroon school stripe,
painted concrete block above with mortar courses every 0.4 m."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403

reset_scene()
W, H, T = 2.0, 6.6, 0.3
PAD_H = 1.9
block = material("GymBlock", (0.5, 0.49, 0.44), roughness=0.92)
mortar = material("GymMortar", (0.36, 0.35, 0.31), roughness=0.95)
pad = material("GymPad", (0.04, 0.07, 0.16), roughness=0.6)
seam = material("GymPadSeam", (0.015, 0.02, 0.04), roughness=0.7)
stripe = material("GymStripe", (0.33, 0.06, 0.08), roughness=0.7)
base = material("GymBase", (0.06, 0.06, 0.07), roughness=0.6)

box("Block", (W, T, H), (0, 0, H / 2), block)
for s in (-1, 1):
    f = s * T / 2
    for i, x in enumerate((-0.5, 0.5)):
        box(f"Pad_{s}_{i}", (0.98, 0.06, PAD_H - 0.12), (x, f + s * 0.03, 0.12 + (PAD_H - 0.12) / 2), pad)
    box(f"PadSeamMid_{s}", (0.03, 0.065, PAD_H - 0.12), (0, f + s * 0.03, 0.12 + (PAD_H - 0.12) / 2), seam)
    box(f"PadCap_{s}", (W, 0.08, 0.04), (0, f + s * 0.04, PAD_H + 0.02), seam)
    box(f"Base_{s}", (W, 0.07, 0.12), (0, f + s * 0.035, 0.06), base)
    box(f"Stripe_{s}", (W, 0.012, 0.35), (0, f + s * 0.006, 2.35), stripe)
    z = PAD_H + 0.1
    k = 0
    while z < H - 0.05:
        if not (2.15 < z < 2.55):  # skip under the stripe
            box(f"Mortar_{s}_{k}", (W, 0.01, 0.02), (0, f + s * 0.005, z), mortar)
        z += 0.4
        k += 1
join_visual("GymWallModule")
export_glb(out_path())
