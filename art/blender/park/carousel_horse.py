"""Standalone boardable carousel horse (RideSeat). Origin at body center, head toward Three -Z."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403

from horse_common import build_horse, horse_materials  # noqa: E402
reset_scene()
build_horse("CarouselHorse", horse_materials(), coat_index=0, pole_length=2.2)
export_glb(out_path())
