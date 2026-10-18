"""Noren (men's side): indigo cotton curtain with a brush-painted white 'ゆ'. Built by
art/blender/lib/noren_common.py — three swaying panels on a rod, origin = rod center (Three).
No collider — the player walks through."""
import math, os, sys
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import out_path  # noqa: E402
from noren_common import build_noren  # noqa: E402


def glyph_yu(stroke, cx):
    # 'ゆ': left stem with a hook, big right bowl, centre stroke that drops and sweeps left
    stroke([(cx - 0.12, 0.28), (cx - 0.125, 0.45), (cx - 0.12, 0.62), (cx - 0.1, 0.7), (cx - 0.08, 0.64)], 0.035)
    bowl = [(cx - 0.08, 0.42)] + [(cx + 0.02 + 0.1 * math.cos(a), 0.47 + 0.17 * math.sin(a)) for a in np.linspace(-math.pi * 0.95, math.pi * 0.55, 14)]
    stroke(bowl, 0.032)
    stroke([(cx + 0.0, 0.18), (cx + 0.01, 0.4), (cx + 0.0, 0.62), (cx - 0.03, 0.78), (cx - 0.09, 0.86)], 0.034)


build_noren(out_path(), dye=(0.07, 0.11, 0.22), glyph=glyph_yu)
