/* ==========================================================
   SDTD SERVICES
   Highlight Service
   Version : 2.0.0 — Fase 2: se suscribe a EventBus en vez
   de que SelectionManager lo llame directo.
========================================================== */

import { EventBus } from '../core/eventBus.js';
import { ComposerAdapter } from '../modules/svg/composerAdapter.js';
import { BOM } from '../ui/bom.js';

export const HighlightService = {

    color: "#00ff00",
    activeComponent: null,

    initialize() {
        this.bindEvents();
        console.log("✔ Highlight Service Ready");
    },

    bindEvents() {
        EventBus.on("selection:changed", (data) => {
            this.highlight(data && data.componentId);
        });
        EventBus.on("selection:cleared", () => {
            this.clear();
        });
    },

    setColor(color) {
        this.color = color;
    },

    getColor() {
        return this.color;
    },

    highlight(componentID) {
        if (!componentID) return;

        this.activeComponent = componentID;

        if (typeof ComposerAdapter !== "undefined") {
            ComposerAdapter.highlightComponent(componentID);
        }

        if (typeof BOM !== "undefined") {
            BOM.highlight(componentID);
        }
    },

    clear() {
        this.activeComponent = null;

        if (typeof ComposerAdapter !== "undefined") {
            ComposerAdapter.clearHighlight();
        }

        if (typeof BOM !== "undefined") {
            BOM.clearSelection?.();
        }
    },

    getActiveComponent() {
        return this.activeComponent;
    }

};
