import pygltflib, openpyxl

# Extract GLB level-1 parts
gltf = pygltflib.GLTF2().load(r'E:\SDTD-2\ER5215-301_DEV\resources\models\ER5215-301.glb')
scene = gltf.scenes[gltf.scene or 0]
root = gltf.nodes[scene.nodes[0]]
stp = gltf.nodes[root.children[0]]
children = stp.children or []

glb_parts = {}
for idx in children:
    name = gltf.nodes[idx].name
    pn = name.replace('.stp', '').strip()
    glb_parts[pn] = glb_parts.get(pn, 0) + 1

# Extract BOM from Excel
wb = openpyxl.load_workbook(r'E:\SDTD-2\ER5215-301_DEV\resources\excel\ER5215-301.xlsx')
ws = wb.active
bom_parts = {}
for row in ws.iter_rows(min_row=2, values_only=True):
    pn, desc, qty, vis = row
    if pn is None:
        continue
    bom_parts[str(pn).strip()] = {'qty': qty, 'desc': desc, 'vis': vis}

# Compare
glb_set = set(glb_parts.keys())
bom_set = set(bom_parts.keys())

in_both = sorted(glb_set & bom_set)
only_glb = sorted(glb_set - bom_set)
only_bom = sorted(bom_set - glb_set)

print(f"=== RESUMEN ===")
print(f"GLB nivel-1 unicos:  {len(glb_set)}")
print(f"BOM unicos:          {len(bom_set)}")
print(f"En ambos:            {len(in_both)}")
print(f"Solo en GLB:         {len(only_glb)}")
print(f"Solo en BOM:         {len(only_bom)}")
print()

print("=== EN AMBOS ===")
for pn in in_both:
    qg = glb_parts[pn]
    qb = bom_parts[pn]['qty']
    desc = bom_parts[pn]['desc']
    status = "OK" if qg == qb else f"DIFERENCIA GLB={qg} BOM={qb}"
    print(f"  {pn:20s} | GLB x{qg:2d} | BOM x{qb:2d} | {status} | {desc}")
print()

print("=== SOLO EN GLB ===")
for pn in only_glb:
    print(f"  {pn:20s} | GLB x{glb_parts[pn]:2d}")
print()

print("=== SOLO EN BOM ===")
for pn in only_bom:
    qty = bom_parts[pn]['qty']
    desc = bom_parts[pn]['desc']
    vis = bom_parts[pn]['vis']
    print(f"  {pn:20s} | BOM x{qty:2d} | vis3d={vis} | {desc}")
