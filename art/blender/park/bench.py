"""Park bench — stage-0 pipeline test asset (plaza)."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403

reset_scene()

wood = material("BenchWood", (0.36, 0.22, 0.14), roughness=0.75)
iron = material("BenchIron", (0.08, 0.09, 0.11), roughness=0.4, metallic=0.8)

L = 1.8  # bench length (Blender X)
for i, y in enumerate((-0.16, 0.0, 0.16)):
    box(f"Seat_{i}", (L, 0.13, 0.04), (0, y, 0.45), wood)
for i, z in enumerate((0.62, 0.78)):
    box(f"Back_{i}", (L, 0.035, 0.11), (0, 0.24, z), wood)

for side, x in (("L", -0.75), ("R", 0.75)):
    box(f"Leg{side}_front", (0.05, 0.05, 0.43), (x, -0.18, 0.215), iron)
    box(f"Leg{side}_rear", (0.05, 0.05, 0.86), (x, 0.25, 0.43), iron)
    box(f"Arm{side}", (0.05, 0.48, 0.04), (x + (0.02 if x > 0 else -0.02), 0.03, 0.66), iron)

join_visual("Bench")

# Physics proxies: seat slab + backrest slab
collider("Seat", (L, 0.5, 0.47), (0, 0.0, 0.235))
collider("Back", (L, 0.08, 0.45), (0, 0.25, 0.67))
anchor("Seat", (0.4, 0.0, 0.48))

export_glb(out_path())
