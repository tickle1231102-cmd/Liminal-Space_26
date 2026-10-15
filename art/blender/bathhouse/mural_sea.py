"""Dawn seascape tile mural for the women's bath hall (penki-e on 20 cm glazed tiles), 18 x 4.4 m.
The women's-side counterpart of mural.py (Mt. Fuji): Matsushima-style rocky islets at sunrise.
Painted procedurally in flat penki-e colour fields: violet-to-gold sky with long pink clouds, a low
sun with a glitter column on the sea, hazy far islets and dark near ones with pines, a vermilion
torii standing in the water, far white sails, rocky shores with pines in the foreground.
Every islet and sail has a faint reflection on the water; the torii has none.
Faces +Z, origin = panel center. Runtime mounts it on the women's bath hall back wall."""
import math, os, sys
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403
from quality import image_textures, pbr_material, planar_uv, export_pbr_glb  # noqa: E402
from bath_common import tbox  # noqa: E402

reset_scene()
MW, MH = 18.0, 4.4
w, h = 2048, 500
PX = MW / w                      # ~8.8 mm per pixel; pixels are square to 0.2 %
rgb = np.zeros((h, w, 3))
rng = np.random.RandomState(26)
# painting coordinates: X metres from the left edge, Y metres down from the top edge
HOR = 0.62 * MH                  # horizon
SUN_X, SUN_R = 0.62 * MW, 0.34
SUN_Y = HOR - SUN_R - 0.07
TORII_X, TORII_Y = 0.3 * MW, HOR + 0.42


def mix(a, b, t):
    t = np.clip(t, 0, 1)[..., None]
    return np.array(a) * (1 - t) + np.array(b) * t


def lerp(a, b, t):
    return tuple(np.array(a) * (1 - t) + np.array(b) * t)


def put(sl, mask, color, alpha=1.0):
    m = (np.clip(mask, 0, 1) * alpha)[..., None]
    rgb[sl] = rgb[sl] * (1 - m) + np.asarray(color) * m


def soft(sd):
    """Signed distance in metres (> 0 inside) -> anti-aliased coverage."""
    return np.clip(sd / PX + 0.5, 0, 1)


def win(x0, x1, y0, y1, pad=6):
    """Pixel window over metres [x0, x1] x [y0, y1] -> (slice, X grid, Y grid), or None if off-panel."""
    i0, i1 = max(int(x0 / PX) - pad, 0), min(int(x1 / PX) + pad, w)
    j0, j1 = max(int(y0 / MH * h) - pad, 0), min(int(y1 / MH * h) + pad, h)
    if i1 <= i0 or j1 <= j0:
        return None
    J, I = np.mgrid[j0:j1, i0:i1].astype(float)
    return (slice(j0, j1), slice(i0, i1)), (I + 0.5) * PX, (J + 0.5) * MH / h


def grow(m, r=2):
    """Dilate a coverage mask by r pixels; painted under the fill it leaves an outline ring."""
    H, W = m.shape
    p = np.pad(m, r)
    out = m.copy()
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            if dx * dx + dy * dy <= r * r:
                out = np.maximum(out, p[r + dy:r + dy + H, r + dx:r + dx + W])
    return out


def ell_sd(dx, dy, a, b, k=1.0):
    """Approximate signed distance to an ellipse (radii a, b scaled by k), > 0 inside: the implicit
    value over its gradient, so long flat ellipses keep crisp ends."""
    q = np.sqrt((dx / a) ** 2 + (dy / b) ** 2)
    g = np.sqrt((dx / a ** 2) ** 2 + (dy / b ** 2) ** 2) / np.maximum(q, 1e-6)
    return (k - q) / np.maximum(g, 1e-6)


def ellipse(X, Y, cx, cy, a, b):
    return soft(ell_sd(X - cx, Y - cy, a, b))


def capsule(X, Y, ax, ay, bx, by, r):
    vx, vy = bx - ax, by - ay
    t = np.clip(((X - ax) * vx + (Y - ay) * vy) / (vx * vx + vy * vy), 0, 1)
    return soft(r - np.hypot(X - ax - t * vx, Y - ay - t * vy))


def poly(X, Y, pts):
    """Convex polygon coverage (either winding)."""
    area = sum(pts[i][0] * pts[(i + 1) % len(pts)][1] - pts[(i + 1) % len(pts)][0] * pts[i][1] for i in range(len(pts)))
    sd = np.full(X.shape, np.inf)
    for i in range(len(pts)):
        (ax, ay), (bx, by) = pts[i], pts[(i + 1) % len(pts)]
        ex, ey = bx - ax, by - ay
        sd = np.minimum(sd, math.copysign(1, area) * ((Y - ay) * ex - (X - ax) * ey) / math.hypot(ex, ey))
    return soft(sd)


def stroke(cx, cy, a, th, color, alpha=1.0, bulge=0.0):
    """Short horizontal brush stroke, tapered at both ends, optionally arched upward (wave crest)."""
    r = win(cx - a, cx + a, cy - bulge - th, cy + th)
    if r is None:
        return
    sl, X, Y = r
    s = np.clip((X - cx) / a, -1, 1)
    yc = cy - bulge * (1 - s ** 2)
    put(sl, soft(th / 2 * np.sqrt(1 - s ** 2) - np.abs(Y - yc)) * soft(a - np.abs(X - cx)), color, alpha)


J, I = np.mgrid[0:h, 0:w].astype(float)
X, Y = (I + 0.5) * PX, (J + 0.5) * MH / h
ALL = (slice(None), slice(None))
SEA = soft(Y - HOR)
D = np.clip((Y - HOR) / (MH - HOR), 0, 1)           # sea depth cue: 0 horizon .. 1 bottom edge


def ramp(t, stops, cols):
    return np.dstack([np.interp(t, stops, [c[k] for c in cols]) for k in range(3)])


# ---- sky: blue-violet zenith -> pink / coral -> pale gold horizon, glow around the low sun ----
rgb[:] = ramp(Y / HOR, (0, 0.3, 0.55, 0.74, 0.89, 1.0),
              ((0.14, 0.13, 0.37), (0.3, 0.23, 0.53), (0.7, 0.44, 0.64), (0.96, 0.6, 0.57),
               (0.99, 0.77, 0.6), (1.0, 0.9, 0.68)))
glow = np.exp(-np.hypot(X - SUN_X, (Y - SUN_Y) * 1.7) / 1.3)
put(ALL, glow * (1 - SEA), (1.0, 0.87, 0.64), 0.55)

# long horizontal clouds, pink-lit from below; the sun itself is left clear
clouds = []
while len(clouds) < 8:
    cx, cy = rng.uniform(0.3, 17.7), rng.uniform(0.28, 2.1)
    a, b = rng.uniform(1.1, 2.7), rng.uniform(0.055, 0.1)
    if abs(cx - SUN_X) < a + 0.7 and cy > SUN_Y - SUN_R - 0.3:
        continue
    if any(abs(cy - c[1]) < 0.24 and abs(cx - c[0]) < a + c[2] for c in clouds):
        continue
    clouds.append((cx, cy, a, b))
for cx, cy, a, b in clouds:
    side = rng.choice((-1, 1))
    parts = [(cx, cy, a, b), (cx + side * a * 0.85, cy + b * 0.35, a * 0.75, b * 0.4)]
    for _ in range(rng.randint(3, 6)):  # rounded puffs riding on the flat-bottomed band
        pa = a * rng.uniform(0.14, 0.4)
        parts.append((cx + rng.uniform(-0.6, 0.6) * a, cy - rng.uniform(0.4, 1.0) * b,
                      pa, b * rng.uniform(1.0, 1.8)))
    r = win(cx - 2 * a, cx + 2 * a, cy - 3 * b, cy + 2 * b)
    if r is None:
        continue
    sl, Xl, Yl = r

    def cover(dy):
        m = np.zeros(Xl.shape)
        for p in parts:
            m = np.maximum(m, ellipse(Xl, Yl + dy, *p))
        return m
    m, tt = cover(0), cy / HOR
    put(sl, m, lerp((0.52, 0.38, 0.63), (0.95, 0.63, 0.63), tt ** 1.3))
    put(sl, m * (1 - cover(-0.022)), lerp((0.4, 0.29, 0.54), (0.86, 0.52, 0.57), tt), 0.6)  # shaded crown
    put(sl, m * (1 - cover(0.035)), lerp((0.98, 0.66, 0.68), (1.0, 0.88, 0.7), tt))       # lit underside

# the sun: pale yellow-orange disk with a deeper rim, just clear of the horizon
ds = np.hypot(X - SUN_X, Y - SUN_Y)
put(ALL, soft(SUN_R + 2.2 * PX - ds), (0.99, 0.62, 0.33))
put(ALL, soft(SUN_R - ds), mix((1.0, 0.96, 0.76), (1.0, 0.8, 0.5), (ds / SUN_R) ** 2))

# ---- sea: hazy lilac at the horizon, blue-green, darker toward the foreground ----
put(ALL, SEA, ramp(D, (0, 0.035, 0.2, 0.55, 1.0),
                   ((0.76, 0.68, 0.76), (0.5, 0.63, 0.71), (0.3, 0.57, 0.63), (0.16, 0.43, 0.49), (0.1, 0.32, 0.4))))
put(ALL, SEA * np.exp(-((X - SUN_X) / (0.45 + 1.3 * D)) ** 2) * (1 - D) ** 1.6, (1.0, 0.84, 0.62), 0.5)


# ---- islets (Matsushima style): undercut tuff bases, rounded tops, pine clumps ----
TIERS = (  # far: small and hazy / mid / near: large, dark, dawn-lit faces
    dict(rock=(0.58, 0.56, 0.71), lit=(0.72, 0.64, 0.74), shade=(0.5, 0.48, 0.65), pine=(0.5, 0.49, 0.64),
         pine_lit=None, line=(0.47, 0.45, 0.61), lw=1, refl=(0.55, 0.55, 0.68), ra=0.35),
    dict(rock=(0.38, 0.37, 0.5), lit=(0.62, 0.5, 0.56), shade=(0.27, 0.27, 0.39), pine=(0.17, 0.27, 0.3),
         pine_lit=(0.3, 0.4, 0.4), line=(0.15, 0.15, 0.23), lw=1, refl=(0.25, 0.33, 0.42), ra=0.42),
    dict(rock=(0.31, 0.27, 0.33), lit=(0.7, 0.53, 0.5), shade=(0.17, 0.15, 0.21), pine=(0.07, 0.19, 0.15),
         pine_lit=(0.2, 0.35, 0.26), line=(0.07, 0.06, 0.09), lw=2, refl=(0.1, 0.2, 0.26), ra=0.5),
)


class Islet:
    def __init__(self, x, yw, wid, hgt, tier):
        self.x, self.yw, self.W, self.H, self.tier = x, yw, wid, hgt, tier
        self.c = TIERS[tier]
        self.ph = rng.uniform(0, 2 * np.pi, 5)
        self.lean = rng.uniform(-0.08, 0.08)
        self.flutes = np.sort(rng.uniform(-0.85, 0.85, 3 + 2 * tier))
        self.trunks, self.pads = [], []
        for k in range((rng.randint(2, 5), rng.randint(4, 7), rng.randint(6, 9))[tier]):
            dx = (rng.uniform(-0.4, 0.4) if tier else rng.uniform(-0.3, 0.3)) * wid
            root = self.top_at(dx) - 0.012
            if tier == 0:  # far: just bumps of foliage on the ridge
                self.pads.append((dx, root, wid * rng.uniform(0.07, 0.12), hgt * rng.uniform(0.12, 0.2)))
                continue
            ph = hgt * rng.uniform(0.18, 0.34)
            lean = rng.uniform(-0.35, 0.35) + 0.8 * dx / wid       # edge pines lean out over the water
            self.trunks.append((dx, root - 0.03, dx + lean * ph, root + ph * 0.92, 0.006 + 0.004 * tier))
            for f, sa in ((0.55, 0.55), (0.8, 0.45), (1.0, 0.32))[:1 + tier]:
                self.pads.append((dx + lean * ph * f + rng.uniform(-0.2, 0.2) * ph, root + ph * f,
                                  ph * sa * rng.uniform(0.85, 1.2), ph * rng.uniform(0.09, 0.12)))

    def shape(self, dx, up):
        """Body coverage and the across-form coordinate nx (-1 west edge .. +1 east edge)."""
        dx = dx - self.lean * up
        top = self.H * (1 + 0.05 * np.sin(dx / self.W * 9 + self.ph[0]) + 0.03 * np.sin(dx / self.W * 21 + self.ph[1]))
        t = up / top
        q = np.clip((t - 0.32) / 0.68, 0, None)
        prof = np.where(t < 0.32, 0.66 + 0.34 * np.sin(np.clip(t, 0, 0.32) / 0.32 * np.pi / 2),   # wave-cut undercut
                        np.clip(1 - np.clip(q, 0, 1) ** 2.4, 0, 1) ** 0.5 - 4 * np.clip(q - 1, 0, None))
        hw = self.W / 2 * prof * (1 + 0.035 * np.sin(up / self.H * 15 + self.ph[2]))
        return soft(hw - np.abs(dx)) * soft(up), dx / np.maximum(hw, 1e-3)

    def body(self, dx, up):
        return self.shape(dx, up)[0]

    def top_at(self, dx):
        up = np.linspace(0, 1.3 * self.H, 600)
        inside = up[self.body(np.full_like(up, dx), up) > 0.5]
        return inside.max() if len(inside) else 0.0

    def pines(self, dx, up):
        m = np.zeros(dx.shape)
        for ax, ay, bx, by, r in self.trunks:
            m = np.maximum(m, capsule(dx, up, ax, ay, bx, by, r))
        for cx, cy, a, b in self.pads:  # flat-bottomed, domed clumps
            m = np.maximum(m, soft(ell_sd(dx - cx, up - cy, a, np.where(up < cy, b * 0.45, b))))
        return m

    def silhouette(self, dx, up):
        return np.maximum(self.body(dx, up), self.pines(dx, up))

    def paint_reflection(self):
        r = win(self.x - self.W, self.x + self.W, self.yw, self.yw + self.H * 1.1)
        if r is None:
            return
        sl, Xl, Yl = r
        dn = Yl - self.yw
        wob = (0.006 + 0.01 * self.tier) * np.sin(dn * 230 + Xl * 4)
        m = self.silhouette(Xl - self.x + wob, dn / 0.85) * soft(dn)
        fade = np.clip(1 - dn / (self.H * 1.05), 0, 1) ** 0.8
        broken = np.where(np.sin(dn * (300 - 60 * self.tier) + np.sin(Xl * 9)) > -0.55, 1.0, 0.35)
        put(sl, m * fade * broken, self.c["refl"], self.c["ra"])

    def paint(self):
        c = self.c
        sl, Xl, Yl = win(self.x - self.W, self.x + self.W, self.yw - self.H * 1.7, self.yw + 0.02)
        dx, up = Xl - self.x, self.yw - Yl
        mb, nx = self.shape(dx, up)
        mp = self.pines(dx, up)
        put(sl, grow(np.maximum(mb, mp), c["lw"]), c["line"])
        # penki-e rock: flat sun-side facet, mid band, shadow side; flutes and strata follow the form
        lit = nx * (1 if SUN_X > self.x else -1) + 0.06 * np.sin(up / self.H * 19 + self.ph[3])
        col = mix(c["rock"], c["lit"], np.where(lit > 0.3, 0.9, np.clip(lit + 0.1, 0, 0.4)))
        col = mix(col, c["shade"], soft((-0.55 - lit) * self.W / 2) * 0.8)
        hw = self.W / 2
        for f in self.flutes:
            col = mix(col, c["shade"], soft(0.006 + 0.004 * self.tier - np.abs(nx - f) * hw) * 0.45)
        strata = np.clip(np.sin((up + 0.12 * self.H * nx ** 2) / self.H * 24 + self.ph[4]) * 6 - 5, 0, 1)
        col = mix(col, c["shade"], strata * 0.35)
        col = mix(col, c["shade"], soft(self.H * 0.13 + 0.006 * np.sin(dx * 14) - up) * 0.9)  # wave-cut notch
        if self.tier:  # pine scrub over the crown, following the ridge
            ridge = np.where(mb > 0.5, up, -1.0).max(axis=0, keepdims=True)
            depth = self.H * (0.26 + 0.05 * np.sin(dx / self.W * 23 + self.ph[1]) + 0.04 * np.sin(dx / self.W * 9))
            col = mix(col, c["pine"], soft(up - (ridge - depth)) * 0.92)
        put(sl, mb, col)
        put(sl, mp, c["pine"])
        if c["pine_lit"]:
            put(sl, np.maximum(mp, mb * soft(up - (ridge - depth))) * (1 - self.silhouette(dx, up + 0.022)),
                c["pine_lit"], 0.85)


islets = [Islet(*a) for a in (
    (1.75, HOR + 0.06, 0.95, 0.2, 0), (6.75, HOR + 0.08, 1.0, 0.24, 0),
    (10.05, HOR + 0.04, 0.42, 0.09, 0), (16.95, HOR + 0.1, 1.25, 0.3, 0),
    (3.5, HOR + 0.3, 1.1, 0.6, 1), (12.95, HOR + 0.33, 1.15, 0.6, 1),
    (8.45, HOR + 0.74, 1.95, 1.3, 2), (15.25, HOR + 0.66, 1.7, 1.12, 2),
)]
SAILS = ((4.5, HOR + 0.06, 1.0), (9.5, HOR + 0.045, 0.85), (14.0, HOR + 0.075, 1.05))


def sail_shapes(dx, up, s):
    hull = poly(dx, up, [(-0.075 * s, 0.025 * s), (0.08 * s, 0.025 * s), (0.05 * s, 0.0), (-0.055 * s, 0.0)])
    mast = capsule(dx, up, 0, 0.02 * s, 0, 0.25 * s, 0.0035)
    main = poly(dx, up, [(0.008, 0.035 * s), (0.008, 0.245 * s), (0.105 * s, 0.035 * s)])
    jib = poly(dx, up, [(-0.008, 0.05 * s), (-0.008, 0.21 * s), (-0.07 * s, 0.05 * s)])
    return hull, mast, np.maximum(main, jib)


# reflections first (far to near), then wave lines and sun glitter over them
for isl in islets:
    isl.paint_reflection()
for x, yw, s in SAILS:
    sl, Xl, Yl = win(x - 0.12 * s, x + 0.12 * s, yw, yw + 0.3 * s)
    dn = Yl - yw
    hull, mast, sails = sail_shapes(Xl - x + 0.004 * np.sin(dn * 260), dn / 0.85, s)
    broken = np.where(np.sin(dn * 320) > -0.4, 1.0, 0.3)
    put(sl, sails * broken * np.clip(1 - dn / (0.26 * s), 0, 1), (0.95, 0.9, 0.9), 0.4)
    put(sl, hull * broken, (0.3, 0.33, 0.42), 0.35)

# white wave lines: denser and finer toward the horizon, longer arcs in front
for j in range(30):
    d = ((j + rng.uniform(0.15, 0.85)) / 30) ** 1.8
    y0 = HOR + 0.012 + d * (MH - HOR)
    x = rng.uniform(-0.3, 0.4)
    while x < MW:
        a = (0.04 + 0.3 * d) * rng.uniform(0.6, 1.3)
        stroke(x + a, y0 + rng.uniform(-0.008, 0.008), a, PX * (0.8 + 2.2 * d), (0.9, 0.95, 0.95),
               0.5 + 0.35 * d, bulge=0.004 + 0.02 * d)
        x += 2 * a + (0.12 + 1.1 * d) * rng.uniform(0.5, 1.6)

# sun glitter: a column of short bright strokes widening toward the viewer
stroke(SUN_X, HOR + 0.018, SUN_R * 0.95, 0.024, (1.0, 0.94, 0.76), 0.9)
for _ in range(340):
    d = rng.uniform(0, 1) ** 1.7 * 0.82
    spread = 0.3 + 0.95 * d
    x = SUN_X + rng.normal(0, spread * 0.4)
    near = math.exp(-((x - SUN_X) / spread) ** 2)
    stroke(x, HOR + 0.016 + d * (MH - HOR), (0.025 + 0.2 * d) * rng.uniform(0.5, 1.4), PX * (0.9 + 2.3 * d),
           lerp((1.0, 0.76, 0.48), (1.0, 0.97, 0.86), near), 0.5 + 0.45 * near)

# far sails, then islets far to near
for x, yw, s in SAILS:
    sl, Xl, Yl = win(x - 0.12 * s, x + 0.12 * s, yw - 0.27 * s, yw + 0.01)
    hull, mast, sails = sail_shapes(Xl - x, yw - Yl, s)
    put(sl, grow(np.maximum(hull, sails), 1), (0.42, 0.4, 0.5), 0.8)
    put(sl, mast, (0.35, 0.3, 0.32))
    put(sl, sails, mix((0.86, 0.82, 0.88), (1.0, 0.95, 0.9), np.clip((Xl - x) / (0.1 * s) + 0.5, 0, 1)))
    put(sl, hull, (0.32, 0.3, 0.38))
for isl in sorted(islets, key=lambda i: i.yw)[:6]:
    isl.paint()

# ---- vermilion torii standing in the water (deliberately no reflection) ----
S = 0.86
sl, Xl, Yl = win(TORII_X - 0.75 * S, TORII_X + 0.75 * S, TORII_Y - 1.05 * S, TORII_Y + 0.05)
dx, up = (Xl - TORII_X) / S, (TORII_Y - Yl) / S
for s in (-1, 1):   # small rings where the pillars meet the water
    ring = ellipse(dx, up, s * 0.36, 0.0, 0.11, 0.022) * (1 - ellipse(dx, up, s * 0.36, 0.0, 0.085, 0.012))
    put(sl, ring, (0.88, 0.94, 0.95), 0.6)
pillars = np.maximum(*[poly(dx, up, [(s * 0.36 - 0.04, 0), (s * 0.36 + 0.04, 0), (s * 0.335 + 0.032, 0.86),
                                     (s * 0.335 - 0.032, 0.86)]) for s in (-1, 1)])
nemaki = pillars * soft((0.065 - up) * S)
nuki = poly(dx, up, [(-0.47, 0.615), (0.47, 0.615), (0.47, 0.67), (-0.47, 0.67)])
post = poly(dx, up, [(-0.028, 0.67), (0.028, 0.67), (0.028, 0.85), (-0.028, 0.85)])
plaque = poly(dx, up, [(-0.05, 0.7), (0.05, 0.7), (0.05, 0.81), (-0.05, 0.81)])
lift = 0.075 * (np.abs(dx) / 0.62) ** 2.4
shimaki = soft((0.52 + 0.02 * (up - 0.85) / 0.05 - np.abs(dx)) * S) * soft((up - 0.845 - lift * 0.6) * S) \
    * soft((0.895 + lift * 0.6 - up) * S)
kasagi = soft((0.63 + 0.05 * (up - 0.9 - lift) / 0.08 - np.abs(dx)) * S) * soft((up - 0.89 - lift) * S) \
    * soft((0.975 + lift * 1.15 - up) * S)
torii = np.maximum.reduce([pillars, nuki, post, plaque, shimaki, kasagi])
put(sl, grow(torii, 2), (0.2, 0.06, 0.05))
pc = np.where(dx < 0, -0.348, 0.348)  # pillar axis; the sun-side (right) half catches the light
put(sl, np.maximum.reduce([pillars, nuki, post, shimaki]),
    mix((0.66, 0.16, 0.1), (0.93, 0.33, 0.17), np.where(pillars > 0, (dx - pc) / 0.07 + 0.55, 0.75)))
put(sl, nuki * soft((0.632 - up) * S), (0.7, 0.18, 0.1))       # shadow under the tie beam
put(sl, plaque, (0.16, 0.1, 0.08))
put(sl, nemaki, (0.12, 0.09, 0.09))
put(sl, kasagi, (0.13, 0.1, 0.1))
put(sl, kasagi * soft((0.9 + lift + 0.022 - up) * S), (0.3, 0.2, 0.2))  # catch-light on the beam's lip

for isl in sorted(islets, key=lambda i: i.yw)[6:]:
    isl.paint()

# ---- foreground rocky shores with surf, then coastal pines ----
shore = np.zeros((h, w))
ROCKS = []
for x0, x1, yb, yt, sgn in ((0.0, 4.7, 3.28, 4.45, 1), (18.0, 13.2, 3.22, 4.45, -1)):
    for k in range(7):
        f = k / 6
        cx = x0 + (x1 - x0) * f + rng.uniform(-0.2, 0.2)
        a = rng.uniform(0.55, 0.95) * (1 - 0.35 * f)
        b = rng.uniform(0.32, 0.48) * (1 - 0.4 * f)
        ROCKS.append((cx, yb + (yt - yb) * f ** 1.2 + b * 0.75, a, b, sgn))
    for k in range(3):  # big low boulders in front
        cx = x0 + (x1 - x0) * (0.12 + 0.3 * k) + rng.uniform(-0.2, 0.2)
        ROCKS.append((cx, MH + 0.05 + rng.uniform(0, 0.1), rng.uniform(0.9, 1.3) * (1 - 0.25 * k), rng.uniform(0.3, 0.45), sgn))
ROCKS.sort(key=lambda r: r[1])
RPH = rng.uniform(0, 2 * np.pi, (len(ROCKS), 4))


def rock_mask(Xl, Yl, cx, cy, a, b, ph, grow_by=0.0):
    ang = np.arctan2(Yl - cy, (Xl - cx) * b / a)
    k = 1 + 0.08 * np.sin(3 * ang + ph[0]) + 0.05 * np.sin(5 * ang + ph[1]) + 0.025 * np.sin(9 * ang + ph[2])
    return soft(ell_sd(Xl - cx, Yl - cy, a + grow_by, b + grow_by * 0.4, k))


for (cx, cy, a, b, sgn), ph in zip(ROCKS, RPH):  # surf first, so only its water-side edge survives
    sl, Xl, Yl = win(cx - a * 1.3, cx + a * 1.3, cy - b * 1.3, cy + b * 1.3)
    foam = rock_mask(Xl, Yl, cx, cy, a, b, ph, 0.07) * soft(Yl - cy + b * 0.15)
    put(sl, foam * (0.6 + 0.4 * (np.sin(Xl * 37 + ph[3]) > -0.2)), (0.92, 0.95, 0.95), 0.85)
for (cx, cy, a, b, sgn), ph in zip(ROCKS, RPH):
    sl, Xl, Yl = win(cx - a * 1.3, cx + a * 1.3, cy - b * 1.3, cy + b * 1.3)
    m = rock_mask(Xl, Yl, cx, cy, a, b, ph)
    put(sl, grow(m, 2), (0.09, 0.07, 0.09))
    ny = (Yl - cy) / b + 0.12 * np.sin((Xl - cx) / a * 5 + ph[3])
    nx = (Xl - cx) / a * sgn          # +1 toward the sea / sun
    col = np.where((ny < -0.38)[..., None], np.array((0.66, 0.51, 0.47)),       # dawn-lit top facet
                   np.where((nx > 0.15)[..., None], np.array((0.42, 0.34, 0.36)), np.array((0.27, 0.23, 0.27))))
    col = np.where((ny > 0.5)[..., None], np.array((0.16, 0.14, 0.18)), col)
    crack = soft(0.004 - np.abs(Xl - cx - a * 0.3 * np.sin(ph[0]) - (Yl - cy) * 0.4 * np.cos(ph[1]))) * (ny > -0.3)
    put(sl, m, col)
    put(sl, m * crack, (0.12, 0.1, 0.13), 0.8)
    shore[sl] = np.maximum(shore[sl], m)


def shore_pine(x, hgt, lean, sgn):
    """Mural.py's stacked-tier pines, with the tiers made wide, flat and offset along a crooked
    trunk so they read as coastal black pines leaning out toward the sea (sgn = +1 right, -1 left)."""
    col = np.nonzero(shore[:, min(int(x / PX), w - 1)] > 0.5)[0]
    base = (col[0] + 0.5) * MH / h + 0.05
    kink = rng.uniform(-0.06, 0.06)
    knots = ((x, -0.03), (x + sgn * lean * hgt * 0.45 + kink, hgt * 0.5), (x + sgn * lean * hgt, hgt * 0.97))
    sl, Xl, Yl = win(x - 0.6 * hgt, x + 0.6 * hgt + lean * hgt, base - hgt - 0.08, base + 0.02)
    up = base - Yl
    trunk = np.maximum(capsule(Xl, up, *knots[0], *knots[1], 0.03),
                       capsule(Xl, up, *knots[1], *knots[2], 0.022))

    def tiers(up):
        m = np.zeros(Xl.shape)
        for f, wf, off in ((0.98, 0.2, 0.0), (0.8, 0.31, 0.1), (0.61, 0.37, -0.09), (0.43, 0.3, 0.13))[:3 + (hgt > 1.2)]:
            ty = hgt * f                                         # tier bottom
            tx = float(np.interp(ty, [k[1] for k in knots], [k[0] for k in knots]))
            cxk, wid, th = tx + sgn * off * hgt + jit[f], hgt * wf, hgt * 0.13
            s_ = np.clip((Xl - cxk) / wid, -1, 1)
            bot = ty - 0.25 * th * s_ ** 2                       # ends droop a little
            m = np.maximum(m, soft(np.minimum(np.minimum(wid - np.abs(Xl - cxk), up - bot),
                                              th * (1 - s_ ** 2) ** 0.6 - (up - ty))))
        return m
    jit = {f: rng.uniform(-0.05, 0.05) for f in (0.98, 0.8, 0.61, 0.43)}
    m = tiers(up)
    put(sl, grow(np.maximum(m, trunk), 2), (0.03, 0.06, 0.05))
    put(sl, trunk, (0.25, 0.16, 0.12))
    put(sl, m, (0.07, 0.17, 0.13))
    put(sl, m * (1 - tiers(up + 0.03)), (0.17, 0.3, 0.21), 0.75)   # lit top of each tier


for x, hgt in ((0.35, 1.75), (1.15, 1.35), (1.95, 1.55), (2.85, 1.05)):
    shore_pine(x, hgt * rng.uniform(0.95, 1.05), 0.14 + rng.uniform(-0.04, 0.04), 1)
for x, hgt in ((17.65, 1.65), (16.85, 1.3), (16.05, 1.0)):
    shore_pine(x, hgt * rng.uniform(0.95, 1.05), 0.14 + rng.uniform(-0.04, 0.04), -1)
rgb = np.clip(rgb, 0, 1)

maps = image_textures("MuralSea", rgb, tile=0.2, period=(MW, MH), gloss=0.1)
mat = pbr_material("MuralSea", maps)
panel = tbox("Panel", (MW, MH, 0.02), (0, 0, 0), mat)
bpy.context.view_layer.update()
# front face spans x -9..9, Blender z -2.2..2.2
planar_uv(panel, axes=(0, 2), origin=(-MW / 2, -MH / 2), size=(MW, MH))
frame = material("MuralSeaFrame", (0.32, 0.09, 0.06), roughness=0.15)
for s in (-1, 1):
    tbox(f"FrameH{s}", (MW + 0.16, 0.08, 0.04), (0, s * (MH / 2 + 0.04), 0.01), frame)
    tbox(f"FrameV{s}", (0.08, MH, 0.04), (s * (MW / 2 + 0.04), 0, 0.01), frame)
export_pbr_glb(out_path())
