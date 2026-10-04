"""Ride ticket stub, slightly bent."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403

reset_scene()
red = material("TicketRed", (0.8, 0.22, 0.3), roughness=0.7)
cream = material("TicketCream", (0.95, 0.9, 0.75), roughness=0.7)
box("Stub", (0.2, 0.09, 0.01), (0, 0, 0), red)
box("Strip", (0.02, 0.09, 0.012), (0.06, 0, 0.001), cream)
bpy.ops.object.select_all(action="SELECT")
join_visual("Ticket")
export_glb(out_path())
