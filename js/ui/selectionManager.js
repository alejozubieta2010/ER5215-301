/* ==========================================================
   SDTD UI
   Selection Manager
   Version : 4.0.0
   Fase 2: convertido a pub/sub vía EventBus. Ya no llama
   directo a NavigationService, HighlightService,
   SynchronizationService ni HistoryService — emite
   "selection:changed" / "selection:cleared" y cada uno
   se suscribe por su cuenta en su propio initialize().
========================================================== */

import { ComponentManager } from '../core/componentManager.js';
import { EventBus } from '../core/eventBus.js';

export const SelectionManager = {

    selectedComponent: null,
    _escBound: false,
    _escHandler: null,

    initialize() {
        this.bindEscKey();
        this.bindEvents();
        console.log("✔ Selection Manager Initialized");
    },

    bindEvents() {

        EventBus.on("selection:requested", (data) => {
            this.select(data && data.componentId);
        });

        EventBus.on("selection:clear-requested", () => {
            this.clear();
        });

    },

    bindEscKey() {

        if (this._escBound && this._escHandler) {
            document.removeEventListener("keydown", this._escHandler);
            this._escBound = false;
        }

        this._escHandler = (event) => {
            if (event.key !== "Escape") return;
            if (!this.hasSelection()) return;
            this.clear();
        };

        document.addEventListener("keydown", this._escHandler);
        this._escBound = true;

    },

    select(componentID) {

        if (!componentID) return;

        if (!ComponentManager.exists(componentID)) {
            console.warn("Selection Manager:", "Unknown component", componentID);
            return;
        }

        this.selectedComponent = componentID;

        console.log("------------------------------------");
        console.log("Selected Component:");
        console.log(componentID);
        console.log("------------------------------------");

        EventBus.emit("selection:changed", { componentId: componentID });

    },

    clear() {
        this.selectedComponent = null;
        EventBus.emit("selection:cleared");
    },

    current() {
        return this.selectedComponent;
    },

    hasSelection() {
        return this.selectedComponent !== null;
    }

};
