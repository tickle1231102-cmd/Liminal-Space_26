"""Noren (men's side): indigo cotton curtain with a brush-painted white '男'. Built by
art/blender/lib/noren_common.py — three swaying panels on a rod, origin = rod center (Three).
No collider — the player walks through. Women's side: noren_women.py ('女' on madder red)."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import out_path  # noqa: E402
from noren_common import build_noren  # noqa: E402


def glyph_otoko(stroke, cx):
    # 男 = 田 over 力. u is stretched ~3.3x against v on this image, so x offsets stay small.
    # 田: left side, top+right side (one turning stroke), centre cross, bottom
    L, R, T, B = cx - 0.045, cx + 0.045, 0.15, 0.45
    stroke([(L, T), (L - 0.002, (T + B) / 2), (L, B)], 0.026, taper=False)
    stroke([(L, T), (cx, T - 0.004), (R, T), (R + 0.002, (T + B) / 2), (R - 0.002, B + 0.01)], 0.026)
    stroke([(cx, T), (cx + 0.001, (T + B) / 2), (cx, B)], 0.024, taper=False)
    stroke([(L, (T + B) / 2), (cx, (T + B) / 2 - 0.004), (R, (T + B) / 2)], 0.024, taper=False)
    stroke([(L, B), (cx, B - 0.004), (R, B)], 0.026, taper=False)
    # 力: long bar turning down into a hooked tail, then the sweeping ノ through it
    stroke([(cx - 0.07, 0.58), (cx + 0.0, 0.575), (cx + 0.065, 0.57), (cx + 0.062, 0.7), (cx + 0.05, 0.82), (cx + 0.03, 0.86), (cx + 0.012, 0.83)], 0.03)
    stroke([(cx - 0.002, 0.47), (cx - 0.006, 0.62), (cx - 0.03, 0.76), (cx - 0.075, 0.87)], 0.03)


build_noren(out_path(), dye=(0.07, 0.11, 0.22), glyph=glyph_otoko)
