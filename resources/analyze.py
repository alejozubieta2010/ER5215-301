import pygltflib, openpyxl

# Load GLB
gltf = pygltflib.GLTF2().load('E:\\PRUEBA BOM\\ER5215-301.glb')
scene = gltf.scenes[gltf.scene or 0]
root_idx = scene.nodes[0]
stp_idx = gltf.nodes[root_idx].children[0]
children = gltf.nodes[stp_idx].children or []

# Extract unique part numbers from GLB level 1
glb_parts = {}
for child_idx in children:
    name = gltf.nodes[child_idx].name
    pn = name.replace('.stp','')
    glb_parts[pn] = glb_parts.get(pn, 0) + 1

# Load Excel BOM
wb = openpyxl.load_workbook('E:\\PRUEBA BOM\\ER5215-301.xlsx')
ws = wb.active
bom_parts = {}
for row in ws.iter_rows(min_row=2, values_only=True):
    pn, desc, qty, vis = row
    bom_parts[pn] = {'qty': qty, 'desc': desc}

# Compare
glb_set = set(glb_parts.keys())
bom_set = set(bom_parts.keys())

in_both = glb_set & bom_set
only_glb = glb_set - bom_set
only_bom = bom_set - glb_set

print('=== RESUMEN ===')
print(f'Componentos unicos en GLB nivel 1: {len(glb_set)}')
print(f'Componentos unicos en BOM Excel:    {len(bom_set)}')
print(f'Relacionados (en ambos):            {len(in_both)}')
print(f'Solo en GLB:                        {len(only_glb)}')
print(f'Solo en BOM:                        {len(only_bom)}')
print()

print('=== RELACIONADOS (en ambos) ===')
for pn in sorted(in_both):
    qty_glb = glb_parts[pn]
    qty_bom = bom_parts[pn]['qty']
    desc = bom_parts[pn]['desc']
    print(f'  {pn:15s} | GLB x{qty_glb:2d} | BOM x{qty_bom:2d} | {desc}')
print()

print('=== SOLO EN GLB (no estan en BOM) ===')
for pn in sorted(only_glb):
    print(f'  {pn:15s} | GLB x{glb_parts[pn]:2d}')
print()

print('=== SOLO EN BOM (no estan en GLB nivel 1) ===')
for pn in sorted(only_bom):
    qty = bom_parts[pn]['qty']
    desc = bom_parts[pn]['desc']
    print(f'  {pn:15s} | BOM x{qty:2d} | {desc}')
