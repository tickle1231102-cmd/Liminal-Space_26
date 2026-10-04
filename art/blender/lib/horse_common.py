"""Stylized carousel horse, shared by carousel.py and the standalone rideable carousel_horse.py.
Built at the origin (body center), head toward Blender -Y, brass pole through the saddle."""
from common import box, cylinder, join_visual, material


def horse_materials():
    return {
        "coats": [material("HorseCream", (0.91, 0.8, 0.58), roughness=0.45),
                  material("HorsePink", (0.8, 0.46, 0.58), roughness=0.45)],
        "saddle": material("HorseSaddle", (0.45, 0.08, 0.12), roughness=0.5),
        "dark": material("HorseHoof", (0.1, 0.07, 0.05), roughness=0.6),
        "brass": material("CarouselBrass", (0.66, 0.5, 0.13), roughness=0.3, metallic=0.75),
    }


def build_horse(name, mats, coat_index=0, pole_length=2.4, pole_center=0.4):
    coat = mats["coats"][coat_index]
    parts = [
        box("Body", (0.32, 0.9, 0.42), (0, 0, 0), coat),
        box("Chest", (0.3, 0.25, 0.36), (0, -0.4, 0.05), coat),
        box("Neck", (0.2, 0.22, 0.45), (0, -0.48, 0.3), coat),
        box("Head", (0.2, 0.42, 0.2), (0, -0.62, 0.52), coat),
        box("Mane", (0.06, 0.3, 0.35), (0, -0.4, 0.42), mats["dark"]),
        box("Saddle", (0.34, 0.32, 0.06), (0, 0.05, 0.23), mats["saddle"]),
        box("Tail", (0.06, 0.06, 0.35), (0, 0.48, -0.05), mats["dark"]),
    ]
    for j, (x, y, rx) in enumerate(((-0.1, -0.3, 0.5), (0.1, -0.3, 0.3), (-0.1, 0.3, -0.4), (0.1, 0.3, -0.2))):
        leg = box(f"Leg_{j}", (0.07, 0.07, 0.5), (x, y, -0.36), coat)
        leg.rotation_euler = (rx, 0, 0)
        parts.append(leg)
    parts.append(cylinder("HPole", 0.035, pole_length, (0, 0, pole_center), mats["brass"], verts=8))
    return join_visual(name, parts)
