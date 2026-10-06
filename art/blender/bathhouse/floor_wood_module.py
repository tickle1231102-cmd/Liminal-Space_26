"""1 x 1 m floor module, top at z=0. Dressing-room lacquered planks (grain along Three Z)."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403
from quality import finish, export_pbr_glb  # noqa: E402
from bath_common import wood  # noqa: E402

reset_scene()
o = box("Floor", (1, 1, 0.2), (0, 0, -0.1), wood("light"))
finish([o], bevel_width=0, name="FloorWood")
export_pbr_glb(out_path())
