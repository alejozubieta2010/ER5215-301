/* ==========================================================
   SDTD SERVICES
   Navigation Service
   Version : 2.0.0 — Fase 2: ahora se suscribe a EventBus
   vía su propio initialize(), ya no lo llama SelectionManager.
========================================================== */

import { EventBus } from '../core/eventBus.js';
import { ComponentManager } from '../core/componentManager.js';
import { Panel } from '../ui/panel.js';
import { BOM } from '../ui/bom.js';
import { ComposerAdapter } from '../modules/svg/composerAdapter.js';
import { Model3DModule } from '../modules/model3d/model3d.js';

export const NavigationService = {

    initialize() {
        this.bindEvents();
        console.log("✔ Navigation Service Ready");
    },

    bindEvents() {
        EventBus.on("selection:changed", (data) => {
            this.navigate(data && data.componentId);
        });
        EventBus.on("selection:cleared", () => {
            this.clear();
        });
    },

    navigate(componentID) {
        if (!componentID) return;

        if (!ComponentManager.exists(componentID)) {
            console.warn("Navigation Service:", "Unknown component", componentID);
            return;
        }

        Panel.update(componentID);
        BOM.highlight(componentID);
        ComposerAdapter.highlightComponent(componentID);

        if (Model3DModule && Model3DModule.isLoaded()) {
            Model3DModule.focus(componentID);
        }
    },

    clear() {
        Panel.showEmptyState();
        if (BOM.clearSelection) BOM.clearSelection();
        if (ComposerAdapter.clearHighlight) ComposerAdapter.clearHighlight();
        if (Model3DModule && Model3DModule.isLoaded()) {
            Model3DModule.clear();
        }
    }

};
