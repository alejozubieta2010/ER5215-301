# SDTD — Estado del proyecto v4 (Visor 3D integrado + BOM filtrado)

**Fecha de este resumen:** 21 de julio de 2026
**Proyecto piloto:** ER5215-301 (RAD Équipement Inc.)
**Este documento reemplaza y actualiza:** RESUMEN_PROYECTO_SDTD_v3.md (20 de julio de 2026)

---

## 0. Instrucción para quien retome esto

Este documento es la **fuente de verdad actual**. El resumen anterior (v3)
describía el proyecto justo antes de la integración del visor 3D. **Esa
integración ya está completa y verificada.** El visor 3D (Three.js) está
integrado como ES Module directo (sin iframe), con sincronización BOM↔3D vía
EventBus, filtrado de componentes por intersección SVG↔Excel, y watcher
automático de cambios en Excel. Revisa este documento antes de tocar nada.

---

## 1. Contexto de negocio (sin cambios)

**SDTD (Smart Digital Technical Documentation)** convierte el ensamble CAD de
un equipo industrial en documentación técnica interactiva, lista para
entregar a un cliente sin tocar código.

**Objetivo de negocio:** el cliente final puede ver el equipo como dibujo
interactivo (SVG) y/o modelo 3D, hacer clic en una pieza y ver su
información, y solicitar cotización directamente desde el visor.

**Meta estratégica:** el usuario quiere que SDTD sea una plataforma
reutilizable (`TEMPLATE/` + archivos de entrada, sin tocar código). La Fase 2
(bus de eventos) y la integración 3D son prerrequisitos directos de esto.

---

## 2. Forma de trabajo (sin cambios desde v3)

1. Claude diseña el cambio y entrega un prompt completo y autocontenido para
   OpenCode.
2. El usuario pega ese prompt en OpenCode. OpenCode ejecuta los cambios.
3. El usuario verifica en la interfaz real y reporta el resultado.
4. Solo tras confirmación explícita del usuario se avanza al siguiente loop.

---

## 3. Estado del repositorio Git

- Rama principal: `master`
- Rama `feature-event-bus`: **creada, con Fase 2 + integración 3D completa.**
- Commits relevantes:
  - `f935af9`: todos los cambios de integración 3D (viewer, BOM filter, axes,
    damping, polar angle, export_bom.py, dataManager visible3d, panel fix)
  - Pendiente de merge a `master`

---

## 4. Arquitectura actual

### 4.1. Comunicación entre módulos: pub/sub vía EventBus

```
Emisores                         EventBus                    SelectionManager
─────────────────────────────────────────────────────────────────────────────
ComposerEvents (clic hotspot) ──emite──► "selection:requested"
BOM (clic de fila)            ──emite──► "selection:requested"    {componentId}
SelectionManager3D (clic 3D)  ──emite──► "selection:requested"    {componentId}
                                                                        │
                                                                        ▼
                                                         SelectionManager.select()
                                                         (valida contra ComponentManager,
                                                          guarda selectedComponent)
                                                                        │
                                                                        ▼
                                                    emite "selection:changed" {componentId}

ComposerAdapter (clic vacío / ESC en SVG)
   ──emite──► "selection:clear-requested"
SelectionManager (ESC global)
   ──llama internamente──► clear()
                                                                        │
                                                                        ▼
                                                       emite "selection:cleared"
```

### 4.2. Visor 3D: ES Module directo (no iframe)

**Arquitectura elegida:** ES Modules directo (NO iframe+postMessage).
Three.js se carga vía import map CDN (`three@0.185.1` from jsdelivr).

```
Viewer3D.js (orquestador)
├── GLBLoader.js          → carga modelo GLB
├── ReferenceIndex3D.js   → indexa referencias (override map + BOM lookup)
├── ModelIndex3D.js       → indexa nodos del modelo
├── HighlightManager3D.js → resaltado verde (#00ff00)
├── BomBuilder3D.js       → construye BOM 3D
├── CameraAnimator.js     → cámara orthographic fly-to
└── SelectionManager3D.js → raycaster + emite vía EventBus
```

**Componentes del visor:**
- `OrthographicCamera` (no PerspectiveCamera)
- `OrbitControls`: damping 0.25, polar angle 0→2π (rotación completa)
- Sin ViewCube, sin ContactShadows, sin PostProcessing (MVP)
- Sin ejes de coordenadas (AxesOverlay eliminado)

### 4.3. Filtrado BOM: intersección SVG↔Excel

El BOM muestra **solo componentes que existen en ambos** (SVG hotspots + Excel):

```javascript
// En BOM.build():
const visible = SDTD.svgComponents.size > 0
    ? SDTD.components.filter(c => SDTD.svgComponents.has(c.id))
    : SDTD.components;
```

- `SDTD.svgComponents`: Set populated por `ComposerLookup.findHotspots()`
- Emite `svg:components:discovered` cuando termina de indexar
- BOM se reconstruye automáticamente al recibir el evento

### 4.4. Watcher automático de Excel

```javascript
// En DataManager:
startBomWatcher() → setInterval cada 3s
  → fetch("data/components.json")
  → compara hash
  → si cambió: recarga SDTD.components → emite "bom:updated"
```

Flujo completo: Excel → `export_bom.py` → `components.json` → DataManager
detecta cambio → BOM se reconstruye.

---

## 5. Archivos del proyecto (estructura actual)

```
ER5215-301_DEV/
├── index.html                    → Entry point + import map Three.js
├── config.json                   → Configuración del proyecto
├── css/style.css                 → Estilos
├── data/
│   ├── client.json               → Datos del cliente
│   ├── project.json              → Config módulos (svg, documents, model3d)
│   ├── components.json           → BOM exportado desde Excel (24 componentes)
│   ├── documents.json            → Placeholder vacío
│   └── mesh-overrides.json       → Mapeo NAUO# → BOM IDs + overrides
├── js/
│   ├── core/
│   │   ├── app.js                → Estado global SDTD
│   │   ├── engine.js             → Orquestador principal
│   │   ├── eventBus.js           → Pub/sub (on/off/emit)
│   │   ├── dataManager.js        → Carga datos + BOM watcher
│   │   ├── componentManager.js   → Indexa componentes
│   │   ├── selectionState.js     → Estado de selección
│   │   └── moduleManager.js      → Registra módulos
│   ├── ui/
│   │   ├── ui.js                 → Header + layout
│   │   ├── workspace.js          → Toggle 2D/3D + vista default
│   │   ├── selectionManager.js   → Hub central de selección
│   │   ├── bom.js                → Tabla BOM (filtrada por SVG)
│   │   └── panel.js              → Panel de detalles
│   ├── service/
│   │   ├── navigationService.js  → Navegación Panel+BOM+3D
│   │   ├── highlightService.js   → Resaltado SVG+BOM+3D
│   │   ├── synchronizationService.js → Sync state
│   │   ├── historyService.js     → Historial
│   │   └── documentService.js    → Documentos (stub)
│   └── modules/
│       ├── svg/
│       │   ├── svg.js            → Carga SVG + ComposerAdapter
│       │   ├── composerAdapter.js → Entry point SVG
│       │   ├── composerEvents.js  → Eventos hotspot
│       │   ├── composerLookup.js  → Indexa hotspots + emite svg:components:discovered
│       │   └── svgInspector.js   → Inspector SVG
│       ├── model3d/
│       │   ├── model3d.js        → Adapter 3D (load/unload/focus/highlight)
│       │   └── viewer/
│       │       ├── Viewer3D.js       → Orquestador 3D
│       │       ├── GLBLoader.js      → Carga GLB
│       │       ├── ReferenceIndex3D.js → Override map + BOM lookup
│       │       ├── ModelIndex3D.js    → Indexa nodos
│       │       ├── HighlightManager3D.js → Resaltado verde
│       │       ├── BomBuilder3D.js    → BOM 3D
│       │       ├── CameraAnimator.js  → Fly-to orthographic
│       │       └── SelectionManager3D.js → Raycaster + EventBus
│       └── documents/
│           └── documents.js      → Stub
├── resources/
│   ├── svg/ER5215-301.svg        → Dibujo SVG (21 hotspots)
│   ├── models/ER5215-301.glb     → Modelo 3D (18.7MB)
│   ├── hdr/studio_small_03_1k.hdr → Environment map
│   ├── pdf/                      → PDFs técnicos
│   ├── excel/ER5215-301.xlsx     → BOM fuente (con columna visible3d)
│   └── 3d/ER5215-301.STEP        → Archivo STEP
├── scripts/
│   ├── export_bom.py             → Excel → JSON (agrega item, visible3d)
│   └── watch_bom.py              → Watcher de Excel
├── pipeline/                     → Pipeline offline (generator.html)
├── images/                       → Logos
└── docs/                         → Documentación
```

---

## 6. Mapeo de datos: Excel → JSON → App → 3D

### 6.1. Flujo Excel → JSON

**Archivo fuente:** `resources/excel/ER5215-301.xlsx`
**Script:** `scripts/export_bom.py`
**Archivo destino:** `data/components.json`

El Excel tiene 24 filas con columnas incluyendo `visible3d` (TRUE/FALSE).

### 6.2. Flujo JSON → App

`dataManager.js` normaliza cada componente:
```javascript
normalizeComponent(component) → {
    id: component.part_number,  // mapeado desde Excel
    name: component.name,
    description: component.description,
    quantity: component.quantity,
    material: component.material,
    item: component.item,
    documents: component.documents,
    visible3d: component.visible3d ?? true
}
```

### 6.3. Flujo App → 3D (override map)

**GLB:** 77 nodos Level-1 nombrados `NAUO#` (secuencial, NO códigos de pieza)
**Override map:** `data/mesh-overrides.json` mapea NAUO# → BOM ID

`ReferenceIndex3D.buildRecursive(node, inheritedRef, inBomAssembly)`:
- Solo el override map establece subtree de BOM (`inBomAssembly = true`)
- Resolución de nombres solo funciona dentro de subtrees BOM establecidos

---

## 7. Sistema de cotización (sin cambios)

Modal + Formspree, endpoint de pruebas activo
(`https://formspree.io/f/mdaqgkya` → `alejozubieta2010@gmail.com`). Pendiente
cambiar a correo real de RAD Équipement antes de producción.

---

## 8. Validación con graphify

Grafo más reciente generado el **21 de julio de 2026** con `/graphify . --update`.

**Salida del grafo:**
- 159 nodos, 255 edges, 29 comunidades
- God Nodes: Plan de Integración (13 edges), engine.js (10), selectionManager.js (10), Viewer3D.js (10)
- Validación: el visor 3D y sus dependencias aparecen correctamente en el grafo

---

## 9. Estado: ✅ Completado y probado

### Fase 2 (bus de eventos) — completada
- `js/core/eventBus.js` creado y funcional
- SelectionManager convertido a emisor puro
- 4 servicios suscriptos vía EventBus
- 3 emisores (ComposerEvents, BOM, ComposerAdapter) convertidos
- Checklist funcional verificado por el usuario

### Integración 3D — completada
- Visor 3D integrado como ES Module directo (sin iframe)
- Three.js vía import map CDN
- Sincronización BOM↔3D vía EventBus (ambas direcciones)
- Cámara orthographic con fly-to animación
- OrbitControls: damping 0.25, polar 0→2π
- Highlight verde (#00ff00) en SVG + BOM + 3D
- AxesOverlay eliminado (sin ejes de coordenadas)
- ReferenceIndex3D: override map + BOM lookup
- SelectionManager3D: valida ref en references map antes de emitir

### BOM filtrado — completado
- BOM muestra solo componentes en intersección SVG↔Excel
- `SDTD.svgComponents` (Set) populated por ComposerLookup
- Evento `svg:components:discovered` dispara rebuild automático
- Columna Item siempre consecutiva (1, 2, 3...)

### Pipeline Excel → JSON — completado
- `scripts/export_bom.py`: agrega columna `item`, maneja `part_number`, preserva `visible3d`
- `scripts/watch_bom.py`: watcher de archivos para auto-export
- `dataManager.js`: BOM watcher (polling cada 3s, compara hash)
- "Ocultar piezas extra" toggle funciona (3D + BOM sync)

---

## 10. Estado: 🔲 Pendiente

| # | Pendiente | Notas |
|---|---|---|
| 1 | **Merge de `feature-event-bus` a `master`** | Fase 2 + integración 3D verificadas |
| 2 | Limpieza: `archive/`, `pipeline/`, `scripts/` | Herramientas dev-time, no parte de la app |
| 3 | Decidir destino de `js/tools/*` | Legacy analyzers, 10 nodos aislados |
| 4 | Unificar `SelectionState`/`SelectionManager` | Pendiente heredado |
| 5 | Etapa de Validación (SVG vs Excel) | Sin tocar |
| 6 | Favicon | Cosmético |
| 7 | Buscador en el BOM | Sin tocar |
| 8 | Indicador de carga | Sin tocar |
| 9 | `documents.js` stub | Sin implementar |
| 10 | Endpoint Formspree producción | Cambiar correo de prueba |
| 11 | Piloto #2 con plantilla TEMPLATE | Depende de cerrar limpieza |
| 12 | ViewCube (futuro) | MVP actual no lo incluye |
| 13 | ContactShadows (futuro) | MVP actual no lo incluye |
| 14 | PostProcessing (futuro) | MVP actual no lo incluye |

---

## 11. Qué compartir al abrir una conversación nueva

1. **Este documento completo (v4)** como primer mensaje — reemplaza a v3.
2. Los archivos JS actuales del proyecto (特别 `engine.js`, `bom.js`,
   `dataManager.js`, `Viewer3D.js`, `composerLookup.js`, `model3d.js`).
3. `data/components.json` y `data/mesh-overrides.json`.
4. `graph.html` y `GRAPH_REPORT.md` — regenerados el 21 de julio.
5. Aclarar: *"Este documento (v4) es la fuente de verdad — el visor 3D está
   integrado y funcional, BOM filtrado por intersección SVG↔Excel, pipeline
   Excel automático. El siguiente trabajo es limpieza y piloto #2."*
