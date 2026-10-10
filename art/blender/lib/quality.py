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
    """rgba rows are bottom-up (row 0 = V 0), matching Blender pixel order."""
    h, w = rgba.shape[:2]
    img = bpy.data.images.new(name, w, h, alpha=False, float_buffer=False)
    if not srgb:
        img.colorspace_settings.name = "Non-Color"
    img.pixels.foreach_set(np.ascontiguousarray(rgba, dtype=np.float32).ravel())
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


def _periodic_noise(X, Y, period, octaves, rng, amp=1.0):
    """Sum of sines with integer frequencies: tiles seamlessly over `period`."""
    out = np.zeros_like(X)
    k = 2 * np.pi / period
    for o in range(octaves):
        fx, fy = rng.randint(1, 4 + 3 * o, size=2)
        ph = rng.uniform(0, 2 * np.pi, size=2)
        out += amp / (o + 1) * np.sin(k * fx * X + ph[0]) * np.cos(k * fy * Y + ph[1])
    return out


def wood_textures(name, size=1024, period=1.0, plank=0.125, gap=0.002,
                  color=(0.42, 0.27, 0.15), jitter=0.12, gloss=0.42, seed=7, grain=1.0):
    """Vertical-grain planks (grain runs along V). Lacquered: medium gloss, grain shows in normal."""
    rng = np.random.RandomState(seed)
    px = period / size
    u = (np.arange(size) + 0.5) * px
    X, Y = np.meshgrid(u, u)
    n_pl = round(period / plank)
    idx = np.floor(X / plank).astype(int) % n_pl
    tone = 1 + rng.uniform(-jitter, jitter, n_pl)
    phase = rng.uniform(0, 10, n_pl)
    warp = _periodic_noise(X, Y, period, 3, rng, 0.02)
    # growth rings: stripes across U, warped along V, different per plank
    rings = np.sin((X * 90 * grain + warp * 8 + phase[idx]) * 2 * np.pi / 3)
    fine = _periodic_noise(X * 1, Y, period, 4, rng, 1.0)
    g = 0.5 + 0.5 * rings
    shade = (0.82 + 0.18 * g + 0.05 * fine)[..., None]
    rgb = np.array(color) * tone[idx][..., None] * shade
    edge = np.minimum(X % plank, plank - X % plank)
    in_pl = edge > gap / 2
    rgb = np.where(in_pl[..., None], rgb, np.array(color) * 0.35)
    rgb = np.clip(rgb, 0, 1)

    hz = np.where(in_pl, 0.0004 * g + 0.0006 * np.clip(edge / 0.003, 0, 1), 0.0)
    gx = (np.roll(hz, -1, 1) - np.roll(hz, 1, 1)) / (2 * px)
    gy = (np.roll(hz, -1, 0) - np.roll(hz, 1, 0)) / (2 * px)
    n = np.dstack([-gx, -gy, np.ones_like(gx)])
    n /= np.linalg.norm(n, axis=2, keepdims=True)
    rough = np.clip(np.where(in_pl, gloss + 0.12 * (1 - g), 0.9), 0, 1)

    def rgba(c):
        c = c if c.ndim == 3 else np.dstack([c, c, c])
        return np.dstack([c, np.ones(c.shape[:2])])

    return {
        "color": _image(f"{name}_Color", rgba(rgb)),
        "normal": _image(f"{name}_Normal", rgba(n * 0.5 + 0.5), srgb=False),
        "rough": _image(f"{name}_Rough", rgba(rough), srgb=False),
    }


def image_textures(name, rgb, tile=None, period=None, gloss=0.12, grout=0.003,
                   grout_color=(0.7, 0.7, 0.68), edge=0.004):
    """Non-tiling painted image (e.g. a mural), optionally cut into glazed tiles of `tile` m over a
    surface `period` = (width, height) m. rgb: float array (H, W, 3), row 0 = top."""
    h, w = rgb.shape[:2]
    rgb = rgb[::-1].copy()  # row 0 = bottom, matching V
    rough = np.full((h, w), gloss)
    nrm = np.zeros((h, w, 3))
    nrm[..., 2] = 1
    if tile:
        X = (np.arange(w) + 0.5) / w * period[0]
        Y = (np.arange(h) + 0.5) / h * period[1]
        X, Y = np.meshgrid(X, Y)
        dx = np.minimum(X % tile, tile - X % tile)
        dy = np.minimum(Y % tile, tile - Y % tile)
        d = np.minimum(dx, dy) - grout / 2
        inside = d > 0
        t = np.clip(d / edge, 0, 1)
        height = np.where(inside, np.sqrt(1 - (1 - t) ** 2), 0.0) * 0.0015
        pxm = period[0] / w
        gx = np.gradient(height, axis=1) / pxm
        gy = np.gradient(height, axis=0) / pxm
        nrm = np.dstack([-gx, -gy, np.ones_like(gx)])
        nrm /= np.linalg.norm(nrm, axis=2, keepdims=True)
        rgb = np.where(inside[..., None], rgb * (0.94 + 0.06 * t[..., None]), np.array(grout_color))
        rough = np.where(inside, gloss, 0.85)

    def rgba(c):
        c = c if c.ndim == 3 else np.dstack([c, c, c])
        return np.dstack([c, np.ones(c.shape[:2])])

    out = {"color": _image(f"{name}_Color", rgba(np.clip(rgb, 0, 1)))}
    out["normal"] = _image(f"{name}_Normal", rgba(nrm * 0.5 + 0.5), srgb=False)
    out["rough"] = _image(f"{name}_Rough", rgba(rough), srgb=False)
    return out


def planar_uv(obj, axes=(0, 2), origin=(0.0, 0.0), size=(1.0, 1.0)):
    """Project onto two object-space axes, mapping origin..origin+size to 0..1 (for one-off images)."""
    me = obj.data
    uv = me.uv_layers.active or me.uv_layers.new(name="UVMap")
    for poly in me.polygons:
        for li in poly.loop_indices:
            p = obj.matrix_world @ me.vertices[me.loops[li].vertex_index].co
            uv.data[li].uv = ((p[axes[0]] - origin[0]) / size[0], (p[axes[1]] - origin[1]) / size[1])


def finish(objs, period=1.0, bevel_width=0.006, uv=True, name="Model"):
    """Common tail for prop scripts: world-scaled UVs, bevel+weighted normals applied, join visuals.
    Objects whose name starts with COL_ are left alone (colliders)."""
    bpy.context.view_layer.update()
    for o in objs:
        if o.name.startswith("COL_") or o.type != "MESH":
            continue
        bpy.ops.object.select_all(action="DESELECT")
        bpy.context.view_layer.objects.active = o
        o.select_set(True)
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        if uv and not o.get("keep_uv"):
            box_uv(o, period)
        # 25 cm 미만 소품 부품(열쇠패·병·손잡이)은 베벨이 보이지 않고 정점만 늘린다
        if bevel_width and max(o.dimensions) >= 0.25:
            bevel(o, width=bevel_width, segments=2)
            for m in list(o.modifiers):
                bpy.ops.object.modifier_apply(modifier=m.name)
    from common import join_visual
    return join_visual(name, [o for o in objs if o.type == "MESH" and not o.name.startswith("COL_")])


def plaster_textures(name, size=1024, period=1.0, color=(0.78, 0.75, 0.68), grain=1.0,
                     rough=0.85, seed=19, pits=0.0):
    """Seamless troweled plaster / concrete: low-frequency mottling + fine grain in the normal.
    pits > 0 adds small dark pores (concrete)."""
    rng = np.random.RandomState(seed)
    px = period / size
    u = (np.arange(size) + 0.5) * px
    X, Y = np.meshgrid(u, u)
    low = _periodic_noise(X, Y, period, 5, rng, 1.0)
    # fine grain: hashed white noise blurred by a wrap-around box filter (seamless)
    w = rng.uniform(-1, 1, (size, size))
    for _ in range(2):
        w = (w + np.roll(w, 1, 0) + np.roll(w, -1, 0) + np.roll(w, 1, 1) + np.roll(w, -1, 1)) / 5
    fine = w / (np.abs(w).max() + 1e-6)
    shade = 1 + 0.05 * low + 0.03 * fine * grain
    if pits:
        pore = (rng.uniform(0, 1, (size, size)) < pits * 0.004)
        for _ in range(1):
            pore = pore | np.roll(pore, 1, 0) | np.roll(pore, 1, 1)
        shade = np.where(pore, shade * 0.6, shade)
    rgb = np.clip(np.array(color) * shade[..., None], 0, 1)
    hz = 0.0003 * fine * grain + 0.0004 * low
    gx = (np.roll(hz, -1, 1) - np.roll(hz, 1, 1)) / (2 * px)
    gy = (np.roll(hz, -1, 0) - np.roll(hz, 1, 0)) / (2 * px)
    n = np.dstack([-gx, -gy, np.ones_like(gx)])
    n /= np.linalg.norm(n, axis=2, keepdims=True)
    r = np.clip(rough + 0.06 * low, 0, 1)

    def rgba(c):
        c = c if c.ndim == 3 else np.dstack([c, c, c])
        return np.dstack([c, np.ones(c.shape[:2])])

    return {
        "color": _image(f"{name}_Color", rgba(rgb)),
        "normal": _image(f"{name}_Normal", rgba(n * 0.5 + 0.5), srgb=False),
        "rough": _image(f"{name}_Rough", rgba(r), srgb=False),
    }
