/* ==========================================================
   SDTD ENGINE
   Composer Adapter
   Version : 4.0.0 — Fase 2: emite "selection:clear-requested"
   en vez de llamar a SelectionManager.clear() directo.
   SVG Entry Point
========================================================== */

import { ComposerLookup } from './composerLookup.js';
import { EventBus } from '../../core/eventBus.js';

export const ComposerAdapter = {

    svgDocument: null,
    activeHotspot: null,

    highlightComponent(componentID) {
        if (!this.svgDocument) return;

        this.clearHighlight();

        const hotspot = ComposerLookup.getHotspot(componentID);
        if (!hotspot) {
            console.warn("⚠ No se encontró hotspot en el SVG para:", componentID);
            return;
        }

        hotspot.setAttribute("opacity", ".5");
        this.activeHotspot = hotspot;
    },

    clearHighlight() {
        if (this.activeHotspot) {
            this.activeHotspot.setAttribute("opacity", "0");
            this.activeHotspot = null;
        }
    },

    initialize(svgViewer) {
        this.svgDocument = svgViewer.contentDocument;

        if (!this.svgDocument) {
            console.error("Composer SVG not available.");
            return;
        }

        console.log("✔ Composer Adapter Ready");

        if (typeof EventAnalyzer !== "undefined") {
            EventAnalyzer.initialize(this.svgDocument);
        }

        ComposerLookup.initialize(this.svgDocument);

        this.svgDocument.addEventListener("click", () => {
            EventBus.emit("selection:clear-requested");
        });

        this.svgDocument.addEventListener("keydown", (event) => {
            if (event.key !== "Escape") return;
            EventBus.emit("selection:clear-requested");
        });
    }

};
