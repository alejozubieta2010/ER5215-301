# SDTD — Estado del proyecto (resumen para retomar en nuevo Proyecto)

**Fecha de este resumen:** 15 de julio de 2026
**Proyecto piloto:** ER5215-301 (RAD Équipement Inc.)

---

## 1. Contexto de negocio

**SDTD (Smart Digital Technical Documentation)** es una plataforma para convertir el ensamble CAD de un equipo industrial en documentación técnica interactiva y digital, lista para entregar a un cliente sin tocar código.

**Objetivo real del negocio:** que el cliente final (ingeniero, comprador, técnico de mantenimiento) pueda:
1. Ver el equipo como un dibujo interactivo (SVG) y/o modelo 3D.
2. Hacer clic en cualquier pieza y ver su información (código, descripción, cantidad).
3. **Solicitar cotización o documentación adicional** directamente desde el visor (objetivo de negocio central).

**Flujo real de trabajo (proceso humano, no automatizable):**
1. El cliente (ej. RAD Équipement Inc., Quebec, trabaja en francés) entrega: archivo `.step` (CAD) + lista de materiales (Excel, PDF, o imagen — formato variable).
2. Se abre el `.step` en SolidWorks → se usa **Composer** para armar el dibujo interactivo → se exporta un `.svg` con "hotspots" (piezas seleccionables).
3. Se usa **eDrawings** para exportar un visor 3D interactivo (`.html`, ~16MB, autocontenido).
4. Se prepara un Excel con el BOM real del cliente (columnas: código, descripción, cantidad — nombres de columna variables según el cliente).
5. Con SVG + Excel, se genera `components.json` (herramienta propia, ver sección 5).
6. Se completa a mano lo que falte, y se entrega la carpeta completa del proyecto al cliente.

**Modelo de arquitectura elegido:** "copia por proyecto" — cada proyecto nuevo (ej. `ER5215-302`) es una copia completa e independiente de una plantilla (motor + estructura de carpetas vacía), no un motor central compartido.

---

## 2. Árbol de carpetas actual (`ER5215-301_DEV/`)

```
E:\ER5215-301_DEV\
│   config.json
│   index.html
│
├───css\
│       style.css
│
├───data\
│       client.json
│       project.json
│       components.json
│       documents.json          (vacío, sin usar aún)
│
├───resources\
│   ├───svg\
│   │       ER5215-301.svg       (export de Composer, con hotspots)
│   ├───excel\
│   │       ER5215-301.xlsx      (BOM del cliente)
│   ├───3d\
│   │       ER5215-301.html      (export de eDrawings, ~16MB, HOOPS Communicator)
│   ├───pdf\                     (vacía, ya no se usa — el flujo pasó a ser Excel)
│   └───images\                  (thumbnail.png y preview.jpg referenciados en
│                                  project.json pero NO existen todavía — pendiente)
│
├───js\
│   ├───core\
│   │       app.js
│   │       engine.js
│   │       dataManager.js
│   │       componentManager.js
│   │       selectionState.js
│   │       moduleManager.js
│   │
│   ├───modules\
│   │   ├───svg\
│   │   │       svgInspector.js
│   │   │       composerAdapter.js
│   │   │       composerEvents.js
│   │   │       composerLookup.js
│   │   │       svg.js
│   │   ├───model3d\
│   │   │       model3d.js        ← STUB, en construcción activa
│   │   └───documents\
│   │           documents.js      ← STUB, sin implementar
│   │
│   ├───service\
│   │       navigationService.js
│   │       highlightService.js
│   │       synchronizationService.js
│   │       historyService.js
│   │       documentService.js    ← STUB
│   │
│   ├───ui\
│   │       ui.js
│   │       workspace.js
│   │       selectionManager.js
│   │       panel.js
│   │       bom.js
│   │
│   ├───tools\                    ← "Reverse Engineering Laboratory", NO wireado en
│   │   │   composerAnalyzer.js     index.html, decisión de destino pendiente
│   │   │   reportManager.js
│   │   ├───analyzers\ (actor, group, path, relationship, script, text)
│   │   ├───reporters\ (consoleReporter.js)
│   │   └───runtime\ (eventAnalyzer.js)
│   │
│   ├───viewer\
│   │       viewer.js             ← CÓDIGO HUÉRFANO, nadie lo llama, candidato a borrar
│   │
│   └───utils\                    ← vacía
│
└───pipeline\                     ← Herramienta de preparación de datos (NO Node.js,
    │   generator.html              corre en el navegador, sin instalar nada)
    │   generator.js
    │   xlsx.full.min.js           (librería SheetJS, local, sin depender de internet)
    │
    └───adapters\
            svgSourceAdapter.js
            excelAdapter.js
```

**⚠️ Pendiente de limpieza:** existe una versión anterior del pipeline hecha en Node.js
(`build_components_json.js` + `adapters/` con `require()` + `node_modules/` +
`package.json`) que quedó **obsoleta** — se reemplazó por la versión de navegador de
arriba. Debe borrarse.

---

## 3. Responsabilidad de cada archivo y cómo se conectan

### Arranque (`index.html` → `js/core/app.js`)
`index.html` carga todos los `<script>` en orden fijo: `core` → `modules/svg` →
`moduleManager` → `service` → `ui`. `app.js` espera `DOMContentLoaded` y llama a
`Engine.initialize()`.

### `js/core/engine.js`
Orquesta el arranque: `loadConfiguration()` → `loadProjectData()` (client/project/
components/documents vía `dataManager`) → inicializa `ComponentManager`,
`SelectionState`, `UI`, `Workspace`, `SelectionManager`, `Panel`, `BOM` → finalmente
`ModuleManager` carga los módulos (svg/documents/model3d) según los flags en
`project.json → modules{}`.

### `js/core/dataManager.js`
Hace `fetch()` de los 4 JSON de `data/`. **`normalizeComponent(component)`** reconstruye
cada pieza del BOM a una forma fija (`id, name, description, quantity, material, item,
documents`) — **aquí se encontró y corrigió un bug real**: originalmente no copiaba el
campo `item`, así que aunque `components.json` lo tuviera, se perdía al cargar.

### `js/core/componentManager.js`
Guarda los componentes en un `Map`. Expone `exists(id)`, `get(id)`, `getAll()`.

### `js/core/selectionState.js`
Estado puro de bajo nivel: `hover(code)`, `clearHover()`, `select(code)`,
`isSelected(code)`, `getSelected()`. **No dispara ningún efecto visual por sí solo** —
solo lleva el registro.

### `js/core/moduleManager.js`
Lee `project.json → modules{svg, documents, model3d}` y llama `initialize()`/`load()`
del módulo correspondiente si está en `true`.

### `js/modules/svg/*` (el visor SVG, ya 100% funcional)
- **`composerLookup.js`**: recorre el SVG buscando `<g id="hotspot.N">`, extrae el
  código real de cada pieza leyendo el atributo `onmousemove` (regex sobre
  `ShowToolTip(evt,'N',"CODIGO")`), arma `componentMap{código: elementoHotspot}`.
  También lee el color de relleno del primer hotspot y se lo pasa a
  `HighlightService.setColor()` — así el color de resaltado del BOM sale del mismo
  SVG, no está fijo en el código.
- **`composerAdapter.js`**: vive en el navegador (⚠️ no confundir con el archivo del
  mismo nombre en `pipeline/adapters/`, que es otra cosa completamente distinta).
  `highlightComponent(id)`/`clearHighlight()` manipulan el atributo `opacity` del
  hotspot (mismo mecanismo nativo de Composer). `initialize(svgViewer)` conecta
  `ComposerLookup` y agrega un listener de clic en el fondo del SVG que limpia la
  selección si el clic no fue sobre ninguna pieza.
- **`composerEvents.js`**: registra `mouseenter`/`mouseleave`/`click` en cada hotspot.
  El hover **ya no ilumina** (se dejó que Composer lo haga nativamente) — solo
  actualiza `SelectionState`. Al salir el mouse de una pieza que SÍ está seleccionada,
  la vuelve a iluminar (porque Composer apaga la opacidad automáticamente al salir el
  mouse, sin preguntar si estaba seleccionada).
- **`svg.js`**: carga el `.svg` en `#viewer-container`, llama a
  `ComposerAdapter.initialize()`.
- **`svgInspector.js`**: herramienta de depuración, imprime info detallada de un
  hotspot en consola.

### `js/service/*`
- **`selectionManager.js`** (en `js/ui/`, es el punto de entrada central):
  `select(id)` valida con `ComponentManager`, y llama a `NavigationService`,
  `HighlightService`, `SynchronizationService`, `HistoryService`. También escucha
  la tecla **ESC** globalmente para llamar a `clear()`. Se eliminó un guard que
  bloqueaba re-seleccionar una pieza "ya marcada" (causaba que clics legítimos no
  hicieran nada).
- **`highlightService.js`**: guarda el color (de `composerLookup`), `highlight(id)`
  llama a `ComposerAdapter.highlightComponent()` + `BOM.highlight()`.
- **`navigationService.js`**: hace básicamente lo mismo que `highlightService`
  (duplicación menor, pendiente de unificar) + tiene comentarios placeholder para
  un futuro `PDFViewer`/`Model3D`.
- **`synchronizationService.js`**: hoy es mayormente diagnóstico (logs).
- **`historyService.js`**: historial de selección, uso mínimo por ahora.
- **`documentService.js`**: stub, sin implementar.

### `js/ui/*`
- **`panel.js`**: renderiza el panel derecho — Component, Information, Documents, y
  **Actions** (el hallazgo más importante del proyecto: originalmente esta sección
  estaba vacía, sin ningún botón — se corrigió). Actions tiene 2 botones: uno directo
  **"Demander un devis pour [código del proyecto]"** (siempre visible, cotiza el
  conjunto completo) y uno **"Demander un devis (N)"** para las piezas marcadas con
  checkbox en el BOM. Ambos arman un `mailto:` con el correo de `client.json →
  salesEmail`, en francés.
- **`bom.js`**: tabla del BOM (`Item | Code | Description | Qty | checkbox`), con un
  checkbox de encabezado "Tout" (seleccionar/deseleccionar todas). El clic en la fila
  (fuera del checkbox) selecciona la pieza en el SVG; el checkbox es independiente
  (para armar la cotización). `highlight()` aplica la clase visual + hace
  `scrollIntoView({block:"center"})` (se cambió de `"nearest"` porque no funcionaba
  bien con el encabezado sticky).

### `pipeline/` (herramienta separada, para preparar `components.json`)
- **`generator.html`**: página con 2 selectores de archivo (SVG, Excel) + botón
  "Generar" — corre 100% en el navegador, sin instalar nada, sin depender de internet.
- **`generator.js`**: orquestador — llama a los adaptadores, cruza los datos, ordena
  alfabéticamente por código, numera consecutivamente (`item = 1, 2, 3...`, ya que los
  números de "globo" del SVG resultaron ser un sistema de numeración no confiable —
  ver sección 4), marca como `"Sin identificar"` lo que no cruza con el Excel.
- **`adapters/svgSourceAdapter.js`**: extrae código de cada hotspot del SVG (misma
  lógica que `composerLookup.js`, pero para uso fuera del navegador vivo).
- **`adapters/excelAdapter.js`**: lee el Excel, reconoce nombres de columna en
  español/francés/inglés (`code/part_number/código/réf`,
  `description/descripción/objet/désignation`, `quantity/quantité/cantidad/qty`).

---

## 4. Hallazgos técnicos importantes (para no repetir investigación)

1. **El código real de cada pieza SÍ vive en el atributo `onmousemove` del hotspot**
   del SVG (tooltip de Composer) — es la fuente confiable. En una versión anterior del
   SVG, muchos hotspots traían nombres genéricos `Object NNNN` en vez del código real,
   por un bug del lado de Composer al generar el BOM (ya resuelto por el usuario). En
   la versión más reciente del SVG, **los 20 hotspots traen códigos reales**, 100% de
   coincidencia con el Excel.

2. **La tabla "Descripción/ID de LDM/Cantidad"** que a veces trae el SVG (como texto
   plano) usa una numeración de "globo" **completamente distinta e independiente** del
   número interno del hotspot (`hotspot.N`) — confirmado empíricamente (hotspot.6 ≠
   fila "item 6" de esa tabla). No es confiable cruzarlos automáticamente sin rastrear
   geometría de líneas (descartado por frágil). La versión más reciente del SVG ya ni
   siquiera incluye esta tabla. Por eso el "Item" del BOM ahora es solo un número
   consecutivo (1, 2, 3...) asignado después de ordenar alfabéticamente — no es el
   número de globo real de Composer.

3. **El visor 3D (eDrawings, `ER5215-301.html`, ~16MB) usa exactamente el mismo motor
   que Composer: HOOPS Communicator** (confirmado: mismo conteo de menciones
   "Communicator"/"HOOPS" en ambos archivos). Dentro del archivo (minificado) se
   confirmaron nombres de métodos reales: `viewer.getModel()`,
   `viewer.SelectionMgr.selectByID(id)`, `getNodeName()`, `ZoomToFitCmd`,
   `getHCModel()`, `getNodeChildren()` — el motor SÍ es programable.

4. **Problema activo sin resolver:** el archivo usa un sistema de módulos interno
   (AMD/RequireJS) que **no expone la instancia del visor como variable global** —
   dos intentos de diagnóstico automático (escanear `window`, escanear
   `requirejs`/`require` global) fallaron en encontrarla desde afuera del iframe.
   **Próximo paso identificado (no completado todavía):** editar directamente el
   archivo fuente del visor 3D en el punto donde su callback interno
   `onInit = function(iViewer){...}` recibe la instancia, e inyectar ahí una línea
   como `window.__eDrawingsViewer = iViewer;` para poder controlarlo desde afuera.
   Se ubicó la línea vía búsqueda de texto pero **no se llegó a modificar el archivo
   todavía** — quedó pendiente por límite de mensajes.

---

## 5. Estado: ✅ Completado y probado

- Visor SVG 100% funcional: selección, iluminación persistente (no se apaga sola),
  sincronización SVG↔BOM en ambos sentidos.
- **ESC y clic fuera de una pieza apagan la iluminación.**
- Scroll automático del BOM hacia la pieza seleccionada.
- Encabezado del BOM fijo (sticky) al hacer scroll.
- Color de resaltado del BOM tomado dinámicamente del SVG (no fijo en código).
- Checkboxes de selección múltiple en el BOM + "Tout" (seleccionar/deseleccionar
  todas).
- **Panel de Actions real** con botón de cotización (el hallazgo de negocio más
  importante, ya resuelto).
- Numeración consecutiva de "Item".
- Panel derecho sin scroll general, con distribución de espacio a medida (Client
  protagonista, Information más grande, Documents con scroll propio, Actions sin
  recorte).
- Pipeline `generator.html` (SVG + Excel → `components.json`), con arquitectura de
  adaptadores, corriendo 100% en navegador sin instalar nada.
- **El problema de Composer del lado del usuario ya se resolvió** — el SVG más
  reciente trae códigos reales en el 100% de las piezas.

---

## 6. Estado: 🔲 Pendiente

| # | Pendiente | Notas |
|---|---|---|
| 1 | Confirmar que el botón de cotización realmente abre el correo | Necesita cliente de correo predeterminado en Windows |
| 2 | Ejecutar limpieza: carpetas vacías (`js/utils`, `icons`, `fonts`, `templates`, `resources/pdf`), `js/viewer/viewer.js` (huérfano), pipeline viejo en Node.js | Ya todo identificado, solo falta ejecutar |
| 3 | Decidir destino de `js/tools/*` (sistema de análisis) | Integrar como QA interno, o descartar |
| 4 | Unificar `SelectionState` / `SelectionManager` (duplicación de responsabilidad) | Menor, técnico |
| 5 | **Configurar Git** | Recomendado varias veces, no hecho todavía — protege contra pérdidas de trabajo como la que ya ocurrió una vez en este proyecto |
| 6 | Etapa de Validación (comparar códigos del SVG vs Excel, avisar discrepancias explícitamente) | Ya existe el ~80% del código (los adaptadores) |
| 7 | Recursos faltantes: `thumbnail.png`, `preview.jpg`, PDF (referenciados en `project.json` pero no existen) | — |
| 8 | Favicon (404 en cada carga) | Cosmético, menor |
| 9 | Buscador en el BOM | Más relevante si crece el número de piezas |
| 10 | Controles de zoom/pan en el SVG | — |
| 11 | Indicador de carga mientras el SVG (o el 3D) carga | — |
| 12 | `documents.js` sigue siendo un stub vacío | — |
| 13 | **Visor 3D — TAREA ACTIVA:** completar la integración eDrawings (parchar el archivo para exponer la instancia del visor, construir `model3dAdapter.js`, agregar botón de alternancia 2D/3D, vincular el BOM al 3D) | Ver sección 4, punto 4 — este es justo donde quedamos |
| 14 | Crear carpeta `TEMPLATE` limpia | Debe ir DESPUÉS de resolver 2, 3, 4 (para no clonar deuda técnica) |
| 15 | Piloto #2 con la plantilla | Depende de 14 |

**Prioridad sugerida para retomar:** primero cerrar el punto 13 (visor 3D, es la tarea
activa y la prioridad de negocio actual — presentación al cliente), luego 5 (Git),
luego 2 y 6.

---

## 6.5. Objetivo del visor 3D (lo que se está construyendo)

- Visor 3D con **zoom controlado y que siempre permanezca centrado**.
- Botón de selección para **alternar entre visor SVG y visor 3D** (ambos existen en
  el DOM al mismo tiempo, solo se cambia cuál está visible).
- El **BOM debe vincularse dinámicamente al visor 3D** igual que ya está vinculado
  al SVG (clic en pieza 3D → resalta fila en BOM y actualiza panel; clic/checkbox en
  BOM → resalta pieza en 3D) — reutilizando `SelectionManager`/`HighlightService` ya
  existentes, agregando el 3D como una tercera "vía" de selección.

---

## 7. Qué compartir en el Proyecto nuevo, además de este resumen

1. **Este documento completo** (como primer mensaje o como archivo de conocimiento
   del Proyecto).
2. **Los archivos reales actuales del proyecto** — idealmente sube (o pega) al menos:
   - `index.html`
   - `css/style.css`
   - Todo `js/core/`, `js/service/`, `js/ui/`, `js/modules/svg/`
   - `data/client.json`, `data/project.json`, `data/components.json`
   - `pipeline/generator.html`, `pipeline/generator.js`, `pipeline/adapters/*`
   - El archivo 3D de eDrawings (`resources/3d/ER5215-301.html`) — es grande (~16MB),
     pero es el archivo sobre el que se está trabajando activamente.

   Esto es importante porque, en esta misma conversación, en un punto los archivos que
   yo tenía en mi copia de trabajo y los archivos reales del usuario **se
   desincronizaron** (un cambio se hizo en un lado pero nunca se entregó al otro) —
   compartir los archivos reales de nuevo evita heredar ese mismo problema.

2. **Aclarar explícitamente** al abrir el nuevo Proyecto: *"Vengo de una conversación
   anterior muy larga; este documento es el estado real y consolidado del proyecto —
   trátalo como la fuente de verdad, no asumas que hay bugs adicionales a los que se
   listan aquí."*

3. Si retomas justo el punto del visor 3D: menciona que **ya se ubicó (pero no se
   aplicó)** el punto exacto de inserción en el archivo eDrawings
   (`onInit = function(iViewer){...}`), para no repetir la investigación de cero.
