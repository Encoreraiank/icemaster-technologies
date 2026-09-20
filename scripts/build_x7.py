import bpy, os, math

def clean_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)

def create_pbr_material(name, color=(0.1,0.1,0.1,1.0), metallic=0.0, roughness=0.5):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    bsdf.inputs['Base Color'].default_value = color
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    output = nodes.new(type='ShaderNodeOutputMaterial')
    mat.node_tree.links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
    return mat

def create_glass_material(name="X7_Tempered_Glass"):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    bsdf.inputs['Base Color'].default_value = (0.95, 0.98, 1.0, 1.0)
    bsdf.inputs['Roughness'].default_value = 0.02
    if 'Transmission Weight' in bsdf.inputs:
        bsdf.inputs['Transmission Weight'].default_value = 0.98
    elif 'Transmission' in bsdf.inputs:
        bsdf.inputs['Transmission'].default_value = 0.98
    bsdf.inputs['IOR'].default_value = 1.52
    output = nodes.new(type='ShaderNodeOutputMaterial')
    mat.node_tree.links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
    return mat

def create_argb_emission_material(name, color=(0.0, 0.95, 1.0, 1.0), strength=4.5):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    emission = nodes.new(type='ShaderNodeEmission')
    emission.inputs['Color'].default_value = color
    emission.inputs['Strength'].default_value = strength
    output = nodes.new(type='ShaderNodeOutputMaterial')
    mat.node_tree.links.new(emission.outputs['Emission'], output.inputs['Surface'])
    return mat

def add_box(name, min_pt, max_pt, material, parent=None, rotation=None):
    x0, y0, z0 = min_pt
    x1, y1, z1 = max_pt
    sx = (x1 - x0) / 2.0
    sy = (y1 - y0) / 2.0
    sz = (z1 - z0) / 2.0
    cx = (x0 + x1) / 2.0
    cy = (y0 + y1) / 2.0
    cz = (z0 + z1) / 2.0

    # Blender coordinate: X=Width, Y=Depth(cz), Z=Height(cy)
    bpy.ops.mesh.primitive_cube_add(size=2.0, location=(cx, cz, cy))
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = (sx, sz, sy)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if rotation:
        obj.rotation_euler = rotation
    if material:
        obj.data.materials.append(material)
    if parent:
        obj.parent = parent
    return obj

def add_cylinder(name, center, radius, height, axis='y', material=None, parent=None, segs=32):
    cx, cy, cz = center # cy=height, cz=depth
    bpy.ops.mesh.primitive_cylinder_add(radius=radius, depth=height, vertices=segs, location=(cx, cz, cy))
    obj = bpy.context.active_object
    obj.name = name
    if axis == 'x': obj.rotation_euler = (0, math.pi / 2, 0)
    elif axis == 'z': obj.rotation_euler = (math.pi / 2, 0, 0)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
    if material:
        obj.data.materials.append(material)
    if parent:
        obj.parent = parent
    return obj

def add_fan(name, center, axis, rgb_color, parent, mat_black, mat_hub, custom_rot=None):
    fan_mat = create_argb_emission_material(f"{name}_ARGB", color=rgb_color, strength=5.0)
    cx, cy, cz = center
    fan_empty = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(fan_empty)
    fan_empty.location = (cx, cz, cy)
    if custom_rot:
        fan_empty.rotation_euler = custom_rot
    if parent:
        fan_empty.parent = parent

    # Frame (120mm x 120mm x 25mm)
    frame = add_box(f"{name}_Frame", [-59, -12, -59], [59, 12, 59], mat_black, parent=fan_empty)
    if axis == 'x': frame.rotation_euler = (0, 0, math.pi/2)
    elif axis == 'z': frame.rotation_euler = (math.pi/2, 0, 0)

    # Infinity mirror side strips (Cyan / Magenta)
    strip_mat = create_argb_emission_material(f"{name}_Strip", color=(0.0, 0.9, 1.0, 1.0), strength=4.0)
    for s in [-58, 58]:
        s_box = add_box(f"{name}_Strip_{s}", [-50, -10, s-2], [50, 10, s+2], strip_mat, parent=fan_empty)

    # ARGB Halo Ring
    add_cylinder(f"{name}_Halo", [0, 0, 0], 53, 16, axis=axis, material=fan_mat, parent=fan_empty, segs=36)
    # Center Spinner Hub (Black Glossy)
    add_cylinder(f"{name}_Hub", [0, 0, 0], 22, 18, axis=axis, material=mat_hub, parent=fan_empty, segs=32)

    # 9 Curved Aerodynamic Fan Blades
    for i in range(9):
        ang = (i / 9) * math.pi * 2
        bx = math.cos(ang) * 36
        bz = math.sin(ang) * 36
        blade = add_box(f"{name}_Blade_{i}", [-12, -2, -4], [12, 2, 4], fan_mat, parent=fan_empty)
        if axis == 'y':
            blade.location = (bx, bz, 0)
            blade.rotation_euler = (0.35, 0, -ang + 0.4)
        elif axis == 'x':
            blade.location = (0, bx, bz)
            blade.rotation_euler = (-ang + 0.4, 0.35, 0)
        else:
            blade.location = (bx, 0, bz)
            blade.rotation_euler = (0, 0.35, -ang + 0.4)

def build_ice_master_dynamite_x7():
    clean_scene()
    print("Building Ice Master Dynamite X7 Studio Scene...")

    # Set World Environment (Studio Ambient)
    world = bpy.data.worlds.new("X7_Studio_World")
    bpy.context.scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs['Color'].default_value = (0.04, 0.045, 0.06, 1.0)
        bg.inputs['Strength'].default_value = 1.0

    # Materials
    mat_powder_black = create_pbr_material("Matte_Powder_Black", color=(0.045, 0.045, 0.05, 1.0), metallic=0.82, roughness=0.45)
    mat_brushed_black = create_pbr_material("Brushed_Anodized_Black", color=(0.02, 0.02, 0.025, 1.0), metallic=0.92, roughness=0.25)
    mat_black_plastic = create_pbr_material("Matte_Black_Plastic", color=(0.06, 0.06, 0.07, 1.0), metallic=0.1, roughness=0.7)
    mat_glass = create_glass_material("Panoramic_Tempered_Glass")
    mat_glass_border = create_pbr_material("Glass_Ceramic_Border", color=(0.01, 0.01, 0.01, 1.0), metallic=0.1, roughness=0.3)
    mat_silver_cnc = create_pbr_material("Silver_CNC_Hardware", color=(0.88, 0.9, 0.92, 1.0), metallic=0.98, roughness=0.15)
    mat_gold_brass = create_pbr_material("Gold_Brass_Standoffs", color=(0.85, 0.65, 0.15, 1.0), metallic=0.92, roughness=0.2)
    mat_usb_blue = create_pbr_material("USB_3_Blue", color=(0.0, 0.4, 0.95, 1.0), metallic=0.2, roughness=0.4)
    mat_mesh = create_pbr_material("Magnetic_Dust_Mesh", color=(0.03, 0.03, 0.035, 1.0), metallic=0.5, roughness=0.6)
    mat_logo = create_pbr_material("Ice_Master_White_Logo", color=(0.98, 0.98, 0.98, 1.0), metallic=0.2, roughness=0.15)

    # Master Root
    x7_root = bpy.data.objects.new("Ice_Master_Dynamite_X7", None)
    bpy.context.collection.objects.link(x7_root)

    # 1. Base Feet (4 Corner Angular Feet)
    fw, fd, fh = 42, 48, 24
    add_box("Foot_FL", [-140, 0, -210], [-140 + fw, fh, -210 + fd], mat_black_plastic, parent=x7_root)
    add_box("Foot_FR", [145 - fw, 0, -210], [145, fh, -210 + fd], mat_black_plastic, parent=x7_root)
    add_box("Foot_RL", [-140, 0, 210 - fd], [-140 + fw, fh, 210], mat_black_plastic, parent=x7_root)
    add_box("Foot_RR", [145 - fw, 0, 210 - fd], [145, fh, 210], mat_black_plastic, parent=x7_root)

    # 2. Bottom Plate
    add_box("Bottom_Chassis_Plate", [-140, 24, -215], [145, 30, 215], mat_powder_black, parent=x7_root)

    # 3. Top Panel & Magnetic Mesh Filter
    add_box("Top_Chassis_Panel", [-140, 432, -215], [145, 440, 215], mat_powder_black, parent=x7_root)
    add_box("Top_Dust_Filter", [-130, 440.5, -195], [35, 442, 195], mat_mesh, parent=x7_root)

    # Top I/O Precision Buttons & Ports
    add_cylinder("IO_Power_Ring", [95, 441.5, -180], 7.0, 3.5, axis='y', material=mat_silver_cnc, parent=x7_root)
    add_cylinder("IO_Power_Center", [95, 441.8, -180], 4.5, 4.0, axis='y', material=mat_brushed_black, parent=x7_root)
    add_cylinder("IO_LED_Button", [95, 441.5, -155], 4.5, 3.0, axis='y', material=mat_silver_cnc, parent=x7_root)
    add_box("IO_USB1_Metal", [89, 440.5, -137], [101, 443, -123], mat_silver_cnc, parent=x7_root)
    add_box("IO_USB1_Blue", [91, 441, -135], [99, 443.2, -125], mat_usb_blue, parent=x7_root)
    add_box("IO_USB2_Metal", [89, 440.5, -112], [101, 443, -98], mat_silver_cnc, parent=x7_root)
    add_box("IO_USB2_Blue", [91, 441, -110], [99, 443.2, -100], mat_usb_blue, parent=x7_root)
    add_cylinder("IO_TypeC", [95, 441.5, -82], 4.5, 3.0, axis='y', material=mat_silver_cnc, parent=x7_root)
    add_cylinder("IO_Audio", [95, 441.5, -62], 3.8, 3.0, axis='y', material=mat_gold_brass, parent=x7_root)

    # 4. Front Right Column
    add_box("Front_Right_Column", [50, 30, -215], [145, 432, -208], mat_brushed_black, parent=x7_root)

    # 5. Motherboard Tray & BTF Architecture
    add_box("MB_Tray_Main", [47, 30, -205], [51, 432, 205], mat_powder_black, parent=x7_root)
    add_box("CPU_Cooler_Cutout", [46, 260, 20], [52, 380, 140], mat_black_plastic, parent=x7_root)
    add_box("Grommet_24Pin", [46, 195, -25], [52, 305, 5], mat_black_plastic, parent=x7_root)

    # Gold Standoffs
    for pos in [[-110, 380, 150], [-30, 380, 150], [42, 380, 150], [-110, 250, 40], [-30, 250, 40], [42, 250, 40], [-110, 100, -70], [-30, 100, -70], [42, 100, -70]]:
        add_cylinder("MB_Standoff", pos, 3.0, 6.0, axis='x', material=mat_gold_brass, parent=x7_root, segs=16)

    # 6. Rear Panel & PCIe
    add_box("Rear_Panel_Plate", [-140, 30, 210], [145, 432, 215], mat_powder_black, parent=x7_root)
    add_box("Rear_IO_Shield", [-135, 270, 209], [-75, 415, 211], mat_silver_cnc, parent=x7_root)
    for i in range(8):
        add_box(f"PCIe_Slot_{i}", [-135, 80 + i*22, 209], [-70, 98 + i*22, 211], mat_brushed_black, parent=x7_root)
    add_box("Vertical_GPU_Slot", [-65, 90, 209], [-45, 240, 211], mat_brushed_black, parent=x7_root)
    add_box("PSU_Mount_Cutout", [60, 60, 209], [135, 180, 211], mat_powder_black, parent=x7_root)

    # 7. Right Side Steel Panel & Mesh
    add_box("Right_Side_Steel_Panel", [142, 30, -210], [145, 432, 210], mat_powder_black, parent=x7_root)
    add_box("Right_Side_Vent_Mesh", [141.5, 60, -180], [145.5, 400, -40], mat_mesh, parent=x7_root)

    # 8. SIGNATURE DYNAMITE X7 ANGLED PSU SHROUD & FAN MOUNT
    # Rear horizontal PSU shroud shelf
    add_box("X7_Shroud_Rear_Shelf", [-138, 30, 70], [45, 115, 205], mat_powder_black, parent=x7_root)
    # Angled ramp middle section (45 degree incline)
    add_box("X7_Shroud_Angled_Ramp", [-138, 30, -50], [45, 115, 70], mat_powder_black, parent=x7_root, rotation=(math.radians(-32), 0, 0))
    # Front bottom flat floor
    add_box("X7_Shroud_Front_Floor", [-138, 30, -200], [45, 34, -50], mat_powder_black, parent=x7_root)
    
    # Official White "IM ICE MASTER" Logo on Shroud Side
    add_box("X7_Logo_Plate", [-139, 45, 20], [-138.2, 85, 90], mat_logo, parent=x7_root)

    # 9. Panoramic Dual Tempered Glass (Front + Left Side)
    # Front Glass
    add_box("Front_Tempered_Glass", [-140, 30, -215], [50, 432, -211], mat_glass, parent=x7_root)
    add_box("Front_Glass_Border_Top", [-140, 422, -215.2], [50, 432, -210.8], mat_glass_border, parent=x7_root)
    add_box("Front_Glass_Border_Bot", [-140, 30, -215.2], [50, 40, -210.8], mat_glass_border, parent=x7_root)
    add_cylinder("Screw_Glass_FL_Top", [-134, 424, -216], 7.5, 4.5, axis='z', material=mat_silver_cnc, parent=x7_root)
    add_cylinder("Screw_Glass_FL_Bot", [-134, 38, -216], 7.5, 4.5, axis='z', material=mat_silver_cnc, parent=x7_root)

    # Left Side Glass
    add_box("Side_Tempered_Glass", [-143, 30, -211], [-139, 432, 210], mat_glass, parent=x7_root)
    add_box("Side_Glass_Border_Top", [-143.2, 422, -211], [-138.8, 432, 210], mat_glass_border, parent=x7_root)
    add_box("Side_Glass_Border_Bot", [-143.2, 30, -211], [-138.8, 40, 210], mat_glass_border, parent=x7_root)
    add_box("Side_Glass_Border_Rear", [-143.2, 30, 200], [-138.8, 432, 210], mat_glass_border, parent=x7_root)
    add_cylinder("Screw_Glass_SL_Top", [-144.5, 424, 195], 7.5, 4.5, axis='x', material=mat_silver_cnc, parent=x7_root)
    add_cylinder("Screw_Glass_SL_Bot", [-144.5, 38, 195], 7.5, 4.5, axis='x', material=mat_silver_cnc, parent=x7_root)

    # 10. EXACT DYNAMITE X7 ARGB FANS SETUP (7 Fans Total):
    # 3x Side Vertical Fans (Rainbow Gradient Glow)
    add_fan("X7_Fan_Side_1", [43, 355, -95], 'x', (0.0, 0.95, 1.0, 1.0), x7_root, mat_black_plastic, mat_brushed_black) # Top Side Cyan
    add_fan("X7_Fan_Side_2", [43, 230, -95], 'x', (1.0, 0.85, 0.0, 1.0), x7_root, mat_black_plastic, mat_brushed_black) # Mid Side Yellow
    add_fan("X7_Fan_Side_3", [43, 105, -95], 'x', (1.0, 0.1, 0.5, 1.0), x7_root, mat_black_plastic, mat_brushed_black)  # Bot Side Pink

    # 1x Rear Exhaust Fan (Emerald Green)
    add_fan("X7_Fan_Rear", [-45, 345, 195], 'z', (0.0, 1.0, 0.4, 1.0), x7_root, mat_black_plastic, mat_brushed_black)

    # 1x Rear Shroud Horizontal Fan (Sky Blue / Yellow)
    add_fan("X7_Fan_Shroud_Rear", [-45, 130, 140], 'y', (0.0, 0.6, 1.0, 1.0), x7_root, mat_black_plastic, mat_brushed_black)

    # 1x SIGNATURE 45° ANGLED INCLINE FAN (Vibrant ARGB Sunset)
    add_fan("X7_Fan_Angled_Incline", [-45, 80, 5], 'y', (1.0, 0.35, 0.05, 1.0), x7_root, mat_black_plastic, mat_brushed_black, custom_rot=(math.radians(-32), 0, 0))

    # 1x Front Bottom Horizontal Fan (Aqua / Cyan)
    add_fan("X7_Fan_Bottom_Front", [-45, 48, -125], 'y', (0.0, 0.95, 0.85, 1.0), x7_root, mat_black_plastic, mat_brushed_black)

    # 11. Studio Dark Glossy Floor Pedestal
    mat_floor = create_pbr_material("Dark_Glossy_Floor", color=(0.012, 0.015, 0.022, 1.0), metallic=0.88, roughness=0.15)
    bpy.ops.mesh.primitive_cylinder_add(radius=650, depth=10, vertices=64, location=(0, 0, -5))
    floor = bpy.context.active_object
    floor.name = "Studio_Pedestal"
    floor.data.materials.append(mat_floor)

    # 12. Studio 3-Point Lights (Sun & Area Softboxes)
    # Main Key Light
    sun_data = bpy.data.lights.new(name="Key_Sun", type='SUN')
    sun_data.energy = 4.5
    sun_data.color = (1.0, 0.98, 0.95)
    sun_obj = bpy.data.objects.new("Key_Sun", sun_data)
    bpy.context.collection.objects.link(sun_obj)
    sun_obj.location = (-600, -700, 600)
    sun_obj.rotation_euler = (math.radians(45), math.radians(20), math.radians(-35))

    # Fill Softbox (Cool Blue)
    fill_data = bpy.data.lights.new(name="Fill_Softbox", type='SUN')
    fill_data.energy = 2.5
    fill_data.color = (0.65, 0.85, 1.0)
    fill_obj = bpy.data.objects.new("Fill_Softbox", fill_data)
    bpy.context.collection.objects.link(fill_obj)
    fill_obj.location = (700, -400, 400)
    fill_obj.rotation_euler = (math.radians(50), math.radians(-15), math.radians(65))

    # Rim Softbox (Neon Pink/Magenta)
    rim_data = bpy.data.lights.new(name="Rim_Softbox", type='SUN')
    rim_data.energy = 3.0
    rim_data.color = (1.0, 0.15, 0.8)
    rim_obj = bpy.data.objects.new("Rim_Softbox", rim_data)
    bpy.context.collection.objects.link(rim_obj)
    rim_obj.location = (0, 700, 500)
    rim_obj.rotation_euler = (math.radians(-45), 0, math.radians(180))

    # 13. Camera & 360° Turntable Rig Setup
    target_empty = bpy.data.objects.new("LookTarget", None)
    bpy.context.collection.objects.link(target_empty)
    target_empty.location = (0, 0, 220)

    turntable_rig = bpy.data.objects.new("Turntable_Rig", None)
    bpy.context.collection.objects.link(turntable_rig)
    turntable_rig.location = (0, 0, 220)

    cam_data = bpy.data.cameras.new("Showcase_Camera")
    cam_data.lens = 52
    cam_data.clip_start = 10
    cam_data.clip_end = 5000
    cam_obj = bpy.data.objects.new("Showcase_Camera", cam_data)
    bpy.context.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj

    # Parent Camera to Turntable Rig
    cam_obj.parent = turntable_rig
    cam_obj.location = (-680, -680, 140)

    # Track To Constraint
    tt = cam_obj.constraints.new(type='TRACK_TO')
    tt.target = target_empty
    tt.track_axis = 'TRACK_NEGATIVE_Z'
    tt.up_axis = 'UP_Y'

    # Turntable 360° Animation (90 Frames = 3 Seconds @ 30fps seamless loop)
    scene = bpy.context.scene
    scene.frame_start = 1
    scene.frame_end = 90
    scene.render.fps = 30

    turntable_rig.rotation_euler = (0, 0, 0)
    turntable_rig.keyframe_insert(data_path="rotation_euler", frame=1)
    turntable_rig.rotation_euler = (0, 0, math.radians(360))
    turntable_rig.keyframe_insert(data_path="rotation_euler", frame=91)

    if turntable_rig.animation_data and turntable_rig.animation_data.action:
        for fcurve in turntable_rig.animation_data.action.fcurves:
            for kf in fcurve.keyframe_points:
                kf.interpolation = 'LINEAR'

    # Render settings: Full HD 1920x1080
    scene.render.resolution_x = 1920
    scene.render.resolution_y = 1080
    scene.render.resolution_percentage = 100

    # 14. Save .blend Project File
    blend_path = r"E:\IceMaster_Project\Ice_Master_Dynamite_X7.blend"
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    print(f"Saved Blender File: {blend_path}")

    # 15. Render Perspective Showcase Still (Frame 1)
    scene.frame_set(1)
    img_path_showcase = r"E:\IceMaster_Project\Dynamite_X7_Showcase_Render.png"
    scene.render.filepath = img_path_showcase
    scene.render.image_settings.file_format = 'PNG'
    bpy.ops.render.render(write_still=True)
    print(f"Rendered Still 1: {img_path_showcase}")

    # 16. Render Side Aquarium Still (Frame 23 = ~90 degrees)
    scene.frame_set(23)
    img_path_side = r"E:\IceMaster_Project\Dynamite_X7_Side_Render.png"
    scene.render.filepath = img_path_side
    bpy.ops.render.render(write_still=True)
    print(f"Rendered Still 2: {img_path_side}")

    # Reset frame to 1
    scene.frame_set(1)

if __name__ == '__main__':
    build_ice_master_dynamite_x7()