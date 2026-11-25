"""Sauna-baked egg (brown shell), 4.4 cm across, 5.8 cm long along x. Origin = centre (runtime: ball collider)."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403
from quality import finish, export_pbr_glb  # noqa: E402
import jjim_common as j  # noqa: E402
from jjim_common import P, tbox, tcyl, torus  # noqa: E402

reset_scene()
shell = j.flat("EggBrown", (0.5, 0.33, 0.2), 0.55)
e = sphere("Egg", 0.022, P(0, 0, 0), shell, segments=16)
e.scale = (1.32, 1.0, 1.0)
finish([e], name="Egg", bevel_width=0, uv=False)
export_pbr_glb(out_path())
