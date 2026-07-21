# SDTD — Estado del proyecto v2 (post-refactor ES6, previo a integración 3D)

**Fecha de este resumen:** 19 de julio de 2026
**Proyecto piloto:** ER5215-301 (RAD Équipement Inc.)
**Este documento reemplaza y actualiza:** RESUMEN_PROYECTO_SDTD.md (15 de julio de 2026)

---

## 0. Instrucción para quien retome esto

Este documento es la **fuente de verdad actual**. El resumen anterior (v1) describía
el proyecto en un estado con scripts globales sin módulos. **Ese estado ya no existe** —
se hizo un refactor completo a módulos ES6 que cambia radicalmente cómo se relacionan
los archivos entre sí. No asumas que el código sigue el patrón antiguo: revisa este
documento antes de tocar nada.

---

## 1. Contexto de negocio (sin cambios respecto a v1)

**SDTD (Smart Digital Technical Documentation)** convierte el ensamble CAD de un
equipo industrial en documentación técnica interactiva, lista para entregar a un
cliente sin tocar código.

**Objetivo de negocio:** el cliente final (ingeniero, comprador, técnico) puede:
1. Ver el equipo como dibujo interactivo (SVG) y/o modelo 3D.
2. Hacer clic en una pieza y ver su información (código, descripción, cantidad).
3. **Solicitar cotización** directamente desde el visor.

**Modelo de entrega confirmado con el usuario:** se entrega la carpeta completa del
proyecto al cliente, y **él la vincula a su propia web** (hosting propio). Esto es
importante porque habilita usar servicios de formularios de terceros sin backend
propio (ver sección 5).

**Meta estratégica (nueva, no estaba en v1):** el usuario quiere que SDTD sea una
**plataforma reutilizable**, no solo un entregable único. La idea es que un proyecto
nuevo se cree copiando una plantilla (`TEMPLATE/`) y alimentándola con archivos de
entrada (STEP, SVG, GLB, Excel, PDF) — **sin modificar código**. Esto es lo que
motivó invertir en arquitectura sólida (Fases 1 y 2 de este documento) antes de
construir el visor 3D.

---

## 2. Estado del repositorio Git (nuevo desde v1)

- Repositorio inicializado por primera vez el 16/07/2026 (antes no existía).
- Rama principal: `master`.
- Historial actual:
  ```
  16cd8a3 Refactor ES6 modules completo + sistema de cotizacion via Formspree modal
  baa7f5b Estado inicial estable - SVG-BOM funcional, previo a refactor ES6
  ```
- Rama `refactor-es6-modules` ya fue **mergeada a `master`** (fast-forward, sin
  conflictos) — ya no existe como rama separada activa.
- **Próxima rama a crear (pendiente, no ejecutada todavía):** `feature-event-bus`,
  para la Fase 2 (ver sección 7).
- `.gitignore` excluye `graphify-out/` correctamente. No excluye `data/` ni
  `resources/` (correcto, son parte del proyecto real).

---

## 3. Arquitectura actual — árbol de carpetas (`ER5215-301_DEV/`)

```
E:\ER5215-301_DEV\
│   config.json
│   index.html                  ← AHORA: un solo <script type="module" src="js/core/app.js">
│                                  (antes: ~20 <script> en orden crítico)
│
├───css\
│       style.css                (+ estilos del modal de cotización, agregados)
│
├───data\
│       client.json              (+ campo "salesEmail" agregado)
│       project.json
│       components.json
│       documents.json           (vacío, sin usar aún)
│
├───resources\
│   ├───svg\ (ER5215-301.svg, con hotspots)
│   ├───excel\ (ER5215-301.xlsx, BOM del cliente)
│   ├───3d\ (ER5215-301.html eDrawings ~16MB, ER5215-301.glb, diagnostico_3d.html,
│   │         + posible Auditoría Técnica y Catálogo de Piezas.md — VER NOTA ABAJO)
│   ├───pdf\ (vacía / T2S54FAM101182T19.5.pdf — VER NOTA ABAJO)
│   └───images\ (thumbnail.png y preview.jpg SIGUEN sin existir — pendiente)
│
├───js\  ← TODOS los archivos de aquí en adelante son ahora módulos ES6
│   │      (import/export explícitos, no globals/window.*)
│   │
│   ├───core\
│   │       app.js            (exporta SDTD, importa Engine)
│   │       engine.js          (exporta Engine, importa TODO lo demás — 9 imports)
│   │       dataManager.js     (exporta DataManager, importa SDTD)
│   │       componentManager.js (exporta ComponentManager, importa SDTD)
│   │       selectionState.js  (exporta SelectionState, sin imports — hoja pura)
│   │       moduleManager.js   (exporta ModuleManager, importa SDTD + 3 módulos de visor;
│   │                           YA NO hace window.ModuleManager = ...)
│   │       eventBus.js        ← PENDIENTE DE CREAR (Fase 2, ver sección 7)
│   │
│   ├───modules\
│   │   ├───svg\
│   │   │       svg.js              (exporta SVGModule; importa SDTD, ComposerAdapter)
│   │   │       composerAdapter.js  (exporta ComposerAdapter; importa ComposerLookup,
│   │   │                            SelectionManager)
│   │   │       composerEvents.js   (exporta ComposerEvents; importa SelectionState,
│   │   │                            HighlightService, SelectionManager, SVGInspector)
│   │   │       composerLookup.js   (exporta ComposerLookup; importa ComposerEvents,
│   │   │                            HighlightService)
│   │   │       svgInspector.js     (exporta SVGInspector; hoja, sin imports)
│   │   ├───model3d\
│   │   │       model3d.js          (exporta Model3DModule; STUB — sin imports aún)
│   │   └───documents\
│   │           documents.js        (exporta DocumentsModule; STUB — sin imports aún)
│   │
│   ├───service\
│   │       navigationService.js    (exporta NavigationService; importa ComponentManager,
│   │                                Panel, BOM, ComposerAdapter)
│   │       highlightService.js     (exporta HighlightService; importa ComposerAdapter, BOM)
│   │       synchronizationService.js (exporta SynchronizationService; sin imports — hoja)
│   │       historyService.js       (exporta HistoryService; sin imports — hoja)
│   │       documentService.js      (exporta DocumentService; importa SDTD, DataManager)
│   │
│   ├───ui\
│   │       ui.js               (exporta UI; importa SDTD)
│   │       workspace.js        (exporta Workspace; importa SDTD, SVGModule,
│   │                            Model3DModule, DocumentsModule)
│   │       selectionManager.js (exporta SelectionManager; importa ComponentManager,
│   │                            NavigationService, HighlightService,
│   │                            SynchronizationService, HistoryService)
│   │       panel.js            (exporta Panel; importa SDTD, DataManager, BOM;
│   │                            + AHORA maneja el modal de cotización Formspree,
│   │                            reemplazando la lógica vieja de mailto:)
│   │       bom.js              (exporta BOM; importa SDTD, ComponentManager,
│   │                            SelectionManager, HighlightService, Panel)
│   │
│   ├───tools\                  ← SIN TOCAR, sigue huérfano/aislado
│   │   │   composerAnalyzer.js   (confirmado por graphify: 24 nodos de este grupo
│   │   │   reportManager.js       están AISLADOS del resto del grafo — candidatos
│   │   ├───analyzers\ (6 archivos)  fuertes a limpieza o decisión de destino)
│   │   ├───reporters\ (consoleReporter.js)
│   │   └───runtime\ (eventAnalyzer.js)
│   │
│   ├───viewer\
│   │       viewer.js           ← SIGUE huérfano, candidato a borrar (sin cambios)
│   │
│   └───utils\                  ← vacía
│
└───pipeline\                   ← SIN TOCAR (fuera de scope del refactor ES6 a propósito;
    │   generator.html            corre en navegador, sin Node.js)
    │   generator.js
    │   xlsx.full.min.js
    └───adapters\
            svgSourceAdapter.js
            excelAdapter.js
```

**⚠️ Pendiente de limpieza (sin cambios desde v1):** sigue existiendo una versión
vieja del pipeline en Node.js (`build_components_json.js` + `node_modules/` +
`package.json`) que debe borrarse. No se ha tocado.

---

## 4. Cómo se conectan los módulos ahora (cambio arquitectónico central)

### Antes (v1): scripts globales, sin imports
Todo vivía en `window`/scope global implícito. El orden de los `<script>` en
`index.html` era crítico — reordenar una línea podía romper todo en silencio.
`Engine` llamaba a `DataManager.initialize()`, `ComponentManager.initialize()`, etc.
por nombre global, asumiendo que ya existían en memoria.

### Ahora (v2): módulos ES6 con imports/exports reales
- `index.html` tiene **un solo punto de entrada**:
  `<script type="module" src="js/core/app.js"></script>`
- `app.js` importa `Engine`; `Engine` importa los 9 módulos que necesita
  (`DataManager`, `ComponentManager`, `SelectionState`, `ModuleManager`, `UI`,
  `Workspace`, `SelectionManager`, `Panel`, `BOM`).
- El navegador resuelve automáticamente el grafo de dependencias completo —
  **ya no importa el orden en que se "declaran" los módulos**, solo importa que
  las rutas de import sean correctas.
- **`SDTD`** (antes variable global implícita) ahora se importa explícitamente en
  8 archivos: `dataManager.js`, `componentManager.js`, `ui.js`, `workspace.js`,
  `bom.js`, `panel.js`, `documentService.js`, `svg.js`.

### Ciclos de importación circular (documentados y confirmados seguros)
Existen ciclos reales de imports, por ejemplo:
- `ComposerAdapter → ComposerLookup → ComposerEvents → SelectionManager → HighlightService → ComposerAdapter`
- `BOM ↔ Panel` (mutuamente)
- Varios ciclos de 3-5 archivos que pasan por `app.js → engine.js → (ui/*) → app.js`

**Esto es seguro y ya fue probado.** ES6 resuelve los ciclos vía *live bindings*:
el módulo se registra completo antes de que se ejecute cualquier línea real, y
como ningún import se usa a nivel superior del archivo (todos los usos están
dentro de métodos disparados por eventos de usuario), los ciclos nunca fallan en
tiempo de ejecución. **Confirmado con prueba crítica** (ver sección 6).

### Lo que NO ha cambiado todavía
La comunicación entre módulos sigue siendo **llamada directa a métodos**
(`SelectionManager.select()` llama directo a `NavigationService.navigate()`,
`HighlightService.highlight()`, etc.), no eventos. Esto es exactamente lo que
la Fase 2 (bus de eventos, sección 7) va a resolver — y es un prerrequisito
antes de integrar el visor 3D de forma limpia.

---

## 5. Sistema de cotización — cambio completo (reemplaza la sección de v1)

**Se descartó `mailto:` por completo.** Razón: depende de que cada usuario final
tenga un cliente de correo predeterminado configurado en su propio sistema
operativo — se confirmó en pruebas que ni siquiera es trivial en el propio equipo
de desarrollo (requiere registrar Gmail como manejador de protocolo en Chrome
manualmente). Para un entregable a cliente, esto era demasiado frágil.

**Reemplazo: modal de formulario + Formspree** (servicio de terceros, sin backend
propio necesario — funciona sin importar dónde el cliente hospede su web final).

- Endpoint de pruebas actual: `https://formspree.io/f/mdaqgkya`
  (recibe en `alejozubieta2010@gmail.com` — **cambiar a correo real de RAD
  Équipement antes de producción**)
- Implementado en `js/ui/panel.js`: `openQuoteModal()`, `closeQuoteModal()`,
  `handleQuoteSubmit()`.
- HTML del modal agregado al final de `index.html` (`#quote-modal-overlay`).
- Estilos agregados a `css/style.css` (`.modal-overlay`, `.modal-content`, etc.,
  usando las variables CSS existentes del proyecto).
- Flujo: clic en botón → modal se abre con datos prellenados (proyecto, pieza(s))
  → usuario completa nombre/correo/comentarios → `fetch()` POST a Formspree en
  segundo plano → mensaje de éxito/error → cierre automático tras 2s.
- ESC cierra el modal con `stopPropagation()` para no disparar el
  `SelectionManager.clear()` global del SVG.
- **Confirmado funcionando** en pruebas reales (correo llega a Gmail vía Formspree).

**Esto resuelve el pendiente #1 de v1** ("confirmar que el botón abre el correo"),
pero de una forma distinta a la originalmente planeada — ya no aplica el pendiente
tal cual estaba escrito.

---

## 6. Validación con graphify (nuevo desde v1)

Se instaló **graphify** (skill de análisis de grafo de conocimiento para agentes
de código) y se corrió sobre el proyecto antes y después del refactor ES6.

### Antes del refactor
- `SDTD`, `ComponentManager`, `DataManager`, `Engine`, `ModuleManager`,
  `SelectionState` aparecían como **6 nodos aislados** (degree=1 cada uno, cada
  uno en su propia "comunidad de uno").

### Después del refactor (confirma el éxito estructural del cambio)
- **135 nodos, 240 edges, 21 comunidades** (subió de nodos/edges porque también
  se re-analizaron documentos .md nuevos).
- **`SDTD` es ahora el nodo más conectado de todo el grafo (11 edges)** — pasó de
  aislado a ser el "god node" #1.
- Comunidad **"Core Application Modules"** (14 nodos, cohesión 0.20): `SDTD`,
  `ComponentManager`, `DataManager`, `Engine`, `ComposerAdapter`,
  `DocumentService`, `HighlightService`, `HistoryService`, +6 más — ya conectados
  coherentemente.
- Comunidad **"Module Loading System"** (5 nodos, cohesión 0.38): `ModuleManager`,
  `DocumentsModule`, `Model3DModule`, `SVGModule`, `Workspace`.
- Comunidad **"SVG Interaction & Selection"** (4 nodos, cohesión 0.36):
  `SelectionState`, `ComposerEvents`, `ComposerLookup`, `SVGInspector`.
- **Los nodos aislados ahora son otros**: ~24 nodos de `js/tools/*` (todo el
  "Reverse Engineering Laboratory" — `ActorAnalyzer`, `ComposerAnalyzer`,
  `PathAnalyzer`, `RelationshipAnalyzer`, `ScriptAnalyzer`, etc.) — esto **valida
  con datos objetivos** los pendientes #2 y #3 de v1 (limpieza de código muerto).
- **God nodes del proyecto** (más conectados, en orden): `SDTD` (11),
  `Plan de Integración Visor 3D ↔ SDTD` (11), `Technical Findings and Open
  Problems` (9), `Bill of Materials (BOM)` (9), `ER5215-301 Pilot Project` (8).

### Pendiente detectado por graphify, sin resolver todavía
El reporte marcó como **AMBIGUOUS** una relación entre `Auditoría Técnica y
Catálogo de Piezas ER5215-301.md` (menciona un ensamblaje de 1185 nodos / 172
piezas únicas + un script Python de extracción de BOM desde GLB) y
`T2S54FAM101182T19.5.pdf` en `resources/pdf/`. **Estos archivos no han sido
compartidos en el chat todavía** — parece ser trabajo paralelo del usuario en la
auditoría del modelo 3D, potencialmente muy relevante para la Fase 4 (integración
3D real), pendiente de revisar.

**Comando para regenerar el grafo tras nuevos cambios:** `/graphify . --update`
dentro de OpenCode, parado en el proyecto.

---

## 7. Fase 2 — Bus de eventos (EN CURSO, primer paso pendiente de ejecutar)

### Objetivo
Reemplazar llamadas directas entre módulos por un patrón publish/subscribe, para
que agregar un visor nuevo (el 3D) no requiera modificar `SelectionManager`,
`HighlightService`, `NavigationService` ni `SynchronizationService`.

### Diseño acordado
```
Antes (llamada directa):
  ComposerEvents / BOM  ──llama──►  SelectionManager.select()
  ComposerAdapter       ──llama──►  SelectionManager.clear()
  SelectionManager      ──llama──►  NavigationService, HighlightService,
                                     SynchronizationService, HistoryService

Después (eventos vía EventBus):
  ComposerEvents / BOM  ──emite──►  "selection:requested" {componentId}
  ComposerAdapter       ──emite──►  "selection:clear-requested"
                                          │
                                          ▼
                                  SelectionManager (valida, decide)
                                          │
                                          ▼
                        emite "selection:changed" / "selection:cleared"
                                          │
          ┌───────────┬──────────────────┼──────────────────┐
          ▼           ▼                  ▼                  ▼
  NavigationService HighlightService SynchronizationService HistoryService
  (cada uno se suscribe en su propio initialize(), ya no los llama
   SelectionManager directamente)
```

**Beneficio directo para el visor 3D:** cuando se construya, solo necesita
emitir `"selection:requested"` igual que el SVG y el BOM — no necesita saber que
existen `NavigationService`, `HighlightService`, etc. Cero imports nuevos en
esos 4 servicios.

### Estado de ejecución — IMPORTANTE, esto es lo primero que hay que hacer al retomar
- ❌ **`js/core/eventBus.js` — TODAVÍA NO SE HA CREADO.** Este es el siguiente
  paso inmediato, sin excepción.
- ❌ Rama `feature-event-bus` — todavía no se ha creado.
- ❌ Conversión de `SelectionManager`, `HighlightService`, `NavigationService`,
  `SynchronizationService`, `HistoryService`, `ComposerEvents`, `BOM`,
  `ComposerAdapter` a patrón pub/sub — no iniciada.

### Próximo prompt exacto para OpenCode (retomar aquí)
```
Crea una nueva rama de git llamada feature-event-bus a partir de master, 
y muévete a ella. Confírmame que estás parado en esa rama.

Después, crea un archivo nuevo: js/core/eventBus.js

Con este contenido exacto:

/* ==========================================================
   SDTD CORE
   Event Bus
   Desacopla módulos: en vez de llamarse por nombre directo,
   emiten y escuchan eventos.
   Version : 1.0.0
========================================================== */

export const EventBus = {

    listeners: {},

    on(eventName, callback) {
        if (!this.listeners[eventName]) {
            this.listeners[eventName] = [];
        }
        this.listeners[eventName].push(callback);
    },

    off(eventName, callback) {
        if (!this.listeners[eventName]) {
            return;
        }
        this.listeners[eventName] = this.listeners[eventName].filter(
            cb => cb !== callback
        );
    },

    emit(eventName, payload) {
        if (!this.listeners[eventName]) {
            return;
        }
        this.listeners[eventName].forEach(callback => {
            try {
                callback(payload);
            } catch (error) {
                console.error(
                    "EventBus error in listener for", eventName, ":", error
                );
            }
        });
    }

};

No modifiques ningún otro archivo todavía. Confírmame que el archivo se creó 
correctamente.
```

Después de esto siguen 2 lotes más (no detallados aún en profundidad, se
diseñarán en el momento):
- **Lote 2:** convertir `SelectionManager` para que escuche/emita en vez de
  llamar directo a los 4 servicios.
- **Lote 3:** convertir los 3 emisores (`ComposerEvents`, `BOM`, `ComposerAdapter`)
  para que emitan eventos en vez de llamar a `SelectionManager` directamente.

---

## 8. Plan de integración del visor 3D — AJUSTE NECESARIO antes de ejecutar

Existe un documento `PLAN_INTEGRACION_3D.md` (18/07/2026) ya escrito, con
estrategia iframe + postMessage para integrar el visor Three.js/Vite (ubicado en
`E:\SDTD\SDTD\`, proyecto separado con su propio stack). **La estrategia central
del plan es correcta y se mantiene**, pero fue escrita antes de decidir la Fase 2,
y por eso tiene un conflicto de diseño que hay que corregir antes de ejecutarlo.

### El problema encontrado
Las secciones 3.4 y 3.5 del plan proponen que `selectionManager.js` y
`highlightService.js` conozcan directamente a `Model3DModule`:
```javascript
// Patrón del plan original (a evitar):
if (Model3DModule.initialized) {
    Model3DModule.selectComponent(id);
}
```
Esto reintroduce el acoplamiento directo que la Fase 2 busca eliminar.

### Corrección acordada
`Model3DModule` debe suscribirse al `EventBus` como cualquier otro módulo — nadie
más necesita saber que existe:
```javascript
// Dentro de model3d.js (no en selectionManager.js ni highlightService.js):
EventBus.on("selection:changed", (data) => {
    this.postMessage({ action: "highlight", componentId: data.componentId });
});
EventBus.on("selection:cleared", () => {
    this.postMessage({ action: "clear" });
});
// Y al recibir postMessage del iframe:
onMessage(event) {
    if (event.data.event === "component:selected") {
        EventBus.emit("selection:requested", { componentId: event.data.data.id });
    }
}
```

**Nota de namespacing:** el visor 3D (proyecto Three.js/Vite separado) también
planea crear su propio `src/core/EventBus.js` — es un sistema de eventos
**totalmente distinto**, interno a ese proyecto, comunicado con SDTD solo vía
`postMessage`. No confundir ni intentar unificar ambos.

### Orden de ejecución acordado
1. Terminar Fase 2 completa en SDTD (bus de eventos funcionando).
2. Retomar `PLAN_INTEGRACION_3D.md`, reescribiendo específicamente las secciones
   3.4 y 3.5 para usar `EventBus` en vez de checks directos.
3. El resto del plan (preparar el visor Three.js para embedding, botón toggle
   2D/3D, sincronización BOM↔3D) se mantiene igual.
4. Antes del paso 3, revisar `Auditoría Técnica y Catálogo de Piezas.md` y el
   script de extracción de BOM desde GLB (mencionados en sección 6) para
   confirmar qué datos exactos necesita consumir el visor 3D.

---

## 9. Estado: ✅ Completado y probado (actualizado desde v1)

Todo lo de v1 sigue vigente (visor SVG funcional, BOM sincronizado, checkboxes,
scroll automático, etc.) **más**:
- Refactor completo a módulos ES6 (24 archivos), con prueba crítica pasada:
  hard-refresh sin caché + navegación entre piezas + ESC + checkboxes +
  cotización, todo repetido tras recarga fría, sin errores en consola.
- `index.html` reducido a un solo punto de entrada (`type="module"`).
- Sistema de cotización nuevo (modal + Formspree) probado end-to-end, correo
  confirmado recibido.
- Git configurado, historial limpio, merge sin conflictos a `master`.
- Validación estructural del refactor confirmada objetivamente con graphify
  (nodos core pasaron de aislados a altamente conectados).

---

## 10. Estado: 🔲 Pendiente (actualizado desde v1)

| # | Pendiente | Notas |
|---|---|---|
| 1 | ~~Confirmar botón de cotización~~ | ✅ Resuelto de otra forma (Formspree) |
| 2 | Limpieza: carpetas vacías, `viewer.js` huérfano, pipeline Node.js viejo | Confirmado por graphify como código muerto real |
| 3 | Decidir destino de `js/tools/*` | Confirmado por graphify: 24 nodos aislados |
| 4 | Unificar `SelectionState`/`SelectionManager` | La Fase 2 (bus de eventos) ayuda directamente a esto |
| 5 | ~~Configurar Git~~ | ✅ Resuelto |
| 6 | Etapa de Validación (SVG vs Excel) | Sin tocar |
| 7 | Recursos faltantes: thumbnail.png, preview.jpg | Sin tocar |
| 8 | Favicon | Sin tocar (cosmético) |
| 9 | Buscador en el BOM | Sin tocar |
| 10 | Zoom/pan en el SVG | Sin tocar |
| 11 | Indicador de carga | Sin tocar |
| 12 | `documents.js` stub | Sin tocar |
| 13 | **Visor 3D real** | Plan escrito, ajuste de arquitectura identificado (sección 8), NO iniciado en código |
| 14 | Carpeta `TEMPLATE` limpia | Depende de cerrar 2, 3, 4 |
| 15 | Piloto #2 con la plantilla | Depende de 14 |
| 16 (nuevo) | **Crear `js/core/eventBus.js`** | ❌ Es el siguiente paso inmediato, ver sección 7 |
| 17 (nuevo) | Revisar `Auditoría Técnica y Catálogo de Piezas.md` + script GLB→BOM | Mencionado por graphify, no compartido aún en el chat |
| 18 (nuevo) | Cambiar endpoint/correo de Formspree a producción antes de entregar | Hoy apunta a correo de pruebas |

**Prioridad para retomar (en este orden exacto):**
1. Ejecutar el prompt de la sección 7 (crear `eventBus.js` + rama).
2. Completar Lotes 2 y 3 de la Fase 2 (convertir `SelectionManager` y los 3
   emisores a pub/sub).
3. Probar exhaustivamente (mismo checklist que el refactor ES6).
4. Merge a `master`.
5. Compartir/revisar `Auditoría Técnica y Catálogo de Piezas.md` (punto 17).
6. Reescribir secciones 3.4/3.5 de `PLAN_INTEGRACION_3D.md` con `EventBus`.
7. Ejecutar la integración real del visor 3D.

---

## 11. Qué compartir al abrir una conversación nueva

1. **Este documento completo** (como primer mensaje o archivo de conocimiento).
2. Los archivos JS reales actuales (ya en su forma ES6): todo `js/core/`,
   `js/service/`, `js/ui/`, `js/modules/svg/`, `index.html`, `css/style.css`.
3. `PLAN_INTEGRACION_3D.md` (para la Fase de integración 3D).
4. `graph.html` y `GRAPH_REPORT.md` más recientes (correr `/graphify . --update`
   antes de exportarlos, para que reflejen el estado tras la Fase 2).
5. `Auditoría Técnica y Catálogo de Piezas ER5215-301.md` — **pendiente de
   compartir**, mencionado por graphify pero no visto todavía en el chat.
6. Aclarar explícitamente: *"Este documento (v2) es la fuente de verdad — el
   refactor ES6 y el sistema de cotización Formspree ya están hechos y
   probados; lo único pendiente inmediato es crear `js/core/eventBus.js` y
   completar la Fase 2 antes de tocar el visor 3D."*
