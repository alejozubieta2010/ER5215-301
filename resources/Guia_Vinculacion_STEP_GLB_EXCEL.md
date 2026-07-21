# Guia de Vinculacion: STEP / GLB / EXCEL
## ER5215-301 - Prototipo de Referencia

---

## 1. Descripcion de los Archivos

| Archivo | Formato | Contenido | Campo identificador |
|---|---|---|---|
| `ER5215-301.STEP` | ISO-10303-21 (AP214) | Modelo CAD completo con jerarquia de ensamblaje | `PRODUCT.name` (ej: `ER300-072.stp`) |
| `ER5215-301.glb` | glTF Binary | Modelo 3D visual con jerarquia de nodos | `node.name` = `NAUO#` (sin PN) |
| `ER5215-301.xlsx` | Excel (BOM) | Lista de materiales plano, nivel 1 | `part_number` (ej: `ER300-072`) |

---

## 2. Mapa de Relaciones

```
EXCEL (BOM plana)                  STEP (CAD jerarquico)              GLB (3D visual)
─────────────────                  ──────────────────────              ───────────────
part_number ────────────────────►  PRODUCT.name (sin .stp)            node.name = NAUO#
description                        PRODUCT.description                (sin identificador)
quantity                            repeticiones en NAUO                cantidad de nodos
                                    │                                  │
                                    │  NAUO# = entity ID               │  NAUO# = sequential
                                    │  (#513009 - #514189)             │  (1 - 1181)
                                    │                                  │
                                    └───────── AMBOS TIENEN ──────────┘
                                              misma estructura
                                              77 hijos nivel-1
                                              isomorfismo 100%
```

---

## 3. Metodos de Vinculacion

### 3.1 STEP <-> EXCEL (Directa)

**Criterio:** `PRODUCT.name` sin extension = `part_number` del Excel

```python
step_pn = product_name.replace('.stp', '').replace('.STEP', '')
match = step_pn == excel_part_number
```

**Resultado:** 21 de 24 lineas Excel coinciden exactamente (PN + cantidad)

### 3.2 STEP <-> GLB (Estructural)

**Criterio:** Isomorfismo de arbol por conteo de hijos en nivel-1

```python
# Ambos tienen 77 hijos nivel-1
# Emparejar por cantidad de hijos:
glb_child_count = len(glb_node['children'])    # ej: NAUO2 -> 94 hijos
step_child_count = len(step_children[pd_id])   # ej: ER300-072 -> 94 hijos
match = glb_child_count == step_child_count
```

**Resultado:** 77 de 77 nodos GLB mapeados a STEP (100%)

### 3.3 GLB <-> EXCEL (Indirecta via STEP)

No existe vinculacion directa. Requiere el paso intermedio:

```
GLB  ──(isomorfismo)──►  STEP  ──(part_number)──►  EXCEL
NAUO2 ──► 94 hijos ──► ER300-072 ──► ER300-072 ──► (no esta)
NAUO8 ──► 0 hijos  ──► ER301-094 ──► ER301-094 ──► ARBRE DE TETE POUR TA5
```

---

## 4. Procedimiento de Corroboration

### Paso 1: Extraer jerarquia del STEP

```python
# Entidades clave:
#   PRODUCT             -> nombre, descripcion
#   PRODUCT_DEFINITION -> referencia a formacion
#   NEXT_ASSEMBLY_USAGE_OCCURRENCE (NAUO) -> parent_pd, child_pd

# Construir arbol:
children[pd_id] = [child_pd for each NAUO where parent_pd == pd_id]
```

### Paso 2: Extraer jerarquia del GLB

```python
import pygltflib
gltf = pygltflib.GLTF2().load('ER5215-301.glb')

# Para cada nodo:
node.name      # "NAUO#" (sin PN util)
node.children  # indices de hijos
node.mesh      # indice de mesh (None si es sub-ensamblaje)
```

### Paso 3: Leer BOM del Excel

```python
import openpyxl
wb = openpyxl.load_workbook('ER5215-301.xlsx')
ws = wb['BOM']
# columnas: part_number | description | quantity
```

### Paso 4: Vincular por isomorfismo

```python
# Para cada nodo GLB nivel-1, contar hijos y buscar STEP con mismo conteo
for glb_node in glb_level1:
    glb_hijos = len(glb_node.children)
    for step_pd in step_level1:
        if len(step_children[step_pd]) == glb_hijos:
            mapping[glb_node] = step_pd
            break
```

### Paso 5: Cruzar con Excel

```python
for step_pd in mapping.values():
    pn = product_name(step_pd).replace('.stp', '')
    if pn in excel_parts:
        # OK: presente en los 3 formatos
    else:
        # Solo en STEP/GLB (no listado en BOM)
```

---

## 5. Tabla de Referencia Rapida

| GLB Node | STEP PN | Excel PN | Qty | Descripcion | Estado |
|---|---|---|---:|---|---|
| NAUO2 | ER300-072 | -- | 1 | Mecanismo rodillas | Solo STEP/GLB |
| NAUO3 | 905109 | 905109 | 1 | TA5215RA ROD ASSEMBLY | OK |
| NAUO4 | AR112-037 | AR112-037 | 1 | GARDE ENTRAINEMENT | OK |
| NAUO5 | 905001 | 905001 | 1 | REDUCTEUR DODGE | OK |
| NAUO6 | ER300-220 | ER300-220 | 1 | SUPPORT DE GARDE JUMBO | OK |
| NAUO7 | 30HP, Baldor, CM4104T | -- | 1 | Motor electrico | Solo STEP/GLB |
| NAUO8 | ER301-094 | ER301-094 | 1 | ARBRE DE TETE POUR TA5 | OK |
| NAUO9 | SR015-011 | SR015-011 | 1 | AUTOCOLLANT DANGER | OK |
| NAUO10 | SR174-064 | SR174-064 | 1 | POULIE QUADRUPLE 4B64 | OK |
| NAUO11 | SR174-066 | SR174-066 | 1 | POULIE QUADRUPLE 4B66 | OK |
| NAUO12 | SR194-026 | SR194-026 | 1 | MOYEU SD BORE 1 5/8 | OK |
| NAUO13-16 | SR292-080 | SR292-080 | 4 | COURROIE V BX-80 | OK (x4) |
| NAUO17 | SR194-030 | SR194-030 | 1 | MOYEU SD 1 7/8 | OK |
| NAUO18 | SR015-347 | SR015-347 | 1 | COLLANT RAD 9x29.62 | OK |
| NAUO19-78 | (tornillos) | (tornillos) | var. | Ver detalle abajo | OK |

---

## 6. Diferencias Encontradas

### Piezas en STEP/GLB pero NO en Excel

| PN | Tipo | Razon probable |
|---|---|---|
| `ER300-072` | Sub-ensamblaje (94 hijos) | No es componente de compra |
| `30HP, Baldor, CM4104T` | Parte suelta | No se modela en BOM |

### Piezas en Excel pero NO en STEP/GLB

| PN | Qty | Descripcion | Razon probable |
|---|---:|---|---|
| `905022` | 1 | MOYEU 2 15/16" SMR TA5215TB | Componente de compra |
| `905102` | 1 | ANTI-RECUL DODGE TA5215BS | Componente de compra |
| `SR458-002` | 7 | HUILE SYNTGEAR MOBIL SHC 629 | Consumible (aceite) |

---

## 7. Limitaciones y Cautelas

1. **El GLB no tiene nombres de pieza.** Los nodos se llaman `NAUO#`, no el `part_number`. Solo se pueden mapear via isomorfismo estructural con el STEP.

2. **El isomorfismo funciona por coincidencia de cantidad de hijos**, no por geometria. Si dos piezas distintas tienen el mismo numero de hijos, el emparejar por posicion puede fallar.

3. **La BOM del Excel es plana** (solo nivel-1). No refleja la jerarquia profunda del STEP/GLB.

4. **Las cantidades en el STEP** se obtienen por repeticiones del NAUO, no por un campo explicito.

5. **El GLB fue generado por SolidWorks 2020** (segun header del STEP). Otros convertidores pueden preservar los nombres de componente en los nodos glTF.

---

## 8. Script de Vinculacion Completa

```python
import pygltflib, re, openpyxl
from collections import defaultdict

# 1. Cargar archivos
gltf = pygltflib.GLTF2().load('ER5215-301.glb')
# ... parse STEP y Excel (ver scripts anteriores)

# 2. Construir mapping GLB -> STEP por isomorfismo
glb_root = 0  # ER5215-301
glb_assembly = gltf.nodes[glb_root].children[0]  # NAUO1
glb_l1 = gltf.nodes[glb_assembly].children  # 77 hijos

step_assembly = step_children[root_pd][0]
step_l1 = step_children[step_assembly]  # 77 hijos

# 3. Emparejar por conteo de hijos
mapping = {}
used_step = set()
for gi in glb_l1:
    glb_hijos = len(gltf.nodes[gi].children)
    for si in step_l1:
        if si not in used_step and len(step_children[si]) == glb_hijos:
            mapping[gi] = si
            used_step.add(si)
            break

# 4. Cruzar con Excel
for gi, si in mapping.items():
    pn = step_to_pn(get_name(si))
    glb_name = gltf.nodes[gi].name
    in_excel = pn in excel_parts
    print(f"{glb_name} -> {pn} {'OK' if in_excel else 'NO'}")
```

---

## 9. Conclusion

Los tres archivos describen **la misma pieza ER5215-301** y son totalmente relacionables:

- **STEP** = fuente de verdad (nombres + jerarquia + geometria)
- **GLB** = representacion visual (jerarquia + geometria, sin nombres)
- **EXCEL** = BOM de compra (nombres + cantidades, sin jerarquia)

El **STEP es el eslabon indispensable** que conecta GLB con Excel. Sin el, no hay forma de vincular los `NAUO#` del GLB con los `part_number` del Excel.

---

*Generado automaticamente - Prototipo ER5215-301*
