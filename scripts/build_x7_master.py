import bpy
import os
import math

def clean_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)

# -------------------------------------------------------------
# Material Utilities
# -------------------------------------------------------------
def create_pbr_mat(name, color=(0.1, 0.1, 0.1, 1.0), metallic=0.0, roughness=0.5):
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

def create_glass_mat(name="X7_Tempered_Glass", tint=(0.96, 0.98, 1.0, 1.0), alpha=0.06):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    mat.surface_render_method = 'BLENDED'
    mat.blend_method = 'BLEND'
    mat.use_screen_refraction = True
    mat.use_raytrace_refraction = True
    
    nodes = mat.node_tree.nodes
    nodes.clear()
    
    bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    bsdf.inputs['Base Color'].default_value = tint
    bsdf.inputs['Roughness'].default_value = 0.01
    bsdf.inputs['Metallic'].default_value = 0.05
    if 'Transmission Weight' in bsdf.inputs:
        bsdf.inputs['Transmission Weight'].default_value = 0.98
    elif 'Transmission' in bsdf.inputs:
        bsdf.inputs['Transmission'].default_value = 0.98
    if 'Alpha' in bsdf.inputs:
        bsdf.inputs['Alpha'].default_value = alpha
    bsdf.inputs['IOR'].default_value = 1.52
    
    output = nodes.new(type='ShaderNodeOutputMaterial')
    mat.node_tree.links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
    return mat

def create_emission_mat(name, color=(0.0, 0.95, 1.0, 1.0), strength=6.0):
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

# -------------------------------------------------------------
# Geometry Helpers
# -------------------------------------------------------------
def add_box(name, x_range, y_range, z_range, material, parent=None, rotation=None):
    x0, x1 = min(x_range), max(x_range)
    y0, y1 = min(y_range), max(y_range)
    z0, z1 = min(z_range), max(z_range)
    
    sx = (x1 - x0) / 2.0
    sy = (y1 - y0) / 2.0
    sz = (z1 - z0) / 2.0
    cx = (x0 + x1) / 2.0
    cy = (y0 + y1) / 2.0
    cz = (z0 + z1) / 2.0
    
    bpy.ops.mesh.primitive_cube_add(size=2.0, location=(cx, cy, cz))
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = (sx, sy, sz)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if rotation:
        obj.rotation_euler = rotation
    if material:
        obj.data.materials.append(material)
    if parent:
        obj.parent = parent
    return obj

def add_cylinder(name, location, radius, height, axis='z', material=None, parent=None, segs=32):
    bpy.ops.mesh.primitive_cylinder_add(radius=radius, depth=height, vertices=segs, location=location)
    obj = bpy.context.active_object
    obj.name = name
    if axis == 'x':
        obj.rotation_euler = (0, math.pi / 2, 0)
    elif axis == 'y':
        obj.rotation_euler = (math.pi / 2, 0, 0)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
    if material:
        obj.data.materials.append(material)
    if parent:
        obj.parent = parent
    return obj

# -------------------------------------------------------------
# Detailed ARGB Fan Builder (120mm x 120mm x 25mm)
# -------------------------------------------------------------
def add_argb_fan(name, center, rotation=(0,0,0), core_color=(0.0, 0.95, 1.0, 1.0), rim_color=(1.0, 0.1, 0.6, 1.0), parent=None):
    fan_empty = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(fan_empty)
    fan_empty.location = center
    fan_empty.rotation_euler = rotation

    if parent:
        fan_empty.parent = parent

    mat_frame = create_pbr_mat(f"{name}_MatFrame", color=(0.035, 0.035, 0.04, 1.0), metallic=0.3, roughness=0.55)
    mat_hub = create_pbr_mat(f"{name}_MatHub", color=(0.015, 0.015, 0.02, 1.0), metallic=0.92, roughness=0.15)
    mat_halo = create_emission_mat(f"{name}_HaloMat", color=rim_color, strength=7.5)
    mat_strip = create_emission_mat(f"{name}_StripMat", color=rim_color, strength=6.5)
    mat_blade = create_emission_mat(f"{name}_BladeMat", color=core_color, strength=5.5)

    # Fan Local Coordinates:
    # Face of the fan is in XY plane (looking along +Z).
    # Width X: -60 to 60, Height Y: -60 to 60, Thickness Z: -12.5 to 12.5
    add_box(f"{name}_Frame_T", [-60, 60], [52, 60], [-12.5, 12.5], mat_frame, parent=fan_empty)
    add_box(f"{name}_Frame_B", [-60, 60], [-60, -52], [-12.5, 12.5], mat_frame, parent=fan_empty)
    add_box(f"{name}_Frame_L", [-60, -52], [-52, 52], [-12.5, 12.5], mat_frame, parent=fan_empty)
    add_box(f"{name}_Frame_R", [52, 60], [-52, 52], [-12.5, 12.5], mat_frame, parent=fan_empty)

    # Corner anti-vibration rubber dampeners
    mat_rubber = create_pbr_mat(f"{name}_Rubber", color=(0.01, 0.01, 0.012, 1.0), metallic=0.0, roughness=0.95)
    for cx in [-56, 56]:
        for cy in [-56, 56]:
            add_box(f"{name}_Pad_{cx}_{cy}", [cx-4, cx+4], [cy-4, cy+4], [-13, 13], mat_rubber, parent=fan_empty)

    # Side infinity mirror accent strips
    add_box(f"{name}_SideStrip_L", [-60.5, -59.5], [-45, 45], [-10, 10], mat_strip, parent=fan_empty)
    add_box(f"{name}_SideStrip_R", [59.5, 60.5], [-45, 45], [-10, 10], mat_strip, parent=fan_empty)

    # Outer ARGB Glowing Halo Ring
    add_cylinder(f"{name}_HaloRing", (0, 0, 0), radius=53, height=22, axis='z', material=mat_halo, parent=fan_empty, segs=36)

    # Center Motor Spinner Hub (Dark Glossy + ARGB inner ring)
    add_cylinder(f"{name}_CenterHub", (0, 0, 0), radius=22, height=24, axis='z', material=mat_hub, parent=fan_empty, segs=32)
    add_cylinder(f"{name}_CenterLogoRing", (0, 0, 12.2), radius=16, height=1.0, axis='z', material=mat_blade, parent=fan_empty, segs=32)

    # 9 Curved Aerodynamic Glowing Blades
    for i in range(9):
        ang = (i / 9.0) * math.pi * 2.0
        bx = math.cos(ang) * 36.0
        by = math.sin(ang) * 36.0
        blade = add_box(f"{name}_Blade_{i}", [-14, 14], [-5, 5], [-2.5, 2.5], mat_blade, parent=fan_empty)
        blade.location = (bx, by, 0)
        blade.rotation_euler = (math.radians(35), 0, ang)

    return fan_empty

# -------------------------------------------------------------
# Main Builder Function
# -------------------------------------------------------------
def build_master_dynamite_x7():
    clean_scene()
    print(">>> Building Ice Master Dynamite X7 Production Scene...")

    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE_NEXT'
    scene.eevee.use_raytracing = True
    scene.eevee.use_ssr = True
    scene.eevee.use_ssr_refraction = True
    scene.eevee.use_gtao = True

    # Compositor Glare / Bloom
    scene.use_nodes = True
    tree = scene.node_tree
    tree.nodes.clear()
    render_layers = tree.nodes.new(type='CompositorNodeRLayers')
    glare_node = tree.nodes.new(type='CompositorNodeGlare')
    glare_node.glare_type = 'FOG_GLOW'
    glare_node.quality = 'HIGH'
    glare_node.threshold = 1.0
    glare_node.size = 8
    composite_node = tree.nodes.new(type='CompositorNodeComposite')
    tree.links.new(render_layers.outputs['Image'], glare_node.inputs['Image'])
    tree.links.new(glare_node.outputs['Image'], composite_node.inputs['Image'])

    # Dark Studio World Environment
    world = bpy.data.worlds.new("X7_Studio_World")
    scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs['Color'].default_value = (0.018, 0.020, 0.028, 1.0)
        bg.inputs['Strength'].default_value = 1.0

    # Materials
    mat_powder_black = create_pbr_mat("Matte_Powder_Black", color=(0.038, 0.038, 0.042, 1.0), metallic=0.88, roughness=0.45)
    mat_brushed_black = create_pbr_mat("Brushed_Anodized_Black", color=(0.015, 0.015, 0.018, 1.0), metallic=0.96, roughness=0.20)
    mat_plastic_black = create_pbr_mat("Matte_Black_Plastic", color=(0.045, 0.045, 0.05, 1.0), metallic=0.05, roughness=0.75)
    mat_glass = create_glass_mat("Panoramic_Tempered_Glass", tint=(0.95, 0.98, 1.0, 1.0), alpha=0.06)
    mat_glass_border = create_pbr_mat("Glass_Ceramic_Border", color=(0.008, 0.008, 0.01, 1.0), metallic=0.1, roughness=0.25)
    mat_silver_cnc = create_pbr_mat("Silver_CNC_Hardware", color=(0.92, 0.94, 0.96, 1.0), metallic=0.98, roughness=0.12)
    mat_gold_brass = create_pbr_mat("Gold_Brass_Standoffs", color=(0.92, 0.72, 0.15, 1.0), metallic=0.95, roughness=0.18)
    mat_usb_blue = create_pbr_mat("USB_3_Blue", color=(0.0, 0.45, 0.98, 1.0), metallic=0.1, roughness=0.4)
    mat_mesh = create_pbr_mat("Magnetic_Dust_Mesh", color=(0.02, 0.02, 0.025, 1.0), metallic=0.6, roughness=0.55)
    mat_logo = create_emission_mat("Ice_Master_Logo_Mat", color=(0.98, 0.99, 1.0, 1.0), strength=2.8)

    # Master Root
    root = bpy.data.objects.new("Ice_Master_Dynamite_X7", None)
    bpy.context.collection.objects.link(root)

    # 1. 4 Corner Angular Feet
    fw, fd, fh = 38, 44, 22
    add_box("Foot_FL", [-120, -120 + fw], [-215, -215 + fd], [0, fh], mat_plastic_black, parent=root)
    add_box("Foot_FR", [120 - fw, 120], [-215, -215 + fd], [0, fh], mat_plastic_black, parent=root)
    add_box("Foot_RL", [-120, -120 + fw], [215 - fd, 215], [0, fh], mat_plastic_black, parent=root)
    add_box("Foot_RR", [120 - fw, 120], [215 - fd, 215], [0, fh], mat_plastic_black, parent=root)

    # 2. Bottom Chassis Plate & Filter
    add_box("Bottom_Chassis_Plate", [-120, 120], [-215, 215], [fh, fh + 6], mat_powder_black, parent=root)
    add_box("Bottom_Dust_Filter", [-110, 35], [-190, 190], [fh - 1.5, fh], mat_mesh, parent=root)

    # 3. Top Chassis Panel & Top I/O Ports
    add_box("Top_Chassis_Panel", [-120, 120], [-215, 215], [442, 450], mat_powder_black, parent=root)
    add_box("Top_Dust_Filter", [-110, 45], [-195, 195], [450.2, 451.2], mat_mesh, parent=root)
    add_box("Top_Mesh_Border", [-112, 47], [-197, 197], [450, 450.5], mat_powder_black, parent=root)

    # Top I/O Precision Buttons & Ports
    add_cylinder("IO_Power_Ring", (85, -170, 451.2), radius=6.5, height=2.5, axis='z', material=mat_silver_cnc, parent=root)
    add_cylinder("IO_Power_Center", (85, -170, 451.5), radius=4.2, height=2.8, axis='z', material=mat_brushed_black, parent=root)
    add_cylinder("IO_LED_Button", (85, -145, 451.2), radius=4.2, height=2.2, axis='z', material=mat_silver_cnc, parent=root)
    add_box("IO_USB1_Metal", [80, 90], [-127, -115], [450.5, 452], mat_silver_cnc, parent=root)
    add_box("IO_USB1_Blue", [82, 88], [-125, -117], [451, 452.2], mat_usb_blue, parent=root)
    add_box("IO_USB2_Metal", [80, 90], [-102, -90], [450.5, 452], mat_silver_cnc, parent=root)
    add_box("IO_USB2_Blue", [82, 88], [-100, -92], [451, 452.2], mat_usb_blue, parent=root)
    add_cylinder("IO_TypeC", (85, -72, 451.2), radius=4.0, height=2.2, axis='z', material=mat_silver_cnc, parent=root)
    add_cylinder("IO_Audio", (85, -52, 451.2), radius=3.8, height=2.2, axis='z', material=mat_gold_brass, parent=root)

    # 4. Front-Right Column (Brushed Aluminum)
    add_box("Front_Right_Column", [50, 120], [-215, -208], [fh + 6, 442], mat_brushed_black, parent=root)

    # 5. Motherboard Tray & Standoffs
    add_box("MB_Tray_Main", [44, 48], [-205, 205], [fh + 6, 442], mat_powder_black, parent=root)
    add_box("CPU_Cooler_Cutout", [43, 49], [30, 150], [270, 390], mat_plastic_black, parent=root)
    add_box("Grommet_24Pin", [43, 49], [-20, 10], [210, 320], mat_plastic_black, parent=root)
    
    standoff_coords = [
        (-95, 160, 390), (-20, 160, 390), (40, 160, 390),
        (-95, 50, 260),  (-20, 50, 260),  (40, 50, 260),
        (-95, -60, 130), (-20, -60, 130), (40, -60, 130)
    ]
    for idx, sc in enumerate(standoff_coords):
        add_cylinder(f"MB_Standoff_{idx}", sc, radius=3.2, height=6.5, axis='x', material=mat_gold_brass, parent=root, segs=16)

    # 6. Rear Panel & PCIe Slots
    add_box("Rear_Panel_Plate", [-120, 120], [210, 215], [fh + 6, 442], mat_powder_black, parent=root)
    add_box("Rear_IO_Shield", [-115, -55], [209, 211], [270, 415], mat_silver_cnc, parent=root)
    for i in range(7):
        add_box(f"PCIe_Slot_{i}", [-115, -50], [209, 211], [85 + i*22, 103 + i*22], mat_brushed_black, parent=root)
    add_box("Vertical_GPU_Slot", [-45, -25], [209, 211], [90, 240], mat_brushed_black, parent=root)
    add_box("PSU_Mount_Frame", [55, 115], [209, 211], [60, 180], mat_powder_black, parent=root)

    # 7. Right Side Steel Panel & Side Mesh
    add_box("Right_Side_Steel_Panel", [117, 120], [-210, 210], [fh + 6, 442], mat_powder_black, parent=root)
    add_box("Right_Side_Vent_Mesh", [116.5, 120.5], [-175, -25], [60, 410], mat_mesh, parent=root)

    # 8. SIGNATURE DYNAMITE X7 ANGLED PSU SHROUD & LOGO
    # Flat horizontal rear shelf (Z = 120)
    add_box("X7_Shroud_Rear_Shelf", [-118, 44], [65, 208], [fh + 6, 120], mat_powder_black, parent=root)
    # Angled 45-degree middle ramp section (sloping from Y=65 down to Y=-45)
    add_box("X7_Shroud_Angled_Ramp", [-118, 44], [-45, 65], [fh + 6, 120], mat_powder_black, parent=root, rotation=(math.radians(38), 0, 0))
    # Front bottom flat floor (Z = fh + 6 = 28)
    add_box("X7_Shroud_Front_Floor", [-118, 44], [-208, -45], [fh + 6, fh + 12], mat_powder_black, parent=root)

    # Stylized White "IM ICE MASTER" Logo on Shroud Side (Left face)
    add_box("X7_Logo_Plate_Back", [-119.2, -118.6], [80, 175], [45, 105], mat_powder_black, parent=root)
    # Crown "iM" Emblem
    add_box("Logo_I_Bar", [-119.5, -118.9], [95, 102], [65, 96], mat_logo, parent=root)
    add_box("Logo_M_Left", [-119.5, -118.9], [110, 117], [65, 96], mat_logo, parent=root)
    add_box("Logo_M_Right", [-119.5, -118.9], [138, 145], [65, 96], mat_logo, parent=root)
    add_box("Logo_M_Peak1", [-119.5, -118.9], [116, 122], [76, 96], mat_logo, parent=root, rotation=(0, math.radians(-28), 0))
    add_box("Logo_M_Peak2", [-119.5, -118.9], [133, 139], [76, 96], mat_logo, parent=root, rotation=(0, math.radians(28), 0))
    # "ICE MASTER" Text
    add_box("Logo_Text_IceMaster", [-119.5, -118.9], [90, 150], [50, 58], mat_logo, parent=root)

    # 9. Panoramic Dual Tempered Glass (Front + Left)
    add_box("Front_Tempered_Glass", [-120, 50], [-215, -211], [fh + 6, 442], mat_glass, parent=root)
    add_box("Front_Glass_Border_Top", [-120, 50], [-215.2, -210.8], [432, 442], mat_glass_border, parent=root)
    add_box("Front_Glass_Border_Bot", [-120, 50], [-215.2, -210.8], [fh + 6, fh + 16], mat_glass_border, parent=root)
    add_cylinder("Screw_Front_Top", (42, -216, 437), radius=6.5, height=4.0, axis='y', material=mat_silver_cnc, parent=root)
    add_cylinder("Screw_Front_Bot", (42, -216, fh + 11), radius=6.5, height=4.0, axis='y', material=mat_silver_cnc, parent=root)

    add_box("Side_Tempered_Glass", [-124, -120], [-211, 210], [fh + 6, 442], mat_glass, parent=root)
    add_box("Side_Glass_Border_Top", [-124.2, -119.8], [-211, 210], [432, 442], mat_glass_border, parent=root)
    add_box("Side_Glass_Border_Bot", [-124.2, -119.8], [-211, 210], [fh + 6, fh + 16], mat_glass_border, parent=root)
    add_box("Side_Glass_Border_Rear", [-124.2, -119.8], [200, 210], [fh + 6, 442], mat_glass_border, parent=root)
    add_cylinder("Screw_Side_Top", (-125.5, 202, 437), radius=6.5, height=4.0, axis='x', material=mat_silver_cnc, parent=root)
    add_cylinder("Screw_Side_Bot", (-125.5, 202, fh + 11), radius=6.5, height=4.0, axis='x', material=mat_silver_cnc, parent=root)

    # 10. EXACT 7x DYNAMITE X7 ARGB FANS WITH PROPER FACINGS
    # 3x Side Vertical Fans (Mounted along right side wall, blowing into case towards -X)
    # Rotation (0, -pi/2, 0) points local +Z towards -X (towards left glass)
    add_argb_fan("X7_Fan_Side_Top", center=(32, -100, 365), rotation=(0, -math.pi/2, 0),
                 core_color=(0.0, 0.95, 1.0, 1.0), rim_color=(0.1, 0.5, 1.0, 1.0), parent=root)
    add_argb_fan("X7_Fan_Side_Mid", center=(32, -100, 240), rotation=(0, -math.pi/2, 0),
                 core_color=(1.0, 0.85, 0.05, 1.0), rim_color=(1.0, 0.35, 0.0, 1.0), parent=root)
    add_argb_fan("X7_Fan_Side_Bot", center=(32, -100, 115), rotation=(0, -math.pi/2, 0),
                 core_color=(1.0, 0.1, 0.65, 1.0), rim_color=(0.8, 0.0, 1.0, 1.0), parent=root)

    # 1x Rear Exhaust Fan (Facing front into case towards -Y)
    # Rotation (pi/2, 0, 0) points local +Z towards -Y
    add_argb_fan("X7_Fan_Rear_Exhaust", center=(-35, 195, 345), rotation=(math.pi/2, 0, 0),
                 core_color=(0.0, 1.0, 0.45, 1.0), rim_color=(0.0, 0.9, 0.8, 1.0), parent=root)

    # 1x Shroud Rear Horizontal Fan (Facing upwards +Z)
    add_argb_fan("X7_Fan_Shroud_Rear", center=(-35, 140, 133), rotation=(0, 0, 0),
                 core_color=(0.0, 0.65, 1.0, 1.0), rim_color=(1.0, 0.8, 0.0, 1.0), parent=root)

    # 1x SIGNATURE 45° ANGLED INCLINE FAN (Facing upwards and towards front-left at 38 deg incline)
    # Rotation (math.radians(38), 0, 0) points local +Z towards -Y (front) and +Z (upwards)
    add_argb_fan("X7_Fan_Angled_Incline", center=(-35, 10, 78), rotation=(math.radians(38), 0, 0),
                 core_color=(1.0, 0.38, 0.05, 1.0), rim_color=(1.0, 0.05, 0.4, 1.0), parent=root)

    # 1x Front Bottom Horizontal Fan (Facing upwards +Z)
    add_argb_fan("X7_Fan_Bottom_Front", center=(-35, -125, 42), rotation=(0, 0, 0),
                 core_color=(0.0, 0.98, 0.85, 1.0), rim_color=(0.1, 0.4, 1.0, 1.0), parent=root)

    # 11. Studio Dark Glossy Floor Pedestal
    mat_pedestal = create_pbr_mat("Studio_Gloss_Floor", color=(0.012, 0.015, 0.022, 1.0), metallic=0.88, roughness=0.18)
    bpy.ops.mesh.primitive_cylinder_add(radius=750, depth=10, vertices=64, location=(0, 0, -5))
    pedestal = bpy.context.active_object
    pedestal.name = "Studio_Pedestal"
    pedestal.data.materials.append(mat_pedestal)

    # 12. Studio 3-Point Lights
    sun_key = bpy.data.lights.new(name="Studio_Key_Sun", type='SUN')
    sun_key.energy = 5.0
    sun_key.color = (1.0, 0.98, 0.95)
    sun_key_obj = bpy.data.objects.new("Studio_Key_Sun", sun_key)
    bpy.context.collection.objects.link(sun_key_obj)
    sun_key_obj.location = (-700, -800, 700)
    sun_key_obj.rotation_euler = (math.radians(48), math.radians(18), math.radians(-38))

    sun_fill = bpy.data.lights.new(name="Studio_Fill_Sun", type='SUN')
    sun_fill.energy = 3.0
    sun_fill.color = (0.70, 0.88, 1.0)
    sun_fill_obj = bpy.data.objects.new("Studio_Fill_Sun", sun_fill)
    bpy.context.collection.objects.link(sun_fill_obj)
    sun_fill_obj.location = (800, -400, 500)
    sun_fill_obj.rotation_euler = (math.radians(52), math.radians(-15), math.radians(68))

    sun_rim = bpy.data.lights.new(name="Studio_Rim_Sun", type='SUN')
    sun_rim.energy = 4.2
    sun_rim.color = (1.0, 0.18, 0.85)
    sun_rim_obj = bpy.data.objects.new("Studio_Rim_Sun", sun_rim)
    bpy.context.collection.objects.link(sun_rim_obj)
    sun_rim_obj.location = (0, 800, 600)
    sun_rim_obj.rotation_euler = (math.radians(-48), 0, math.radians(180))

    # 13. Camera & 360° Turntable Rig Setup
    center_z = 225
    target_empty = bpy.data.objects.new("LookTarget", None)
    bpy.context.collection.objects.link(target_empty)
    target_empty.location = (0, 0, center_z)

    turntable_rig = bpy.data.objects.new("Turntable_Rig", None)
    bpy.context.collection.objects.link(turntable_rig)
    turntable_rig.location = (0, 0, center_z)

    cam_data = bpy.data.cameras.new("Showcase_Camera")
    cam_data.lens = 46
    cam_data.clip_start = 10
    cam_data.clip_end = 5000
    cam_obj = bpy.data.objects.new("Showcase_Camera", cam_data)
    bpy.context.collection.objects.link(cam_obj)
    scene.camera = cam_obj

    cam_obj.parent = turntable_rig
    # Place camera at high-angle 3/4 perspective beauty showcase (matching official product photo)
    cam_obj.location = (-850, -850, 200)

    track_to = cam_obj.constraints.new(type='TRACK_TO')
    track_to.target = target_empty
    track_to.track_axis = 'TRACK_NEGATIVE_Z'
    track_to.up_axis = 'UP_Y'

    # Turntable 360° Animation (120 Frames = 4.0s @ 30fps)
    scene.frame_start = 1
    scene.frame_end = 120
    scene.render.fps = 30

    turntable_rig.rotation_euler = (0, 0, 0)
    turntable_rig.keyframe_insert(data_path="rotation_euler", frame=1)
    turntable_rig.rotation_euler = (0, 0, math.radians(360))
    turntable_rig.keyframe_insert(data_path="rotation_euler", frame=121)

    if turntable_rig.animation_data and turntable_rig.animation_data.action:
        for fcurve in turntable_rig.animation_data.action.fcurves:
            for kf in fcurve.keyframe_points:
                kf.interpolation = 'LINEAR'

    scene.render.resolution_x = 1920
    scene.render.resolution_y = 1080
    scene.render.resolution_percentage = 100

    # 14. Save Master .blend Project
    blend_path = r"E:\IceMaster_Project\Ice_Master_Dynamite_X7.blend"
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    print(f"Saved Master Blend File: {blend_path}")

    # 15. Render Showcase High-Res Still Images
    scene.frame_set(1)
    img_path_showcase = r"E:\IceMaster_Project\Dynamite_X7_Showcase_Render.png"
    scene.render.filepath = img_path_showcase
    scene.render.image_settings.file_format = 'PNG'
    bpy.ops.render.render(write_still=True)
    print(f"Rendered Hero Showcase Still: {img_path_showcase}")

    # Still 2: Side Aquarium View (Frame 31)
    scene.frame_set(31)
    img_path_side = r"E:\IceMaster_Project\Dynamite_X7_Side_Render.png"
    scene.render.filepath = img_path_side
    bpy.ops.render.render(write_still=True)
    print(f"Rendered Side View Still: {img_path_side}")

    scene.frame_set(1)
    print(">>> Finished Still Renders Successfully!")

if __name__ == '__main__':
    build_master_dynamite_x7()
