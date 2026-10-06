"""Mt. Fuji tile mural (penki-e on 20 cm glazed tiles), 18 x 4.4 m. Painted procedurally:
sky, clouds, Fuji with a jagged snow cap, side hills, a lake with wave lines, pines, a sail.
Faces +Z, origin = panel center. Runtime mounts it on the bath hall back wall."""
import math, os, sys
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403
from quality import image_textures, pbr_material, planar_uv, export_pbr_glb  # noqa: E402
from bath_common import tbox, P  # noqa: E402

reset_scene()
MW, MH = 18.0, 4.4
w, h = 2048, 500
ys, xs = np.mgrid[0:h, 0:w].astype(float)
u, v = xs / w, ys / h          # v = 0 top
rgb = np.zeros((h, w, 3))
rng = np.random.RandomState(2)


def mix(a, b, t):
    t = np.clip(t, 0, 1)[..., None]
    return np.array(a) * (1 - t) + np.array(b) * t


def put(mask, color, alpha=1.0):
    global rgb
    m = (np.clip(mask, 0, 1) * alpha)[..., None]
    rgb = rgb * (1 - m) + np.array(color) * m


HOR = 0.7
rgb[:] = mix((0.2, 0.42, 0.68), (0.82, 0.9, 0.9), v / HOR)
# clouds: soft horizontal ellipses
for _ in range(9):
    cx, cy, rx, ry = rng.uniform(0.02, 0.98), rng.uniform(0.08, 0.35), rng.uniform(0.04, 0.09), rng.uniform(0.02, 0.04)
    d = ((u - cx) / rx) ** 2 + ((v - cy) / ry) ** 2
    put(1 - d, (0.97, 0.97, 0.95), 0.85)
# side hills (far, blue-green)
for cx, rx, top in ((0.12, 0.2, 0.5), (0.88, 0.22, 0.48), (0.3, 0.12, 0.6), (0.72, 0.13, 0.6)):
    hill = top + (HOR - top) * ((u - cx) / rx) ** 2
    put((v > hill) & (v < HOR), (0.25, 0.42, 0.45))
# Fuji: concave flanks
c, peak, halfw = 0.5, 0.12, 0.27
prof = peak + (HOR - peak) * (np.abs(u - c) / halfw) ** 0.72
mount = (v > prof) & (v < HOR)
# lit from the left: lighter west flank, deeper east flank
put(mount, (0.2, 0.28, 0.5))
side = np.clip((c - u) / 0.12, -1, 1)  # +1 west, -1 east, smooth across the ridge
put(mount * np.clip(side, 0, 1), (0.3, 0.38, 0.6), 0.55)
put(mount * np.clip(-side, 0, 1), (0.14, 0.2, 0.4), 0.35)
put(mount * (v - prof < 0.02) * 0.5, (0.32, 0.4, 0.62))  # light rim along the ridge
# snow line with gullies: fingers run down where the streak wave peaks
line = peak + 0.14 + 0.025 * np.sin(u * 230) + 0.015 * np.sin(u * 97 + 1)
finger = np.clip(np.sin(u * 170 + 0.5), 0, 1) ** 3 * 0.09
snow = mount & (v < line + finger)
put(snow, (0.96, 0.97, 0.98))
# lake + wave lines + faint reflection
lake = (v >= HOR) & (v < 0.86)
put(lake, (0.2, 0.45, 0.62))
waves = lake & (np.sin(v * 420 + np.sin(u * 60) * 2) > 0.93)
put(waves, (0.85, 0.92, 0.95), 0.8)
refl = lake & (np.abs(u - c) < (0.86 - v) * 1.4) & (v < 0.8)
put(refl, (0.6, 0.7, 0.8), 0.25)
# shore + pines
put(v >= 0.86, (0.24, 0.45, 0.26))
for px0 in list(np.linspace(0.01, 0.16, 6)) + list(np.linspace(0.84, 0.99, 6)):
    hgt = rng.uniform(0.25, 0.42)
    base = 0.95
    for k in range(3):
        top = base - hgt * (1 - k * 0.28)
        wid = 0.011 * (1 + k * 0.45)
        tri = (v > top) & (v < base - hgt * k * 0.25) & (np.abs(u - px0) < (v - top) * wid / (hgt * 0.4))
        put(tri, (0.1, 0.26, 0.16))
    put((np.abs(u - px0) < 0.002) & (v > base - 0.05) & (v < 1), (0.3, 0.2, 0.12))

maps = image_textures("Mural", rgb, tile=0.2, period=(MW, MH), gloss=0.1)
mat = pbr_material("Mural", maps)
panel = tbox("Panel", (MW, MH, 0.02), (0, 0, 0), mat)
bpy.context.view_layer.update()
# front face spans x -9..9, Blender z -2.2..2.2
planar_uv(panel, axes=(0, 2), origin=(-MW / 2, -MH / 2), size=(MW, MH))
frame = material("MuralFrame", (0.08, 0.14, 0.24), roughness=0.15)
for s in (-1, 1):
    tbox(f"FrameH{s}", (MW + 0.16, 0.08, 0.04), (0, s * (MH / 2 + 0.04), 0.01), frame)
    tbox(f"FrameV{s}", (0.08, MH, 0.04), (s * (MW / 2 + 0.04), 0, 0.01), frame)
export_pbr_glb(out_path())
