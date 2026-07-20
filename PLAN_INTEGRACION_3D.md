# Plan de Integración: Visor 3D ↔ SDTD

**Fecha:** 18 de julio de 2026
**Proyecto:** ER5215-301 (RAD Équipement Inc.)
**Objetivo:** Integrar el visor 3D (Three.js) en la plataforma SDTD existente

---

## 1. Contexto

### 1.1. Estado actual

| Componente | Ubicación | Estado |
|-----------|-----------|--------|
| Plataforma SDTD | `E:\ER5215-301_DEV\` | Funcional (SVG + BOM + Panel) |
| Visor 3D | `E:\SDTD\SDTD\` | Funcional standalone (Three.js + Vite) |
| Stub model3d | `js/modules/model3d/model3d.js` | Solo logs, sin implementación |
| eDrawings HTML | `resources/3d/ER5215-301.html` | Archivo original de SolidWorks (~16MB) |

### 1.2. Arquitectura elegida: Híbrido (iframe → ES modules)

**Fase 1-4:** iframe + postMessage (integración rápida)
**Fase futura:** Migración a importación directa de ES modules

### 1.3. Stack tecnológico

| Plataforma SDTD | Visor 3D |
|-----------------|----------|
| Vanilla JS (ES6 modules) | Three.js ^0.185.1 |
| Sin bundler (servidor HTTP) | Vite ^8.1.1 |
| `components.json` vía fetch | BOM hardcoded |
| Services (highlight, nav) | EventBus singleton |

---

## 2. Fase 1 — Preparar el Visor 3D para Embedding

**Objetivo:** El visor 3D puede ser servido independientemente y communicate con un iframe padre.

### 2.1. Modificar EventBus para postMessage

**Archivo:** `E:\SDTD\SDTD\src\core\EventBus.js`

**Cambios:**
- Interceptar `emit()` para eventos clave (`component:selected`, `bom:ready`)
- Enviar `window.parent.postMessage()` con `{ type: "sstd-event", event, data }`
- Evitar loop infinito: ignorar mensajes que provienen del mismo window

```javascript
// Agregar al final del emit():
if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: "sstd-event", event, data }, "*");
}
```

### 2.2. Escuchar mensajes del padre en el visor

**Archivo:** `E:\SDTD\SDTD\src\main.js`

**Cambios:**
- Agregar `window.addEventListener("message", handler)`
- Procesar mensajes tipo `sstd-command` con acciones: `select`, `highlight`, `focus`, `clear`
- Despachar al EventBus interno del visor

```javascript
// Ejemplo de mensaje recibido:
{ type: "sstd-command", action: "select", componentId: "SR194-026" }
```

### 2.3. Hacer dinámico el path del modelo GLB

**Archivo:** `E:\SDTD\SDTD\src\viewer\Viewer3D.js`

**Cambios:**
- El constructor debe aceptar `{ modelPath, bomData }` como opciones
- Si no se provee, usar el valor por defecto (`/models/ER5215-301.glb`)
- Esto permite cargar modelos diferentes desde el padre

```javascript
// Constructor actual (hardcoded):
constructor(container) {
    this.glbLoader.load("/models/ER5215-301.glb", ...);
}

// Constructor propuesto:
constructor(container, options = {}) {
    const modelPath = options.modelPath || "/models/ER5215-301.glb";
    const bomData = options.bomData || null;
    this.glbLoader.load(modelPath, ...);
}
```

### 2.4. Hacer dinámico el BOM

**Archivos:**
- `E:\SDTD\SDTD\src\data\bom_ER5215_301.js`
- `E:\SDTD\SDTD\src\viewer\managers\ReferenceIndex3D.js`
- `E:\SDTD\SDTD\src\viewer\managers\BomBuilder3D.js`

**Cambios:**
- Eliminar import directo de `bom_ER5215_301.js`
- Recibir BOM data como parámetro en `Viewer3D` options
- Guardar referencia en `this.bomData` y pasarla a `ReferenceIndex3D` y `BomBuilder3D`
- Si se recibe BOM vía `postMessage`, reconstruir los índices

### 2.5. Agregar método destroy()

**Archivo:** `E:\SDTD\SDTD\src\viewer\Viewer3D.js`

**Cambios:**
- Agregar `destroy()` que detenga el render loop
- Remueva event listeners del DOM
- Haga `renderer.dispose()`, `geometry.dispose()`, `material.dispose()`
- Limpie el contenedor

### 2.6. Build del visor

**Comando:** `npm run build` en `E:\SDTD\SDTD\`

**Resultado:** Carpeta `dist/` con:
- `index.html` (entry point)
- `assets/index-*.js` (bundle con Three.js tree-shaken)
- `assets/index-*.css` (estilos)
- `models/ER5215-301.glb` (modelo 3D)
- `hdr/studio_small_03_1k.hdr` (environment map)

### 2.7. Copiar dist al proyecto DEV

**Destino:** `E:\ER5215-301_DEV\resources\3d\viewer\`

**Acción:** Copiar toda la carpeta `dist/` renombrada como `viewer/`

---

## 3. Fase 2 — Integrar iframe en el DEV Project

**Objetivo:** El visor 3D vive dentro de la plataforma SDTD, comunicándose vía postMessage.

### 3.1. Reemplazar stub model3d.js

**Archivo:** `E:\ER5215-301_DEV\js\modules\model3d\model3d.js`

**Estructura propuesta:**

```javascript
export const Model3DModule = {
    iframe: null,
    container: null,
    initialized: false,

    initialize() {
        this.container = document.getElementById("viewer-3d-container");
        this.iframe = this.container?.querySelector("iframe");
        if (this.iframe) {
            window.addEventListener("message", (e) => this.onMessage(e));
            this.initialized = true;
        }
    },

    load() {
        if (this.iframe) {
            this.container.style.display = "block";
        }
    },

    unload() {
        if (this.container) {
            this.container.style.display = "none";
        }
    },

    selectComponent(id) {
        this.postMessage({ action: "select", componentId: id });
    },

    highlightComponent(id) {
        this.postMessage({ action: "highlight", componentId: id });
    },

    focusComponent(id) {
        this.postMessage({ action: "focus", componentId: id });
    },

    clearSelection() {
        this.postMessage({ action: "clear" });
    },

    postMessage(payload) {
        if (this.iframe?.contentWindow) {
            this.iframe.contentWindow.postMessage(
                { type: "sstd-command", ...payload }, "*"
            );
        }
    },

    onMessage(event) {
        const msg = event.data;
        if (msg?.type !== "sstd-event") return;

        switch (msg.event) {
            case "component:selected":
                // Notificar al SelectionManager del padre
                window.dispatchEvent(new CustomEvent("model3d:selected", {
                    detail: msg.data
                }));
                break;
            case "bom:ready":
                // El BOM del visor 3D está listo (opcional: sincronizar)
                break;
        }
    }
};
```

### 3.2. Agregar iframe al DOM

**Archivo:** `E:\ER5215-301_DEV\index.html`

**Cambios:**
- Agregar `#viewer-3d-container` junto a `#viewer-container`
- Inicialmente oculto (`display: none`)
- iframe apunta a `resources/3d/viewer/index.html`

```html
<!-- Después del viewer SVG existente -->
<div id="viewer-3d-container" style="display: none;">
    <iframe src="resources/3d/viewer/index.html"
            frameborder="0"
            allow="autoplay; fullscreen">
    </iframe>
</div>
```

### 3.3. Estilos del iframe

**Archivo:** `E:\ER5215-301_DEV\css\style.css`

```css
#viewer-3d-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

#viewer-3d-container iframe {
    width: 100%;
    height: 100%;
    border: none;
}
```

### 3.4. Conectar al SelectionManager

**Archivo:** `E:\ER5215-301_DEV\js\ui\selectionManager.js`

**Cambios:**
- Cuando se selecciona una pieza desde el BOM o el SVG, verificar si el módulo 3D está activo
- Si lo está, enviar `postMessage` al iframe

```javascript
// En select(id), después de las validaciones:
if (Model3DModule.initialized) {
    Model3DModule.selectComponent(id);
}
```

### 3.5. Conectar al HighlightService

**Archivo:** `E:\ER5215-301_DEV\js\service\highlightService.js`

**Cambios:**
- En `highlight(id)`, agregar llamada al módulo 3D

```javascript
// Después de ComposerAdapter.highlightComponent(id):
if (Model3DModule.initialized) {
    Model3DModule.highlightComponent(id);
}
```

### 3.6. Conectar al NavigationService

**Archivo:** `E:\ER5215-301_DEV\js\service\navigationService.js`

**Cambios:**
- En `navigateTo(id)`, agregar llamada al módulo 3D

```javascript
// Después de la lógica existente:
if (Model3DModule.initialized) {
    Model3DModule.focusComponent(id);
}
```

### 3.7. Activar módulo

**Archivo:** `E:\ER5215-301_DEV\data\project.json`

**Cambios:**
```json
"modules": {
    "svg": true,
    "model3d": true,
    "documents": false
}
```

---

## 4. Fase 3 — UI de Alternancia SVG ↔ 3D

**Objetivo:** Botón para cambiar entre vista SVG y vista 3D.

### 4.1. Agregar botón de toggle

**Archivo:** `E:\ER5215-301_DEV\index.html`

**Cambios:**
- Agregar botón en el header o toolbar
- Dos estados: "2D" y "3D"

```html
<button id="toggle-view" class="view-toggle" data-view="svg">
    <span class="view-label">2D</span>
</button>
```

### 4.2. Estilos del toggle

**Archivo:** `E:\ER5215-301_DEV\css\style.css`

```css
.view-toggle {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 1000;
    padding: 8px 16px;
    background: var(--primary-color, #007bff);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
}

.view-toggle[data-view="3d"] {
    background: var(--accent-color, #28a745);
}
```

### 4.3. Implementar alternancia

**Archivo:** `E:\ER5215-301_DEV\js\ui\workspace.js`

**Cambios:**
- Agregar métodos `showModel3D()` y `showSVG()` (ya existen como stubs)
- Implementar la lógica de alternancia

```javascript
showModel3D() {
    document.getElementById("viewer-container").style.display = "none";
    document.getElementById("viewer-3d-container").style.display = "block";
    this.currentView = "3d";

    // Sincronizar selección actual al 3D
    const selected = SelectionState.getSelected();
    if (selected) {
        Model3DModule.selectComponent(selected);
    }
},

showSVG() {
    document.getElementById("viewer-container").style.display = "block";
    document.getElementById("viewer-3d-container").style.display = "none";
    this.currentView = "svg";
}
```

### 4.4. Event listener del botón

**Archivo:** `E:\ER5215-301_DEV\js\ui\workspace.js`

```javascript
document.getElementById("toggle-view")?.addEventListener("click", () => {
    if (this.currentView === "svg") {
        this.showModel3D();
    } else {
        this.showSVG();
    }
});
```

---

## 5. Fase 4 — Sincronización Completa BOM ↔ 3D

**Objetivo:** Bidireccionalidad total entre BOM y visor 3D.

### 5.1. Clic en pieza 3D → resaltar BOM

**Flujo:**
1. Usuario hace clic en pieza 3D en el visor
2. Visor emite `component:selected` vía postMessage
3. `model3d.js` recibe el mensaje
4. Despacha `CustomEvent("model3d:selected")`
5. `selectionManager.js` escucha el evento
6. Llama a `BOM.highlight(code)` y `Panel.showComponent(code)`

### 5.2. Clic en BOM → resaltar pieza 3D

**Flujo:**
1. Usuario hace clic en fila del BOM
2. `bom.js` llama a `SelectionManager.select(id)`
3. `SelectionManager` valida y llama a `NavigationService`
4. `NavigationService` llama a `Model3DModule.focusComponent(id)`
5. Visor 3D recibe el postMessage y hace focus/camera animation

### 5.3. Panel de detalles

**Archivo:** `E:\ER5215-301_DEV\js\ui\panel.js`

**Cambios:**
- Ya actualiza el panel con la info del componente seleccionado
- Solo necesita recibir eventos del módulo 3D (ya cubierto por 5.1)

### 5.4. ESC para deseleccionar

**Archivo:** `E:\ER5215-301_DEV\js\ui\selectionManager.js`

**Cambios:**
- En el handler de ESC, agregar limpieza del módulo 3D

```javascript
// En el handler de ESC existente:
if (Model3DModule.initialized) {
    Model3DModule.clearSelection();
}
```

### 5.5. Hover en 3D (opcional)

**Cambios en el visor 3D:**
- Emitir `component:hovered` vía postMessage cuando el mouse está sobre una pieza

**Cambios en el DEV project:**
- Recibir el evento y mostrar tooltip o actualizar panel temporalmente

---

## 6. Fase 5 — Validación y Limpieza

### 6.1. Pruebas del flujo completo

| Escenario | Pasos | Resultado esperado |
|-----------|-------|-------------------|
| SVG → 3D | Seleccionar pieza en SVG, cambiar a 3D | Pieza seleccionada en 3D |
| 3D → SVG | Seleccionar pieza en 3D, cambiar a SVG | Pieza seleccionada en SVG |
| BOM → 3D | Clic en fila del BOM | Pieza resaltada en 3D |
| 3D → BOM | Clic en pieza 3D | Fila resaltada en BOM + scroll |
| ESC | Presionar ESC | Ambos visores limpios |
| Panel | Seleccionar pieza en 3D | Panel muestra detalles |
| Cotización | Seleccionar piezas, clic "Devis" | Email se abre con piezas correctas |

### 6.2. Eliminar código muerto

| Archivo | Razón |
|---------|-------|
| `js/viewer/viewer.js` | Huérfano, nadie lo llama |
| `resources/3d/ER5215-301.html` | Reemplazado por el visor 3D |
| `resources/3d/diagnostico_3d.html` | Herramienta de debug, ya no necesaria |

### 6.3. Documentar

- Actualizar `RESUMEN_PROYECTO_SDTD.md` con la integración completada
- Agregar sección "Visor 3D" al documento
- Documentar el flujo de postMessage para futuros desarrolladores

### 6.4. Git

```bash
git add .
git commit -m "Integración completa del visor 3D vía iframe + postMessage"
```

---

## 7. Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    SDTD Platform (DEV)                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    index.html                         │   │
│  │  ┌─────────────────┐  ┌──────────────────────────┐  │   │
│  │  │ #viewer-container│  │ #viewer-3d-container      │  │   │
│  │  │   (SVG viewer)   │  │   ┌──────────────────┐  │  │   │
│  │  │                  │  │   │   iframe           │  │  │   │
│  │  │  <object>        │  │   │   ┌────────────┐  │  │  │   │
│  │  │  (Composer SVG)  │  │   │   │ Viewer3D   │  │  │  │   │
│  │  │                  │  │   │   │ (Three.js) │  │  │  │   │
│  │  └─────────────────┘  │   │   └────────────┘  │  │  │   │
│  │                        │   └──────────────────┘  │  │   │
│  └──────────────────────────────────────────────────┘  │   │
│                                                         │   │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  │   │
│  │ BOM Table   │  │ Panel        │  │ Selection    │  │   │
│  │ (bom.js)    │  │ (panel.js)   │  │ Manager      │  │   │
│  └──────┬──────┘  └──────┬───────┘  └──────┬───────┘  │   │
│         │                │                  │          │   │
│         └────────────────┼──────────────────┘          │   │
│                          │                             │   │
│                   ┌──────┴───────┐                     │   │
│                   │ model3d.js   │                     │   │
│                   │ (bridge)     │                     │   │
│                   └──────┬───────┘                     │   │
│                          │                             │   │
│                   postMessage                          │   │
│                          │                             │   │
└──────────────────────────┼─────────────────────────────┘   │
                           │                                  │
                    ┌──────┴───────┐                          │
                    │   iframe     │                          │
                    │   content    │                          │
                    └──────────────┘                          │
                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Cronograma Estimado

| Fase | Tareas | Tiempo estimado |
|------|--------|-----------------|
| **Fase 1** | Preparar visor 3D (postMessage, dinámico, destroy) | 2-3 horas |
| **Fase 2** | Integrar iframe en DEV (model3d.js, DOM, services) | 2-3 horas |
| **Fase 3** | UI toggle SVG ↔ 3D | 1 hora |
| **Fase 4** | Sincronización completa BOM ↔ 3D | 2-3 horas |
| **Fase 5** | Validación y limpieza | 1-2 horas |
| **Total** | | **8-12 horas** |

---

## 9. Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
|iframe cross-origin issues | Alto | Servir todo desde el mismo origen (mismo puerto) |
| Performance del GLB (18MB) | Medio | Cargar bajo demanda, mostrar indicador de carga |
| Sincronización de estado al cambiar vistas | Medio | Guardar estado de selección y restaurar al cambiar |
| Memory leaks al alternar vistas | Bajo | Implementar `destroy()` en el visor 3D |
| BOM desincronizado entre vistas | Medio | Usar el BOM del DEV project como fuente de verdad |

---

## 10. Archivos a Modificar (Resumen)

### Visor 3D (`E:\SDTD\SDTD\`)
- `src/core/EventBus.js` — agregar postMessage
- `src/main.js` — escuchar mensajes del padre
- `src/viewer/Viewer3D.js` — opciones dinámicas + destroy()
- `src/data/bom_ER5215_301.js` — hacer dinámico
- `src/viewer/managers/ReferenceIndex3D.js` — recibir BOM como parámetro
- `src/viewer/managers/BomBuilder3D.js` — recibir BOM como parámetro

### Plataforma SDTD (`E:\ER5215-301_DEV\`)
- `index.html` — agregar iframe container + botón toggle
- `css/style.css` — estilos del iframe y toggle
- `js/modules/model3d/model3d.js` — reemplazar stub completo
- `js/ui/workspace.js` — implementar showModel3D/showSVG
- `js/ui/selectionManager.js` — conectar con módulo 3D
- `js/service/highlightService.js` — conectar con módulo 3D
- `js/service/navigationService.js` — conectar con módulo 3D
- `data/project.json` — activar módulo model3d

---

**Autor:** Alejandro Zubieta
**Estado:** Plan listo para ejecución
