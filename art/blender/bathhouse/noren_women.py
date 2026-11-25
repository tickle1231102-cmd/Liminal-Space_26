"""Noren (women's side): madder-red cotton curtain with a brush-painted white '女'. Same cloth,
rod and panel nodes as noren.py (art/blender/lib/noren_common.py). No collider."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import out_path  # noqa: E402
from noren_common import build_noren  # noqa: E402


def glyph_onna(stroke, cx):
    # 女: く-shaped first stroke (down-left, then a long sweep down-right), a long ノ from the
    # upper right down to the lower left, and the horizontal bar through the middle
    stroke([(cx - 0.015, 0.16), (cx - 0.05, 0.34), (cx - 0.085, 0.5), (cx - 0.04, 0.6), (cx + 0.04, 0.72), (cx + 0.1, 0.84)], 0.034)
    stroke([(cx + 0.075, 0.32), (cx + 0.05, 0.5), (cx + 0.0, 0.66), (cx - 0.06, 0.78), (cx - 0.12, 0.86)], 0.033)
    stroke([(cx - 0.14, 0.5), (cx - 0.02, 0.49), (cx + 0.08, 0.475), (cx + 0.14, 0.47)], 0.03)


build_noren(out_path(), dye=(0.36, 0.07, 0.07), glyph=glyph_onna, seed=5)
