/* ==========================================================
   SDTD CORE
   Event Bus
   Desacopla módulos: en vez de llamarse por nombre directo,
   emiten y escuchan eventos.
   Version : 1.0.0
========================================================== */

export const EventBus = {

    listeners: {},

    on(eventName, callback) {
        if (!this.listeners[eventName]) {
            this.listeners[eventName] = [];
        }
        this.listeners[eventName].push(callback);
    },

    off(eventName, callback) {
        if (!this.listeners[eventName]) {
            return;
        }
        this.listeners[eventName] = this.listeners[eventName].filter(
            cb => cb !== callback
        );
    },

    emit(eventName, payload) {
        if (!this.listeners[eventName]) {
            return;
        }
        this.listeners[eventName].forEach(callback => {
            try {
                callback(payload);
            } catch (error) {
                console.error(
                    "EventBus error in listener for", eventName, ":", error
                );
            }
        });
    }

};
