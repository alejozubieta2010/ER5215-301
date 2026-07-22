# Changelog

All notable changes to the SDTD ER5215-301 project will be documented in this file.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [v0.2.0] - 2026-07-21

### Added
- Touch support for SVG viewer (pinch-to-zoom, drag-to-pan, double-tap reset) via `svgPanZoom.js`
- Multi-touch detection in `SelectionManager3D` to prevent accidental selections during pinch gestures
- Mobile responsive layout (`css/mobile.css`) with media queries for tablet (≤768px) and phone (≤480px)
- Viewport meta updated for mobile (`user-scalable=no`)
- Pointer events in SVG (`composerEvents.js`, `composerAdapter.js`) replacing mouse events for cross-device compatibility

### Changed
- Replaced `OrbitControls` with `TrackballControls` for full 3-axis rotation freedom (roll support)
- `rotateSpeed` set to `5.0` for faster camera response
- Simplified `ReferenceIndex3D` to direct name-based matching (removed complex override system)
- Regex fix for GLTFLoader dot-stripping bug: `/.stp$/i` → `/.?stp$/i` (Three.js strips the dot from `.stp` extensions)
- Updated GLB with real part number naming (77 nodes, 23 unique parts, 21 match BOM)
- `extractReference` simplified: only strips `.?stp` and checks `bomLookup`

### Removed
- `data/mesh-overrides.json` — no longer needed with direct part number matching
- `loadOverrides()` method from `Viewer3D` and `ReferenceIndex3D`
- Complex `extractReference` chain and `extractBaseRef()`
- Axes overlay

### Fixed
- GLB component highlighting: meshes now correctly tagged after GLTFLoader dot-stripping fix
- Camera constraints: removed polar angle limitations that prevented full rotation

---

## [v0.1.0] - 2026-07-21

### Added
- SVG viewer with pan and zoom functionality
- BOM table with component data from Excel (`ER5215-301.xlsx`)
- Three.js 3D viewer with GLB model loading (`resources/models/ER5215-301.glb`)
- `OrbitControls` for camera interaction
- `OrthographicCamera` with frustum-based zoom
- `CameraAnimator` for smooth camera transitions
- `HighlightManager3D` for 3D component highlighting (green `#00ff00`)
- `ReferenceIndex3D` for BOM-to-mesh mapping
- `ModelIndex3D` for mesh lookup
- `SelectionManager3D` for click-based selection
- `BomBuilder3D` for BOM-3D linkage
- `EventBus` architecture for cross-component communication
- Selection chain: SVG ↔ BOM ↔ 3D viewer
- Panel component for component details
- HDR environment lighting (`resources/hdr/studio_small_03_1k.hdr`)
- BOM filtered by SVG↔Excel intersection (21 hotspots)
- Consecutive Item column in BOM table
- BOM watcher (3s poll) for auto-export
- `scripts/export_bom.py` for Excel→JSON pipeline with `item` column and `visible3d` support
- `scripts/analyze.py` for BOM↔GLB correlation checking
- `scripts/check_glb.py` for GLB structure verification
- Graphify knowledge graph pipeline (`graphify-out/`)
- Mobile responsive base styles

### Architecture
- ES Modules direct (no bundler, no iframe+postMessage)
- Three.js via CDN import map (`three@0.185.1` from jsdelivr)
- SelectionManager as single entry point for all selections
- EventBus for decoupled communication
- Viewer architecture: adapter pattern for SVG, modular viewer files

### Changed
- CameraAnimator: OrthographicCamera, frustum-based zoom, damping 0.25
- Camera: polar angle `[0, 2π]`, OrbitControls with mouse drag
- Highlight color: `#00ff00` (green) in SVG and 3D

---

## [Unreleased]

### Project Goals
- Complete SDTD (Smart Digital Technical Documentation) web application
- SVG viewer, 3D viewer, BOM table, panel, selection — all sharing one event architecture
- Deployable to GitHub Pages and viewable on mobile/smartphone
- ER5215-301_DEV as master project — extend only, never replace architecture
