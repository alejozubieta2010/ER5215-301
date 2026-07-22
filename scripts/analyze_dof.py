import pygltflib
import numpy as np

gltf = pygltflib.GLTF2().load(r'E:\SDTD-2\ER5215-301_DEV\resources\models\ER5215-301.glb')

# === 1. Basic info ===
print("=" * 70)
print("GLB ANALYSIS: ER5215-301")
print("=" * 70)
print(f"Scenes: {len(gltf.scenes)}")
print(f"Nodes: {len(gltf.nodes)}")
print(f"Meshes: {len(gltf.meshes)}")
print(f"Materials: {len(gltf.materials)}")
print(f"Animations: {len(gltf.animations)}")
print(f"Skins: {len(gltf.skins)}")
print(f"Accessors: {len(gltf.accessors)}")
print()

# === 2. Animations ===
print("=" * 70)
print("ANIMATIONS")
print("=" * 70)
if gltf.animations:
    for i, anim in enumerate(gltf.animations):
        print(f"Animation {i}: '{anim.name}'")
        print(f"  Channels: {len(anim.channels)}")
        print(f"  Samplers: {len(anim.samplers)}")
        for ch in anim.channels:
            target = ch.target
            sampler = anim.samplers[ch.sampler]
            node = gltf.nodes[target.node] if target.node is not None else None
            print(f"    Channel: node='{node.name if node else 'N/A'}' path='{target.path}'")
        print()
else:
    print("No animations found.")
    print()

# === 3. Skins (skeletal) ===
print("=" * 70)
print("SKINS (Skeletal Joints)")
print("=" * 70)
if gltf.skins:
    for i, skin in enumerate(gltf.skins):
        print(f"Skin {i}: '{skin.name}'")
        print(f"  Joints: {len(skin.joints)}")
        print(f"  Root: {gltf.nodes[skin.skeleton].name if skin.skeleton is not None else 'N/A'}")
else:
    print("No skins/skeletal data found.")
print()

# === 4. Scene hierarchy with transforms ===
print("=" * 70)
print("SCENE HIERARCHY (Level 1-2)")
print("=" * 70)

scene = gltf.scenes[gltf.scene or 0]
root_idx = scene.nodes[0]
root = gltf.nodes[root_idx]

def get_transform(node):
    """Extract transform info from a node."""
    info = {}
    if node.translation:
        info['translation'] = [round(x, 4) for x in node.translation]
    if node.rotation:
        info['rotation'] = [round(x, 4) for x in node.rotation]
    if node.scale:
        info['scale'] = [round(x, 4) for x in node.scale]
    if node.matrix:
        info['matrix'] = [round(x, 4) for x in node.matrix]
    return info

def print_node(node_idx, depth=0, max_depth=3):
    if depth > max_depth:
        return
    node = gltf.nodes[node_idx]
    prefix = "  " * depth
    mesh_info = f" [MESH]" if node.mesh is not None else ""
    children_count = len(node.children or [])
    
    transform = get_transform(node)
    trans_str = ""
    if transform.get('translation'):
        t = transform['translation']
        trans_str += f" T=[{t[0]},{t[1]},{t[2]}]"
    if transform.get('rotation'):
        r = transform['rotation']
        # Convert quaternion to euler angles (approximate)
        w, x, y, z = r
        roll = round(np.degrees(np.arctan2(2*(w*x + y*z), 1 - 2*(x*x + y*y))), 2)
        pitch = round(np.degrees(np.arcsin(max(-1, min(1, 2*(w*y - z*x))))), 2)
        yaw = round(np.degrees(np.arctan2(2*(w*z + x*y), 1 - 2*(y*y + z*z))), 2)
        trans_str += f" R_euler=[{roll}deg,{pitch}deg,{yaw}deg]"
    if transform.get('scale') and transform['scale'] != [1.0, 1.0, 1.0]:
        s = transform['scale']
        trans_str += f" S=[{s[0]},{s[1]},{s[2]}]"
    
    print(f"{prefix}{node.name or f'node_{node_idx}'}{mesh_info} (children: {children_count}){trans_str}")
    
    for child_idx in (node.children or []):
        print_node(child_idx, depth + 1, max_depth)

print_node(root_idx, 0, 2)
print()

# === 5. Component-level analysis ===
print("=" * 70)
print("COMPONENT TRANSFORM ANALYSIS")
print("=" * 70)

stp_idx = root.children[0]
stp_node = gltf.nodes[stp_idx]

BOM = {'905001','905109','AR112-037','ER300-220','ER301-094','SR015-011','SR174-064','SR174-066','SR194-026','SR292-080','SR194-030','SR015-347',
       'SR054-034','SR054-120','SR054-123','SR103-004','SR103-007','SR105-010','SR105-013','SR111-002','SR111-005'}

# Axis analysis based on part type
print(f"\n{'Component':25s} {'Children':8s} {'Type':30s} {'Rotation Axis':20s}")
print("-" * 90)

for l1_idx in stp_node.children:
    l1 = gltf.nodes[l1_idx]
    pn = l1.name.replace('.stp', '').replace('stp', '').strip() if l1.name else ''
    children_count = len(l1.children or [])
    has_mesh = l1.mesh is not None
    transform = get_transform(l1)
    
    # Classify component type
    if has_mesh and children_count == 0:
        comp_type = "Leaf part (fixed)"
    elif children_count > 20:
        comp_type = "Sub-assembly (complex)"
    elif children_count > 0:
        comp_type = f"Sub-assembly ({children_count} children)"
    else:
        comp_type = "Leaf part"
    
    # Infer degrees of freedom from component name/pattern
    dof = "Fixed (0 DOF)"
    if pn.startswith('SR292'):
        dof = "Belt - Rotary Z"
    elif pn.startswith('SR174'):
        dof = "Pulley - Rotary Z"
    elif pn.startswith('SR194'):
        dof = "Hub - Rotary Z"
    elif pn.startswith('ER301'):
        dof = "Shaft - Rotary Z"
    elif 'Baldor' in (l1.name or ''):
        dof = "Motor - Rotary Z (input)"
    elif pn.startswith('ER300-220'):
        dof = "Guard support - Fixed"
    elif pn.startswith('AR112'):
        dof = "Drive guard - Fixed (opens)"
    elif pn.startswith('905109'):
        dof = "Rod assembly - Translation Y"
    elif pn.startswith('905001'):
        dof = "Reducer - Fixed (output rotary)"
    elif pn.startswith('SR054') or pn.startswith('SR103') or pn.startswith('SR105') or pn.startswith('SR111'):
        dof = "Fastener - Fixed (0 DOF)"
    elif pn.startswith('SR015'):
        dof = "Decal/sticker - Fixed (0 DOF)"
    
    in_bom = pn in BOM
    marker = " *" if in_bom else ""
    print(f"{l1.name:25s} {children_count:8d} {comp_type:30s} {dof:20s}{marker}")

print("\n* = BOM component")
print()

# === 6. Coordinate system analysis ===
print("=" * 70)
print("COORDINATE SYSTEM & MOVEMENT ANALYSIS")
print("=" * 70)
print()
print("Model orientation (after -90° X rotation applied in code):")
print("  X - Width (left-right)")
print("  Y - Height (up-down) = vertical axis")
print("  Z - Length (front-back)")
print()
print("Degrees of Freedom Summary:")
print("  +-------------------------+-----------+----------------------+")
print("  | Component               | DOF       | Movement             |")
print("  +-------------------------+-----------+----------------------+")
print("  | Motor (Baldor)          | 1 (Rot Z) | Input rotation       |")
print("  | Reducer (905001)        | 0 (Fixed) | Housing fixed        |")
print("  | Pulleys (SR174)         | 1 (Rot Z) | Belt-driven rotation |")
print("  | Belts (SR292)           | 1 (Rot Z) | Flexible rotation    |")
print("  | Hubs (SR194)            | 1 (Rot Z) | Bearing rotation     |")
print("  | Shaft (ER301-094)       | 1 (Rot Z) | Head shaft rotation  |")
print("  | Rod assembly (905109)   | 1 (Tr Y)  | Vertical translation |")
print("  | Fasteners               | 0 (Fixed) | Bolted, no movement  |")
print("  | Decals                  | 0 (Fixed) | Adhesive, no movement|")
print("  | Guard (AR112)           | 1 (Rot Z) | Opens for access     |")
print("  | Guard support (ER300)   | 0 (Fixed) | Structural mount     |")
print("  +-------------------------+-----------+----------------------+")
