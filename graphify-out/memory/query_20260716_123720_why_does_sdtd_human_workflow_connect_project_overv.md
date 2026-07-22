---
type: "query"
date: "2026-07-16T12:37:20.458344+00:00"
question: "Why does SDTD Human Workflow connect Project Overview to 3D Viewer, BOM, SVG Composer, and CAD?"
contributor: "graphify"
outcome: "useful"
source_nodes: ["SDTD Human Workflow", "Bill of Materials (BOM)", "eDrawings Viewer", "SolidWorks Composer", "STEP CAD File Format"]
---

# Q: Why does SDTD Human Workflow connect Project Overview to 3D Viewer, BOM, SVG Composer, and CAD?

## Answer

SDTD Human Workflow is the central orchestration node in RESUMEN_PROYECTO_SDTD.md. It has 6 direct EXTRACTED references spanning 5 communities: SDTD Project Summary (Community 0), Bill of Materials (Community 2), components.json Pipeline Output (Community 2), eDrawings Viewer (Community 1), SolidWorks Composer (Community 3), STEP CAD File Format (Community 4). This node represents the human workflow that ties together the entire SDTD pipeline from CAD source through 3D viewing to documentation output.

## Outcome

- Signal: useful

## Source Nodes

- SDTD Human Workflow
- Bill of Materials (BOM)
- eDrawings Viewer
- SolidWorks Composer
- STEP CAD File Format