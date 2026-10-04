"""Ceiling fluorescent fixture (lit). The dead variant lives in fluorescent_dead.py."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403

import fixture_common
fixture_common.build(lit=True)
export_glb(out_path())
