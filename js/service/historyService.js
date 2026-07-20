/* ==========================================================
   SDTD SERVICES
   History Service
   Version : 2.0.0 — Fase 2: se suscribe a EventBus en vez
   de que SelectionManager lo llame directo.
========================================================== */

import { EventBus } from '../core/eventBus.js';

export const HistoryService = {

    history: [],
    currentIndex: -1,
    maxItems: 100,

    initialize() {
        this.bindEvents();
        console.log("✔ History Service Ready");
    },

    bindEvents() {
        EventBus.on("selection:changed", (data) => {
            this.add(data && data.componentId);
        });
        EventBus.on("selection:cleared", () => {
            this.clear();
        });
    },

    add(componentID) {
        if (!componentID) return;
        if (this.current() === componentID) return;

        if (this.currentIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.currentIndex + 1);
        }

        this.history.push(componentID);

        if (this.history.length > this.maxItems) this.history.shift();

        this.currentIndex = this.history.length - 1;
    },

    back() {
        if (this.currentIndex <= 0) return null;
        this.currentIndex--;
        return this.history[this.currentIndex];
    },

    forward() {
        if (this.currentIndex >= this.history.length - 1) return null;
        this.currentIndex++;
        return this.history[this.currentIndex];
    },

    current() {
        if (this.currentIndex < 0) return null;
        return this.history[this.currentIndex];
    },

    previous() {
        if (this.currentIndex <= 0) return null;
        return this.history[this.currentIndex - 1];
    },

    next() {
        if (this.currentIndex >= this.history.length - 1) return null;
        return this.history[this.currentIndex + 1];
    },

    clear() {
        this.history = [];
        this.currentIndex = -1;
    },

    count() {
        return this.history.length;
    },

    getHistory() {
        return [...this.history];
    },

    report() {
        console.groupCollapsed("History");
        console.table(this.history.map((component, index) => ({
            index, component, current: index === this.currentIndex
        })));
        console.groupEnd();
    }

};
