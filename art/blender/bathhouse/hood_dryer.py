"""Showa seated hood hair dryer (お釜型ドライヤー) for the women's dressing room.
Chrome-tube chair with dusty-pink vinyl seat, back and arm pads; behind it a pedestal pole whose
arm holds a cream enamel dome hood (open underside tilted down/forward over a seated head), a
control dial on the hood side and a brass coin timer on the pole. Faces +Z, origin = floor centre.
Rearmost geometry sits at z = -0.40 (runtime backs it against a wall); footprint x ±0.33, z -0.40..0.36."""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
from common import *  # noqa: E402,F403
from quality import finish, export_pbr_glb  # noqa: E402
from bath_common import *  # noqa: E402,F403

reset_scene()
import bmesh
from mathutils import Vector

cr = chrome()
vinyl = material("DryerVinyl", (0.6, 0.35, 0.37), roughness=0.4)
cream = enamel((0.8, 0.75, 0.6), "DryerHoodCream")
liner = material("DryerHoodLiner", (0.3, 0.29, 0.27), roughness=0.55)
base_mat = enamel((0.07, 0.075, 0.07), "DryerBase")
rubber = material("DryerRubber", (0.03, 0.03, 0.03), roughness=0.8)
bakelite = material("DryerBakelite", (0.06, 0.045, 0.035), roughness=0.3)
plate_mat = enamel((0.9, 0.88, 0.8), "DryerPlate")
band_mat = enamel((0.62, 0.08, 0.08), "DryerPlateBand")
ink = enamel((0.08, 0.08, 0.09), "DryerInk")
br = brass()
o = []


def soft_box(name, size, pos, mat, radius, lean=0.0):
    """Upholstered pad: rounded box; `lean` (rad) tips its top back toward -Z."""
    ob = tbox(name, size, pos, mat)
    m = ob.modifiers.new("Round", "BEVEL")
    m.width, m.segments, m.limit_method = radius, 3, "NONE"
    bpy.context.view_layer.objects.active = ob
    bpy.ops.object.modifier_apply(modifier=m.name)
    ob.rotation_euler = (-lean, 0, 0)   # Blender +X rotation would tip the top toward Three +Z
    return ob


def tube(name, a, b, r=0.013, mat=cr, verts=12):
    return tcyl_between(name, r, a, b, mat, verts=verts)


def ball(name, pos, r=0.016, mat=cr, segments=12):
    return sphere(name, r, P(*pos), mat, segments=segments)


# ---------------- chair: chrome tube frame ----------------
LX = 0.25                        # leg / armrest plane
SEAT_Y = 0.45                    # top of the seat cushion
ARM_Y = 0.62
FL0, FL1 = Vector((LX, 0.008, 0.27)), Vector((LX, ARM_Y, 0.21))     # front leg, floor -> armrest
RL0, RL1 = Vector((LX, 0.008, -0.24)), Vector((LX, ARM_Y, -0.20))   # rear leg, floor -> armrest
RAIL_Y = 0.34


def on(p0, p1, y):
    return p0 + (p1 - p0) * ((y - p0.y) / (p1.y - p0.y))


for s in (-1, 1):
    fl0, fl1, rl0, rl1 = (v.copy() for v in (FL0, FL1, RL0, RL1))
    for v in (fl0, fl1, rl0, rl1):
        v.x *= s
    o.append(tube(f"FrontLeg{s}", fl0, fl1))
    o.append(tube(f"RearLeg{s}", rl0, rl1))
    o.append(tube(f"Arm{s}", fl1, rl1))
    o.append(ball(f"ArmJointF{s}", fl1))
    o.append(ball(f"ArmJointR{s}", rl1))
    o.append(soft_box(f"ArmPad{s}", (0.055, 0.032, 0.36), (s * LX, ARM_Y + 0.026, 0.005), vinyl, 0.012))
    o.append(tube(f"SideRail{s}", on(fl0, fl1, RAIL_Y), on(rl0, rl1, RAIL_Y)))
    for p in (fl0, rl0):
        o.append(tcyl(f"Glide{s}{p.z:.2f}", 0.018, 0.016, (p.x, 0.008, p.z), rubber, verts=12))
F_RAIL_Z, R_RAIL_Z = on(FL0, FL1, RAIL_Y).z, on(RL0, RL1, RAIL_Y).z
o.append(tube("FrontRail", (-LX, RAIL_Y, F_RAIL_Z), (LX, RAIL_Y, F_RAIL_Z)))
o.append(tube("RearRail", (-LX, RAIL_Y, R_RAIL_Z), (LX, RAIL_Y, R_RAIL_Z)))
# U-shaped footrest bar ahead of the front legs
FR_Y, FR_Z = 0.12, 0.325
fz = on(FL0, FL1, FR_Y).z
for s in (-1, 1):
    o.append(tube(f"FootArm{s}", (s * LX, FR_Y, fz), (s * 0.2, FR_Y, FR_Z), r=0.011))
    o.append(ball(f"FootJoint{s}", (s * 0.2, FR_Y, FR_Z), r=0.011))
o.append(tube("FootBar", (-0.2, FR_Y, FR_Z), (0.2, FR_Y, FR_Z), r=0.011))

# seat: enamel steel pan + vinyl cushion (top at SEAT_Y)
o.append(tbox("SeatPan", (0.47, 0.02, 0.45), (0, RAIL_Y + 0.023, 0.01), base_mat))
o.append(soft_box("SeatCushion", (0.46, 0.085, 0.45), (0, SEAT_Y - 0.0425, 0.015), vinyl, 0.025))

# backrest: uprights from the rear rail leaning back, vinyl pad in front of them
UP0, UP1 = Vector((0.17, RAIL_Y, R_RAIL_Z)), Vector((0.17, 0.88, -0.27))
lean = math.atan2(-(UP1.z - UP0.z), UP1.y - UP0.y)
for s in (-1, 1):
    a0, a1 = UP0.copy(), UP1.copy()
    a0.x *= s
    a1.x *= s
    o.append(tube(f"Upright{s}", a0, a1, r=0.012))
    o.append(ball(f"UprightCap{s}", a1, r=0.013))
bc = on(UP0, UP1, 0.71)
o.append(soft_box("BackPad", (0.42, 0.3, 0.06), (0, 0.71, bc.z + 0.042), vinyl, 0.022, lean=lean))
# channel seams across the back pad
for k, y in enumerate((0.64, 0.71, 0.78)):
    zc = on(UP0, UP1, y).z + 0.042 + 0.031
    o.append(tcyl(f"Seam{k}", 0.003, 0.36, (0, y, zc), enamel((0.42, 0.22, 0.24), "DryerSeam"), axis="x", verts=6))

# ---------------- pedestal: base, pole, tie bar ----------------
POLE_Z, POLE_TOP = -0.355, 1.3
o.append(tbox("Base", (0.32, 0.04, 0.15), (0, 0.02, -0.325), base_mat))
o.append(tcyl("Collar", 0.042, 0.07, (0, 0.075, POLE_Z), base_mat, verts=16))
o.append(tcyl("Pole", 0.024, POLE_TOP - 0.04, (0, 0.04 + (POLE_TOP - 0.04) / 2, POLE_Z), cr, verts=16))
o.append(tube("TieBar", (0, RAIL_Y, POLE_Z), (0, RAIL_Y, R_RAIL_Z), r=0.012))
o.append(tcyl("TieClamp", 0.032, 0.05, (0, RAIL_Y, POLE_Z), base_mat, verts=16))

# ---------------- hood: lathed double shell ----------------
TH = math.radians(22)            # tilt: opening faces down and forward
A = Vector((0, math.cos(TH), -math.sin(TH)))   # rim -> apex
B = Vector((0, math.sin(TH), math.cos(TH)))    # "forward" in the rim plane
X = Vector((1, 0, 0))
H, R, SK, T = 0.35, 0.215, 0.12, 0.012        # height, outer radius, skirt height, shell thickness
CAP = H - SK
C = Vector((0, 1.22, -0.02))
RIM = C - A * (H / 2)


def outer(psi):
    """Outer cap profile (radius, height above rim) at elliptic angle psi (0 = apex)."""
    return R * math.sin(psi), SK + CAP * math.cos(psi)


# profile (r, u, material of the segment to the next point): 0 cream, 1 liner, 2 chrome band
N = 8
pts = [(*outer(i / N * math.pi / 2), 0) for i in range(N)]            # outer cap, apex -> equator
pts += [(R, SK, 2), (R + 0.004, SK - 0.005, 2), (R + 0.004, SK - 0.025, 2), (R, SK - 0.03, 0)]
pts += [(R, 0.02, 0), (R + 0.005, 0.012, 0), (R + 0.008, 0.003, 0),     # rolled rim lip
        (R + 0.004, -0.005, 0), (R - 0.004, -0.007, 0), (R - T, 0.0, 1)]
pts += [((R - T) * math.sin(i / N * math.pi / 2), SK + (CAP - T) * math.cos(i / N * math.pi / 2), 1)
        for i in range(N, -1, -1)]                                       # inner cap, equator -> apex
prof, segm = [(r, u) for r, u, _ in pts], [m for _, _, m in pts[:-1]]


def lathe(name, profile, seg_mats, mats, segs=24):
    bm = bmesh.new()
    rings = []
    for r, u in profile:
        if r < 1e-6:
            rings.append([bm.verts.new(P(*(RIM + A * u)))])
            continue
        ring = []
        for k in range(segs):
            phi = 2 * math.pi * k / segs
            w = RIM + A * u + X * (r * math.cos(phi)) + B * (r * math.sin(phi))
            ring.append(bm.verts.new(P(*w)))
        rings.append(ring)
    for i in range(len(rings) - 1):
        ra, rb = rings[i], rings[i + 1]
        for k in range(segs):
            k2 = (k + 1) % segs
            if len(ra) == 1:
                f = bm.faces.new((ra[0], rb[k], rb[k2]))
            elif len(rb) == 1:
                f = bm.faces.new((ra[k], ra[k2], rb[0]))
            else:
                f = bm.faces.new((ra[k], ra[k2], rb[k2], rb[k]))
            f.material_index = seg_mats[i]
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    for mt in mats:
        me.materials.append(mt)
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    return ob


o.append(lathe("Hood", prof, segm, [cream, liner, cr]))

# air intake at the apex: chrome ring, dark grille, centre boss (axis-aligned with the hood)
APEX = RIM + A * H
for nm, rad, ln, mt, d in (("Intake", 0.07, 0.024, cr, -0.006), ("Grille", 0.056, 0.026, ink, -0.004),
                           ("IntakeBoss", 0.018, 0.034, cr, 0.0)):
    ob = cylinder(nm, rad, ln, P(*(APEX + A * d)), mt, verts=20 if rad > 0.03 else 12)
    ob.rotation_euler = (-TH, 0, 0)
    o.append(ob)

# arm mount on the hood's back-upper shell: pick the point whose outward normal rises ~28 deg
best = None
for i in range(1, 400):
    psi = i / 400 * math.pi / 2
    r, u = outer(psi)
    nr, nu = CAP * math.sin(psi), R * math.cos(psi)
    n = (A * nu - B * nr).normalized()
    elev = math.degrees(math.atan2(n.y, -n.z))
    if best is None or abs(elev - 28) < best[0]:
        best = (abs(elev - 28), RIM + A * u - B * r, n)
_, MOUNT, MN = best
o.append(tcyl_between("MountPad", 0.06, MOUNT - MN * 0.012, MOUNT + MN * 0.022, cream, verts=20))
o.append(tcyl_between("MountRing", 0.064, MOUNT + MN * 0.004, MOUNT + MN * 0.012, cr, verts=20))
KNUCKLE = MOUNT + MN * 0.05
o.append(tcyl_between("NeckStub", 0.022, MOUNT + MN * 0.02, KNUCKLE, cr, verts=12))
o.append(tcyl("Knuckle", 0.026, 0.1, tuple(KNUCKLE), cr, axis="x", verts=16))
for s in (-1, 1):
    o.append(tcyl(f"KnuckleNut{s}", 0.017, 0.012, (s * 0.056, KNUCKLE.y, KNUCKLE.z), bakelite, axis="x", verts=12))
POLE_TIP = Vector((0, POLE_TOP, POLE_Z))
o.append(ball("Elbow", tuple(POLE_TIP), r=0.03, segments=16))
o.append(tube("HoodArm", POLE_TIP, KNUCKLE, r=0.02, verts=14))

# control dial on the hood's right side (heat / time), on a small chrome escutcheon
DU = SK + 0.045
dr = R * math.sqrt(max(0.0, 1 - ((DU - SK) / CAP) ** 2))
DIAL = RIM + A * DU + X * dr
o.append(tcyl("DialPlate", 0.036, 0.012, (DIAL.x + 0.002, DIAL.y, DIAL.z), cr, axis="x", verts=16))
o.append(tcyl("Dial", 0.026, 0.024, (DIAL.x + 0.014, DIAL.y, DIAL.z), bakelite, axis="x", verts=16))
o.append(tbox("DialPointer", (0.004, 0.022, 0.006), (DIAL.x + 0.027, DIAL.y + 0.008, DIAL.z), plate_mat))

# ---------------- coin timer on a bracket off the pole (right side) ----------------
CB = Vector((0.25, 0.92, -0.345))    # box centre
CW, CH, CD = 0.12, 0.17, 0.09
o.append(tube("CoinBracket", (0.0, CB.y - 0.03, POLE_Z), (CB.x - CW / 2, CB.y - 0.03, POLE_Z), r=0.012))
o.append(tcyl("CoinClamp", 0.032, 0.05, (0, CB.y - 0.03, POLE_Z), base_mat, verts=16))
o.append(tbox("CoinBox", (CW, CH, CD), tuple(CB), br))
o.append(tbox("CoinLid", (CW + 0.008, 0.012, CD + 0.008), (CB.x, CB.y + CH / 2 + 0.006, CB.z), br))
fz = CB.z + CD / 2
o.append(tbox("TimerPlate", (0.094, 0.056, 0.003), (CB.x, CB.y + 0.045, fz + 0.0015), plate_mat))
o.append(tbox("TimerBand", (0.094, 0.014, 0.004), (CB.x, CB.y + 0.066, fz + 0.002), band_mat))
for k, (w, x) in enumerate(((0.03, -0.022), (0.03, 0.022))):     # "10分" "30円" as plain ink bars
    o.append(tbox(f"TimerInk{k}", (w, 0.012, 0.004), (CB.x + x, CB.y + 0.038, fz + 0.002), ink))
o.append(tbox("SlotBezel", (0.04, 0.018, 0.006), (CB.x - 0.025, CB.y - 0.01, fz + 0.003), cr))
o.append(tbox("Slot", (0.026, 0.004, 0.007), (CB.x - 0.025, CB.y - 0.01, fz + 0.0035), ink))
o.append(tcyl("TurnKnob", 0.018, 0.014, (CB.x + 0.028, CB.y - 0.01, fz + 0.007), cr, axis="z", verts=16))
o.append(tbox("TurnLever", (0.03, 0.007, 0.01), (CB.x + 0.028, CB.y - 0.01, fz + 0.016), cr))
o.append(tbox("ReturnCup", (0.036, 0.022, 0.012), (CB.x, CB.y - 0.06, fz + 0.006), cr))
o.append(tbox("ReturnHole", (0.026, 0.012, 0.004), (CB.x, CB.y - 0.06, fz + 0.0125), ink))

# ---------------- cloth cord: hood -> timer -> wall outlet behind the chair ----------------
cord_mat = material("DryerCord", (0.05, 0.04, 0.035), roughness=0.75)


def cord(name, pts, r=0.0055):
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth, cu.bevel_resolution, cu.resolution_u = r, 2, 6   # 12-sided: stays under the bevel angle
    cu.use_fill_caps = True
    sp = cu.splines.new("BEZIER")
    sp.bezier_points.add(len(pts) - 1)
    for bp, p in zip(sp.bezier_points, pts):
        bp.co = P(*p)
        bp.handle_left_type = bp.handle_right_type = "AUTO"
    ob = bpy.data.objects.new(name, cu)
    bpy.context.collection.objects.link(ob)
    bpy.ops.object.select_all(action="DESELECT")
    ob.select_set(True)
    bpy.context.view_layer.objects.active = ob
    bpy.ops.object.convert(target="MESH")
    ob = bpy.context.view_layer.objects.active
    ob.data.materials.append(cord_mat)
    return ob


LID_Y = CB.y + CH / 2 + 0.012
o.append(cord("CordHood", [tuple(MOUNT + X * 0.05 + MN * 0.006), (0.11, MOUNT.y - 0.16, -0.255),
                           (0.2, LID_Y + 0.055, -0.33), (0.225, LID_Y + 0.004, -0.35)]))
o.append(tcyl("Grommet", 0.01, 0.012, (0.225, LID_Y, -0.35), bakelite, verts=12))
OUT_Y = 0.3
o.append(cord("CordWall", [(0.29, CB.y - CH / 2 + 0.01, -0.36), (0.295, CB.y - CH / 2 - 0.08, -0.375),
                           (0.29, 0.55, -0.388), (0.285, OUT_Y + 0.06, -0.389), (0.285, OUT_Y + 0.02, -0.389)]))
o.append(tbox("Outlet", (0.07, 0.11, 0.006), (0.285, OUT_Y, -0.397), plate_mat))
o.append(tbox("Plug", (0.03, 0.04, 0.016), (0.285, OUT_Y, -0.386), bakelite))

# round parts (tubes, knobs, cord) read smooth; box edges stay crisp
bpy.ops.object.select_all(action="DESELECT")
for ob in o:
    ob.select_set(True)
bpy.context.view_layer.objects.active = o[0]
bpy.ops.object.shade_smooth_by_angle(angle=math.radians(40))

tcol("Chair", (0.66, 1.0, 0.76), (0, 0.5, -0.02))
finish(o, name="HoodDryer", bevel_width=0.004)
export_pbr_glb(out_path())
