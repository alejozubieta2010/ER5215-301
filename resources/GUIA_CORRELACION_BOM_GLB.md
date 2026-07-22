# Guia de Correlacion: BOM Excel vs Modelo 3D GLB

## Objetivo

Cruzar los componentes de una lista de materiales (BOM) en formato Excel contra la jerarquia de un modelo 3D en formato GLB, con el fin de:

- Verificar que todos los componentes del BOM esten modelados en el GLB
- Detectar componentes en el modelo 3D que no esten en el BOM
- Identificar discrepancias en cantidades entre ambas fuentes

## Prerrequisitos

### Archivos necesarios

| Archivo | Formato | Contenido |
|---------|---------|-----------|
| BOM | `.xlsx` (Excel) | Lista de materiales con part numbers, descripciones y cantidades |
| Modelo 3D | `.glb` (glTF Binary) | Ensamblaje 3D con jerarquia de nodos |

### Librerias Python

```bash
pip install openpyxl pygltflib
```

- `openpyxl`: Lectura de archivos Excel (.xlsx)
- `pygltflib`: Lectura y parseo de archivos glTF/GLB

## Paso 1: Extraer BOM del Excel

### Estructura esperada del Excel

El archivo Excel debe tener al menos las siguientes columnas:

| Columna | Contenido | Ejemplo |
|---------|-----------|---------|
| A | Part Number | `905001` |
| B | Descripcion | `REDUCTEUR DODGE SMR TA5215H25` |
| C | Cantidad | `1` |
| D | Visible 3D (opcional) | `TRUE` / `FALSE` |

### Codigo de extraccion

```python
import openpyxl

def extract_bom(excel_path, sheet_index=0, header_row=1):
    """
    Extrae el BOM de un archivo Excel.

    Args:
        excel_path: Ruta al archivo .xlsx
        sheet_index: Indice de la hoja (0 = primera)
        header_row: Fila donde empiezan los datos (despues del encabezado)

    Returns:
        dict: {part_number: {'qty': int, 'desc': str}}
    """
    wb = openpyxl.load_workbook(excel_path)
    ws = wb.worksheets[sheet_index]

    bom = {}
    for row in ws.iter_rows(min_row=header_row + 1, values_only=True):
        pn = row[0]       # Part Number (columna A)
        desc = row[1]      # Descripcion (columna B)
        qty = row[2]       # Cantidad (columna C)

        if pn is None:
            continue

        bom[str(pn).strip()] = {
            'qty': qty if qty else 1,
            'desc': str(desc).strip() if desc else ''
        }

    return bom
```

### Notas

- Se asume que el part number esta en la columna A
- Si el Excel tiene multiples hojas, ajustar `sheet_index`
- Si los datos no empiezan en la fila 2, ajustar `header_row`
- Los part numbers se convierten a string y se eliminan espacios

## Paso 2: Extraer jerarquia del GLB

### Estructura del modelo GLB

Un archivo GLB contiene una escena con nodos organizados en jerarquia:

```
Escena
  └── Nodo Raiz (ej: "ER5215-301")
        └── Sub-nodo (ej: "ER5215-301.stp")
              ├── Hijo 1 (ej: "905001.stp")
              ├── Hijo 2 (ej: "SR054-034.stp")
              ├── Hijo 3 (ej: "ER300-220.stp")
              └── ...
```

**Importante:** Los componentes de nivel 1 son los hijos directos del sub-nodo del ensamblaje principal.

### Codigo de extraccion

```python
import pygltflib

def extract_glb_hierarchy(glb_path):
    """
    Extrae los componentes de nivel 1 de un archivo GLB.

    Args:
        glb_path: Ruta al archivo .glb

    Returns:
        dict: {part_number: quantity}
    """
    gltf = pygltflib.GLTF2().load(glb_path)
    scene = gltf.scenes[gltf.scene or 0]

    # Nodo raiz de la escena
    root_idx = scene.nodes[0]
    root_node = gltf.nodes[root_idx]

    # El sub-nodo contiene los componentes del ensamblaje
    if not root_node.children:
        return {}

    stp_idx = root_node.children[0]
    stp_node = gltf.nodes[stp_idx]

    # Los hijos de stp_node son los componentes de nivel 1
    children = stp_node.children or []

    parts = {}
    for child_idx in children:
        name = gltf.nodes[child_idx].name
        # Limpiar nombre: remover extension .stp
        pn = name.replace('.stp', '').replace('.STEP', '').strip()
        parts[pn] = parts.get(pn, 0) + 1

    return parts
```

### Notas

- Los nombres de los nodos en el GLB suelen tener extension `.stp`
- Se elimina la extension para obtener el part number limpio
- Si hay nodos duplicados, se suman las cantidades
- La jerarquia puede variar segun el CAD exporter utilizado

## Paso 3: Comparar BOM y GLB

### Codigo de comparacion

```python
def compare_bom_glb(bom, glb_parts):
    """
    Compara el BOM del Excel con los componentes del GLB.

    Args:
        bom: Diccionario del BOM (extract_bom)
        glb_parts: Diccionario del GLB (extract_glb_hierarchy)

    Returns:
        dict: Resultado con 3 listas
    """
    bom_set = set(bom.keys())
    glb_set = set(glb_parts.keys())

    in_both = bom_set & glb_set
    only_in_bom = bom_set - glb_set
    only_in_glb = glb_set - bom_set

    return {
        'in_both': sorted(in_both),
        'only_in_bom': sorted(only_in_bom),
        'only_in_glb': sorted(only_in_glb),
        'stats': {
            'bom_total': len(bom_set),
            'glb_total': len(glb_set),
            'matched': len(in_both),
            'bom_only': len(only_in_bom),
            'glb_only': len(only_in_glb)
        }
    }
```

### Verificacion de cantidades

Para los componentes que estan en ambos archivos, verificar que las cantidades coincidan:

```python
def verify_quantities(bom, glb_parts, in_both):
    """
    Verifica que las cantidades coincidan entre BOM y GLB.

    Returns:
        list: Componentes con discrepancia de cantidad
    """
    discrepancies = []
    for pn in in_both:
        bom_qty = bom[pn]['qty']
        glb_qty = glb_parts[pn]
        if bom_qty != glb_qty:
            discrepancies.append({
                'part_number': pn,
                'bom_qty': bom_qty,
                'glb_qty': glb_qty,
                'diff': glb_qty - bom_qty
            })
    return discrepancies
```

## Paso 4: Interpretar resultados

### Componentes en ambos (matched)

OK - El componente esta en el BOM y en el modelo 3D. Verificar que las cantidades coincidan.

### Solo en el BOM (only_in_bom)

Posibles causas:

- **Consumibles**: Aceites, lubricantes, grasa (no se modelan en 3D)
- **Partes genericas**: Tornillos estandar, arandelas que el CAD no incluye
- **Error en BOM**: Part number incorrecto o duplicado
- **Parte no modelada**: Componente que debe agregarse al modelo 3D

### Solo en el GLB (only_in_glb)

Posibles causas:

- **Sub-ensamblaje**: Componente que agrupa otras partes (no va en BOM)
- **Motor/equipo**: Componente comprado que se lista por separado
- **Error en GLB**: Part number incorrecto en el modelo 3D
- **Parte nueva**: Componente agregado al modelo sin actualizar el BOM

### Resumen de resultados

Imprimir el resumen de forma clara:

```python
def print_report(result, bom, glb_parts):
    """Imprime el reporte de correlacion."""
    stats = result['stats']

    print("=" * 60)
    print("REPORTE DE CORRELACION BOM vs GLB")
    print("=" * 60)
    print(f"Componentes en BOM:          {stats['bom_total']}")
    print(f"Componentes en GLB:          {stats['glb_total']}")
    print(f"Relacionados (en ambos):     {stats['matched']}")
    print(f"Solo en BOM:                 {stats['bom_only']}")
    print(f"Solo en GLB:                 {stats['glb_only']}")
    print()

    print("--- RELACIONADOS ---")
    for pn in result['in_both']:
        qty_bom = bom[pn]['qty']
        qty_glb = glb_parts[pn]
        desc = bom[pn]['desc']
        status = "OK" if qty_bom == qty_glb else f"DIFERENCIA BOM={qty_bom} GLB={qty_glb}"
        print(f"  {pn:20s} | BOM x{qty_bom:2d} | GLB x{qty_glb:2d} | {status} | {desc}")
    print()

    print("--- SOLO EN BOM ---")
    for pn in result['only_in_bom']:
        qty = bom[pn]['qty']
        desc = bom[pn]['desc']
        print(f"  {pn:20s} | BOM x{qty:2d} | {desc}")
    print()

    print("--- SOLO EN GLB ---")
    for pn in result['only_in_glb']:
        qty = glb_parts[pn]
        print(f"  {pn:20s} | GLB x{qty:2d}")
```

## Script completo

```python
import openpyxl
import pygltflib


def extract_bom(excel_path, sheet_index=0, header_row=1):
    wb = openpyxl.load_workbook(excel_path)
    ws = wb.worksheets[sheet_index]
    bom = {}
    for row in ws.iter_rows(min_row=header_row + 1, values_only=True):
        pn = row[0]
        desc = row[1]
        qty = row[2]
        if pn is None:
            continue
        bom[str(pn).strip()] = {
            'qty': qty if qty else 1,
            'desc': str(desc).strip() if desc else ''
        }
    return bom


def extract_glb_hierarchy(glb_path):
    gltf = pygltflib.GLTF2().load(glb_path)
    scene = gltf.scenes[gltf.scene or 0]
    root_idx = scene.nodes[0]
    root_node = gltf.nodes[root_idx]
    if not root_node.children:
        return {}
    stp_idx = root_node.children[0]
    stp_node = gltf.nodes[stp_idx]
    children = stp_node.children or []
    parts = {}
    for child_idx in children:
        name = gltf.nodes[child_idx].name
        pn = name.replace('.stp', '').replace('.STEP', '').strip()
        parts[pn] = parts.get(pn, 0) + 1
    return parts


def compare(bom, glb_parts):
    bom_set = set(bom.keys())
    glb_set = set(glb_parts.keys())
    return {
        'in_both': sorted(bom_set & glb_set),
        'only_in_bom': sorted(bom_set - glb_set),
        'only_in_glb': sorted(glb_set - bom_set),
    }


def main():
    # Configurar rutas
    excel_path = 'BOM.xlsx'
    glb_path = 'MODELO.glb'

    # Extraer datos
    bom = extract_bom(excel_path)
    glb_parts = extract_glb_hierarchy(glb_path)

    # Comparar
    result = compare(bom, glb_parts)

    # Estadisticas
    stats = {
        'bom_total': len(bom),
        'glb_total': len(glb_parts),
        'matched': len(result['in_both']),
        'bom_only': len(result['only_in_bom']),
        'glb_only': len(result['only_in_glb']),
    }

    # Imprimir reporte
    print("=" * 60)
    print("REPORTE DE CORRELACION BOM vs GLB")
    print("=" * 60)
    for k, v in stats.items():
        print(f"  {k}: {v}")
    print()

    print("--- RELACIONADOS ---")
    for pn in result['in_both']:
        qb = bom[pn]['qty']
        qg = glb_parts[pn]
        print(f"  {pn:20s} | BOM x{qb:2d} | GLB x{qg:2d} | {bom[pn]['desc']}")
    print()

    print("--- SOLO EN BOM ---")
    for pn in result['only_in_bom']:
        print(f"  {pn:20s} | BOM x{bom[pn]['qty']:2d} | {bom[pn]['desc']}")
    print()

    print("--- SOLO EN GLB ---")
    for pn in result['only_in_glb']:
        print(f"  {pn:20s} | GLB x{glb_parts[pn]:2d}")


if __name__ == '__main__':
    main()
```

## Personalizacion

### Cambiar la profundidad de jerarquia

Para extraer componentes a mas de un nivel de profundidad en el GLB, modificar la funcion `extract_glb_hierarchy` para que recorra recursivamente los nodos hijos.

### Ignorar componentes especificos

Agregar una lista de exclusion para part numbers que se saben estan en el BOM pero nunca en el GLB (ej: aceites, consumibles):

```python
EXCLUSION_LIST = ['SR458-002']  # Aceite sintetico

bom = {k: v for k, v in bom.items() if k not in EXCLUSION_LIST}
```

### Exportar a Excel

Usar `openpyxl` para generar un archivo de reporte con los resultados:

```python
from openpyxl import Workbook

def export_report(result, bom, glb_parts, output_path):
    wb = Workbook()
    ws = wb.active
    ws.title = "Correlacion"

    ws.append(["Part Number", "Estado", "BOM Qty", "GLB Qty", "Descripcion"])

    for pn in result['in_both']:
        ws.append([pn, "OK", bom[pn]['qty'], glb_parts[pn], bom[pn]['desc']])

    for pn in result['only_in_bom']:
        ws.append([pn, "Solo BOM", bom[pn]['qty'], 0, bom[pn]['desc']])

    for pn in result['only_in_glb']:
        ws.append([pn, "Solo GLB", 0, glb_parts[pn], ""])

    wb.save(output_path)
```
