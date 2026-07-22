# Graph Report - .  (2026-07-22)

## Corpus Check
- 69 files · ~50,954 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 297 nodes · 448 edges · 49 communities (21 shown, 28 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.77)
- Token cost: 4,850 input · 620 output

## Community Hubs (Navigation)
- BOM Builder 3D
- Core Engine
- Global State & UI
- 3D Interaction
- GLB Node Structure
- STEP File Audit
- Viewer3D Core
- BOM Data Pipeline
- 3D Viewer Components
- BOM-GLB Correlation
- Axes Overlay
- HTML Entry Point
- Project Assets
- BOM Intersection Filter
- Pipeline Generator
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 24
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 46

## God Nodes (most connected - your core abstractions)
1. `Viewer3D` - 17 edges
2. `EventBus` - 15 edges
3. `Viewer3D` - 14 edges
4. `SDTD` - 13 edges
5. `Guia Vinculacion STEP GLB EXCEL` - 12 edges
6. `ReferenceIndex3D` - 11 edges
7. `Viewer3D Orchestrator` - 10 edges
8. `SelectionManager` - 10 edges
9. `AxesOverlay` - 9 edges
10. `CameraAnimator` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Project Logo` --conceptually_related_to--> `ER5215-301 Technical Drawing (PNG)`  [INFERRED]
  images/logo.png → resources/images/ER5215-301.png
- `GLB 77 Level-1 Named Nodes` --shares_data_with--> `77 Level-1 Isomorphism STEP GLB`  [EXTRACTED]
  docs/RESUMEN_PROYECTO_SDTD_v4.md → resources/Guia_Vinculacion_STEP_GLB_EXCEL.md
- `GLB Node Name NAUO# Problem` --conceptually_related_to--> `NEXT_ASSEMBLY_USAGE_OCCURRENCE (NAUO)`  [EXTRACTED]
  docs/RESUMEN_PROYECTO_SDTD_v4.md → resources/Guia_Vinculacion_STEP_GLB_EXCEL.md
- `Graph After 3D Integration: 159 Nodes 255 Edges` --semantically_similar_to--> `Graph After ES6 Refactor: 135 Nodes 240 Edges`  [INFERRED] [semantically similar]
  docs/RESUMEN_PROYECTO_SDTD_v4.md → docs/RESUMEN_PROYECTO_SDTD_v2.md
- `SelectionManager3D` --references--> `EventBus (pub/sub)`  [EXTRACTED]
  docs/RESUMEN_PROYECTO_SDTD_v4.md → docs/RESUMEN_PROYECTO_SDTD_v2.md

## Import Cycles
- 3-file cycle: `js/core/app.js -> js/core/engine.js -> js/core/moduleManager.js -> js/core/app.js`
- 3-file cycle: `js/core/app.js -> js/core/engine.js -> js/ui/panel.js -> js/core/app.js`
- 3-file cycle: `js/core/app.js -> js/core/engine.js -> js/core/componentManager.js -> js/core/app.js`
- 3-file cycle: `js/core/app.js -> js/core/engine.js -> js/core/dataManager.js -> js/core/app.js`
- 3-file cycle: `js/core/app.js -> js/core/engine.js -> js/ui/bom.js -> js/core/app.js`
- 3-file cycle: `js/core/app.js -> js/core/engine.js -> js/ui/ui.js -> js/core/app.js`
- 3-file cycle: `js/core/app.js -> js/core/engine.js -> js/ui/workspace.js -> js/core/app.js`
- 3-file cycle: `js/modules/svg/composerAdapter.js -> js/modules/svg/composerLookup.js -> js/service/highlightService.js -> js/modules/svg/composerAdapter.js`
- 4-file cycle: `js/core/app.js -> js/core/engine.js -> js/core/moduleManager.js -> js/modules/model3d/model3d.js -> js/core/app.js`
- 4-file cycle: `js/core/app.js -> js/core/engine.js -> js/core/moduleManager.js -> js/modules/svg/svg.js -> js/core/app.js`
- 4-file cycle: `js/core/app.js -> js/core/engine.js -> js/service/navigationService.js -> js/ui/panel.js -> js/core/app.js`
- 4-file cycle: `js/core/app.js -> js/core/engine.js -> js/ui/bom.js -> js/ui/panel.js -> js/core/app.js`
- 4-file cycle: `js/core/app.js -> js/core/engine.js -> js/ui/panel.js -> js/core/dataManager.js -> js/core/app.js`
- 4-file cycle: `js/core/app.js -> js/core/engine.js -> js/service/highlightService.js -> js/modules/model3d/model3d.js -> js/core/app.js`
- 4-file cycle: `js/core/app.js -> js/core/engine.js -> js/service/highlightService.js -> js/ui/bom.js -> js/core/app.js`
- 4-file cycle: `js/core/app.js -> js/core/engine.js -> js/service/navigationService.js -> js/core/componentManager.js -> js/core/app.js`
- 4-file cycle: `js/core/app.js -> js/core/engine.js -> js/service/navigationService.js -> js/modules/model3d/model3d.js -> js/core/app.js`
- 4-file cycle: `js/core/app.js -> js/core/engine.js -> js/service/navigationService.js -> js/ui/bom.js -> js/core/app.js`
- 4-file cycle: `js/core/app.js -> js/core/engine.js -> js/ui/bom.js -> js/core/componentManager.js -> js/core/app.js`
- 4-file cycle: `js/core/app.js -> js/core/engine.js -> js/ui/selectionManager.js -> js/core/componentManager.js -> js/core/app.js`

## Hyperedges (group relationships)
- **SDTD Human Workflow Core Pipeline** — er5215_301_dev_docs_resumen_proyecto_sdtd_md_human_workflow, er5215_301_dev_docs_resumen_proyecto_sdtd_md_step_cad_file, er5215_301_dev_docs_resumen_proyecto_sdtd_md_solidworks_composer, er5215_301_dev_docs_resumen_proyecto_sdtd_md_bom, er5215_301_dev_docs_resumen_proyecto_sdtd_md_components_json_pipeline, er5215_301_dev_docs_resumen_proyecto_sdtd_md_edrawings_viewer [EXTRACTED 1.00]
- **Viewer3D Module Dependencies** — er5215_301_dev_docs_resumen_proyecto_sdtd_v4_md_viewer3d_orchestrator, er5215_301_dev_docs_resumen_proyecto_sdtd_v4_md_glb_loader, er5215_301_dev_docs_resumen_proyecto_sdtd_v4_md_reference_index_3d, er5215_301_dev_docs_resumen_proyecto_sdtd_v4_md_model_index_3d, er5215_301_dev_docs_resumen_proyecto_sdtd_v4_md_highlight_manager_3d, er5215_301_dev_docs_resumen_proyecto_sdtd_v4_md_bom_builder_3d, er5215_301_dev_docs_resumen_proyecto_sdtd_v4_md_camera_animator, er5215_301_dev_docs_resumen_proyecto_sdtd_v4_md_selection_manager_3d [EXTRACTED 1.00]
- **EventBus Pub/Sub Participants** — er5215_301_dev_docs_resumen_proyecto_sdtd_v2_md_event_bus, er5215_301_dev_docs_resumen_proyecto_sdtd_v2_md_selection_manager, er5215_301_dev_docs_resumen_proyecto_sdtd_v2_md_highlight_service, er5215_301_dev_docs_resumen_proyecto_sdtd_v2_md_navigation_service, er5215_301_dev_docs_resumen_proyecto_sdtd_v2_md_synchronization_service, er5215_301_dev_docs_resumen_proyecto_sdtd_v2_md_history_service, er5215_301_dev_docs_resumen_proyecto_sdtd_v2_md_composer_events, er5215_301_dev_docs_resumen_proyecto_sdtd_v2_md_bom_ui, er5215_301_dev_docs_resumen_proyecto_sdtd_v2_md_svg_composer_adapter [EXTRACTED 1.00]
- **BOM-GLB Correlation Workflow** — er5215_301_dev_resources_guia_correlacion_bom_glb_md, er5215_301_dev_resources_guia_correlacion_bom_glb_md_bom_extraction_step, er5215_301_dev_resources_guia_correlacion_bom_glb_md_glb_hierarchy_step, er5215_301_dev_resources_guia_correlacion_bom_glb_md_comparison_step, er5215_301_dev_resources_guia_correlacion_bom_glb_md_interpretation_step [EXTRACTED 1.00]
- **STEP-GLB-Excel Linkage Workflow** — er5215_301_dev_resources_guia_vinculacion_step_glb_excel_md, er5215_301_dev_resources_guia_vinculacion_step_glb_excel_md_step_extraction_step, er5215_301_dev_resources_guia_vinculacion_step_glb_excel_md_glb_extraction_step, er5215_301_dev_resources_guia_vinculacion_step_glb_excel_md_isomorphism_linkage_step, er5215_301_dev_resources_guia_vinculacion_step_glb_excel_md_excel_crossover_step [EXTRACTED 1.00]
- **SDTD Engine Startup Sequence** — er5215_301_dev_docs_resumen_proyecto_sdtd_v2_md_app_js, er5215_301_dev_docs_resumen_proyecto_sdtd_v2_md_engine, er5215_301_dev_docs_resumen_proyecto_sdtd_v2_md_data_manager, er5215_301_dev_docs_resumen_proyecto_sdtd_v2_md_component_manager, er5215_301_dev_docs_resumen_proyecto_sdtd_v2_md_selection_state, er5215_301_dev_docs_resumen_proyecto_sdtd_v2_md_module_manager [EXTRACTED 1.00]
- **SVG Interaction Module Chain** — er5215_301_dev_docs_resumen_proyecto_sdtd_v2_md_svg_module, er5215_301_dev_docs_resumen_proyecto_sdtd_v2_md_svg_composer_adapter, er5215_301_dev_docs_resumen_proyecto_sdtd_v2_md_composer_lookup, er5215_301_dev_docs_resumen_proyecto_sdtd_v2_md_composer_events, er5215_301_dev_docs_resumen_proyecto_sdtd_v2_md_svg_inspector [EXTRACTED 1.00]
- **Full Selection Chain (SVG BOM 3D)** — er5215_301_dev_docs_resumen_proyecto_sdtd_v2_md_selection_manager, er5215_301_dev_docs_resumen_proyecto_sdtd_v2_md_navigation_service, er5215_301_dev_docs_resumen_proyecto_sdtd_v2_md_highlight_service, er5215_301_dev_docs_resumen_proyecto_sdtd_v2_md_synchronization_service, er5215_301_dev_docs_resumen_proyecto_sdtd_v2_md_history_service [EXTRACTED 1.00]
- **Pipeline Generator Components** — er5215_301_dev_pipeline_generator_html, er5215_301_dev_pipeline_generator_html_sheetjs, er5215_301_dev_pipeline_generator_html_svg_source_adapter, er5215_301_dev_pipeline_generator_html_excel_adapter [EXTRACTED 1.00]
- **index.html DOM Structure** — er5215_301_dev_index_html, er5215_301_dev_index_html_app_entry, er5215_301_dev_index_html_importmap_three, er5215_301_dev_index_html_viewer_3d_container, er5215_301_dev_index_html_quote_modal, er5215_301_dev_index_html_bom_container [EXTRACTED 1.00]

## Communities (49 total, 28 thin omitted)

### Community 0 - "BOM Builder 3D"
Cohesion: 0.06
Nodes (7): BomBuilder3D, CameraAnimator, GLBLoader, HighlightManager3D, ModelIndex3D, ReferenceIndex3D, SelectionManager3D

### Community 1 - "Core Engine"
Cohesion: 0.13
Nodes (25): SDTD, ComponentManager, DataManager, Engine, EventBus, ModuleManager, SelectionState, DocumentsModule (+17 more)

### Community 2 - "Global State & UI"
Cohesion: 0.22
Nodes (21): app.js SDTD Global State, BOM UI, ComponentManager, ComposerEvents, ComposerLookup, DataManager, DocumentsModule, Engine (+13 more)

### Community 4 - "GLB Node Structure"
Cohesion: 0.12
Nodes (17): GLB 77 Level-1 Named Nodes, GLB Node Name NAUO# Problem, Guia Vinculacion STEP GLB EXCEL, 21 of 24 Excel Lines Match STEP, 2 STEP-Only Parts, 3 Excel-Only Parts, 77 Level-1 Isomorphism STEP GLB, Excel Crossover Step (+9 more)

### Community 5 - "STEP File Audit"
Cohesion: 0.12
Nodes (16): Auditoria STEP ER5215-301, zubietam (CAD Author), Autodesk Inventor 2022, AUTOMOTIVE_DESIGN STEP Schema AP214, BOM 175 Items STEP Audit, Auditoria Tecnica Catalogo Piezas, GLB 1185 Nodes 1152 Meshes 26 Materials, BOM 172 Unique Parts GLB Audit (+8 more)

### Community 7 - "BOM Data Pipeline"
Cohesion: 0.23
Nodes (13): Bill of Materials (BOM), components.json Pipeline Output, eDrawings HTML Viewer (~16MB), HOOPS Communicator Engine, SDTD Human Workflow, RAD Equipement Inc. (Client), SDTD Platform, SolidWorks Composer (+5 more)

### Community 8 - "3D Viewer Components"
Cohesion: 0.18
Nodes (12): BomBuilder3D, CameraAnimator, GLBLoader, HighlightManager3D, mesh-overrides.json, model3d.js Adapter, ModelIndex3D, OrbitControls (+4 more)

### Community 9 - "BOM-GLB Correlation"
Cohesion: 0.18
Nodes (11): Guia Correlacion BOM vs GLB, BOM Extraction Step, BOM-GLB Comparison Step, BOM-GLB Discrepancy Detection, GLB Hierarchy Extraction Step, Results Interpretation Step, Parts-Only-in-BOM Analysis, Parts-Only-in-GLB Analysis (+3 more)

### Community 11 - "HTML Entry Point"
Cohesion: 0.33
Nodes (6): SDTD Workspace index.html, app.js Entry Point, BOM Container DOM, Three.js CDN Import Map, Quote Modal Overlay DOM, viewer-3d-container DOM

### Community 12 - "Project Assets"
Cohesion: 0.50
Nodes (4): Project Logo, Embedded Drawing Image Asset, ER5215-301 Technical Drawing (PNG), ER5215-301 Interactive Technical Drawing (SVG)

### Community 13 - "BOM Intersection Filter"
Cohesion: 0.50
Nodes (4): BOM Intersection Filter Rationale, components.json 24 Components, SDTD.svgComponents Set, SVG 21 Hotspots

### Community 14 - "Pipeline Generator"
Cohesion: 0.50
Nodes (4): SDTD Generator components.json, Excel Adapter, SheetJS xlsx.full.min.js, SVG Source Adapter

### Community 15 - "Community 15"
Cohesion: 0.67
Nodes (3): get_transform(), print_node(), Extract transform info from a node.

### Community 16 - "Community 16"
Cohesion: 0.67
Nodes (3): Graph After ES6 Refactor: 135 Nodes 240 Edges, Graphify Structural Validation, Graph After 3D Integration: 159 Nodes 255 Edges

## Knowledge Gaps
- **71 isolated node(s):** `DocumentService`, `ExcelAdapter`, `SvgSourceAdapter`, `Generator`, `CHANGELOG ER5215-301` (+66 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **28 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Viewer3D` connect `3D Interaction` to `BOM Builder 3D`, `Core Engine`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `EventBus` connect `Core Engine` to `BOM Builder 3D`, `3D Interaction`, `Viewer3D Core`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `Viewer3D` connect `Viewer3D Core` to `BOM Builder 3D`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **What connects `DocumentService`, `ExcelAdapter`, `SvgSourceAdapter` to the rest of the system?**
  _71 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `BOM Builder 3D` be split into smaller, more focused modules?**
  _Cohesion score 0.06196078431372549 - nodes in this community are weakly interconnected._
- **Should `Core Engine` be split into smaller, more focused modules?**
  _Cohesion score 0.12571428571428572 - nodes in this community are weakly interconnected._
- **Should `GLB Node Structure` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._