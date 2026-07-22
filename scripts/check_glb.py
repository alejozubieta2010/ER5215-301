import pygltflib

gltf = pygltflib.GLTF2().load(r'E:\SDTD-2\ER5215-301_DEV\resources\models\ER5215-301.glb')
scene = gltf.scenes[gltf.scene or 0]
root = gltf.nodes[scene.nodes[0]]
stp = gltf.nodes[root.children[0]]

BOM = {'905001','905109','AR112-037','ER300-220','ER301-094','SR015-011','SR174-064','SR174-066','SR194-026','SR292-080','SR194-030','SR015-347',
       'SR054-034','SR054-120','SR054-123','SR103-004','SR103-007','SR105-010','SR105-013','SR111-002','SR111-005'}

print("BOM components - checking if they have mesh data:")
print(f"{'Name':30s} {'In BOM':6s} {'mesh prop':10s} {'children':10s} {'has_geom'}")
print("-" * 70)

for l1_idx in stp.children:
    l1 = gltf.nodes[l1_idx]
    pn = l1.name.replace('.stp','').strip() if l1.name else ''
    in_bom = pn in BOM
    has_mesh = l1.mesh is not None
    children = len(l1.children or [])
    
    # Check if any descendant has mesh data
    def has_geometry(node):
        if node.mesh is not None:
            return True
        for ci in (node.children or []):
            if has_geometry(gltf.nodes[ci]):
                return True
        return False
    
    geom = has_geometry(l1)
    
    if in_bom:
        print(f"{l1.name:30s} {'YES':6s} {str(has_mesh):10s} {children:10d} {str(geom)}")
