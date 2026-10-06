"""Opt-in high-quality helpers (bathhouse and later spaces). Existing park/school scripts don't
import this, so their output is unchanged.

  tile_textures(...)   seamless color/normal/roughness maps drawn with numpy (deterministic seed)
  pbr_material(...)    Principled BSDF wired to those maps (normal via Normal Map node)
  box_uv(obj, period)  world-scaled cube UVs: 1 UV unit = `period` meters, so tiles line up across modules
  bevel(obj, ...)      rounded edges + weighted normals (catches highlights instead of hard box edges)
  export_pbr_glb(...)  glTF with WebP textures, no AO-into-albedo bake (keeps maps tileable)
"""
import bpy
import numpy as np


def _image(name, rgba, srgb=True):
    h, w = rgba.shape[:2]
    img = bpy.data.images.new(name, w, h, alpha=False, float_buffer=False)
    if not srgb:
        img.colorspace_settings.name = "Non-Color"
    img.pixels.foreach_set(np.ascontiguousarray(rgba[::-1], dtype=np.float32).ravel())
    img.pack()
    return img


def tile_textures(name, size=1024, period=1.0, tile=(0.125, 0.125), grout=0.003,
                  colors=((0.2, 0.35, 0.45),), grout_color=(0.75, 0.74, 0.7),
                  jitter=0.05, gloss=0.12, grout_rough=0.85, edge=0.006, seed=1):
    """Square tiles on a seamless `period` x `period` m sheet. `tile` (w, h) must divide `period`.
    Height field: flat glazed tile with a rounded `edge`, recessed grout; normals from its gradient."""
    rng = np.random.RandomState(seed)
    px = period / size
    nx, ny = round(period / tile[0]), round(period / tile[1])
    u = (np.arange(size) + 0.5) * px
    X, Y = np.meshgrid(u, u)
    cx, cy = np.floor(X / tile[0]).astype(int) % nx, np.floor(Y / tile[1]).astype(int) % ny
    # distance (m) from the nearest tile border
    dx = np.minimum(X % tile[0], tile[0] - X % tile[0])
    dy = np.minimum(Y % tile[1], tile[1] - Y % tile[1])
    d = np.minimum(dx, dy) - grout / 2
    in_tile = d > 0
    t = np.clip(d / edge, 0, 1)
    height = np.where(in_tile, np.sqrt(1 - (1 - t) ** 2), 0.0)  # quarter-round bullnose per tile

    # per-tile color: palette pick + slight value jitter + faint glaze pooling toward edges
    pal = np.array(colors)
    pick = rng.randint(0, len(pal), size=(ny, nx))
    shade = 1 + rng.uniform(-jitter, jitter, size=(ny, nx))
    base = pal[pick[cy, cx]] * shade[cy, cx][..., None]
    base = base * (0.92 + 0.08 * t[..., None])
    rgb = np.where(in_tile[..., None], base, np.array(grout_color))
    # wrap-safe low-frequency mottling (sum of periodic sines) so large walls don't look flat
    k = 2 * np.pi / period
    mott = 0.025 * (np.sin(k * X * 3 + 1.3) * np.sin(k * Y * 2 + 0.4) + np.sin(k * (X + Y) * 5))
    rgb = np.clip(rgb * (1 + mott[..., None]), 0, 1)

    # normals: central differences with wrap-around (seamless)
    depth = 0.0015  # m — grout recess
    hz = height * depth
    gx = (np.roll(hz, -1, axis=1) - np.roll(hz, 1, axis=1)) / (2 * px)
    gy = (np.roll(hz, -1, axis=0) - np.roll(hz, 1, axis=0)) / (2 * px)
    n = np.dstack([-gx, -gy, np.ones_like(gx)])
    n /= np.linalg.norm(n, axis=2, keepdims=True)
    nrm = n * 0.5 + 0.5

    rough = np.where(in_tile, gloss + 0.05 * (1 - t), grout_rough)
    rough = np.clip(rough + 0.02 * mott, 0, 1)

    def rgba(c):
        c = c if c.ndim == 3 else np.dstack([c, c, c])
        return np.dstack([c, np.ones(c.shape[:2])])

    return {
        "color": _image(f"{name}_Color", rgba(rgb)),
        "normal": _image(f"{name}_Normal", rgba(nrm), srgb=False),
        "rough": _image(f"{name}_Rough", rgba(rough), srgb=False),
    }


def pbr_material(name, maps, metallic=0.0, normal_strength=1.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    bsdf.inputs["Metallic"].default_value = metallic

    def tex(img):
        n = nt.nodes.new("ShaderNodeTexImage")
        n.image = img
        return n

    nt.links.new(tex(maps["color"]).outputs["Color"], bsdf.inputs["Base Color"])
    if "rough" in maps:
        # glTF packs roughness into G of metallicRoughness; exporter handles a direct link
        sep = nt.nodes.new("ShaderNodeSeparateColor")
        nt.links.new(tex(maps["rough"]).outputs["Color"], sep.inputs["Color"])
        nt.links.new(sep.outputs["Green"], bsdf.inputs["Roughness"])
    if "normal" in maps:
        nm = nt.nodes.new("ShaderNodeNormalMap")
        nm.inputs["Strength"].default_value = normal_strength
        nt.links.new(tex(maps["normal"]).outputs["Color"], nm.inputs["Color"])
        nt.links.new(nm.outputs["Normal"], bsdf.inputs["Normal"])
    return mat


def box_uv(obj, period=1.0, offset=(0.0, 0.0, 0.0)):
    """Cube projection in object space (apply transforms first). U runs along the face's
    horizontal axis, V upward, so tile rows stay level on walls."""
    me = obj.data
    uv = me.uv_layers.active or me.uv_layers.new(name="UVMap")
    co = [obj.matrix_world @ v.co for v in me.vertices]
    for poly in me.polygons:
        n = obj.matrix_world.to_3x3() @ poly.normal
        ax = max(range(3), key=lambda i: abs(n[i]))
        for li in poly.loop_indices:
            p = co[me.loops[li].vertex_index]
            x, y, z = (p[i] - offset[i] for i in range(3))
            if ax == 2:      # floor/ceiling: X, Y
                u, v = x, y
            elif ax == 0:    # faces along Y
                u, v = (-y if n[0] > 0 else y), z
            else:            # faces along X
                u, v = (x if n[1] < 0 else -x), z
            uv.data[li].uv = (u / period, v / period)


def bevel(obj, width=0.006, segments=2, angle_deg=40):
    import math
    m = obj.modifiers.new("Bevel", "BEVEL")
    m.width = width
    m.segments = segments
    m.limit_method = "ANGLE"
    m.angle_limit = math.radians(angle_deg)
    m.harden_normals = True
    for p in obj.data.polygons:
        p.use_smooth = True
    wn = obj.modifiers.new("WeightedNormal", "WEIGHTED_NORMAL")
    wn.keep_sharp = True
    return obj


def export_pbr_glb(path, quality=88):
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        export_yup=True,
        export_apply=True,
        export_extras=True,
        export_cameras=False,
        export_lights=False,
        export_animations=False,
        export_image_format="WEBP",
        export_image_quality=quality,
    )
    print(f"[asset] wrote {path}")
