/* ==========================================================
   SDTD SERVICES
   Synchronization Service
   Version : 2.0.0 — Fase 2: se suscribe a "selection:changed"
   en su propio initialize().
========================================================== */

import { EventBus } from '../core/eventBus.js';

export const SynchronizationService = {

    currentComponent: null,
    state: { svg: false, bom: false, panel: false, pdf: false, model3d: false },

    initialize() {
        this.bindEvents();
        console.log("✔ Synchronization Service Ready");
    },

    bindEvents() {
        EventBus.on("selection:changed", (data) => {
            this.synchronize(data && data.componentId);
        });
    },

    synchronize(componentID) {
        if (!componentID) return;

        this.currentComponent = componentID;
        this.reset();

        this.state.svg = true;
        this.state.bom = true;
        this.state.panel = true;

        this.report();
    },

    reset() {
        Object.keys(this.state).forEach(key => { this.state[key] = false; });
    },

    report() {
        console.groupCollapsed("Synchronization");
        console.log("Component:", this.currentComponent);
        console.table(this.state);
        console.groupEnd();
    },

    getCurrentComponent() {
        return this.currentComponent;
    },

    isSynchronized() {
        return Object.values(this.state).every(value => value === true);
    },

    getState() {
        return { ...this.state };
    }

};
