/* ==========================================================
   SDTD ENGINE
   Composer Events
   Version : 2.0.0 — Fase 2: emite "selection:requested" en
   vez de llamar a SelectionManager.select() directo.
========================================================== */

import { SelectionState } from '../../core/selectionState.js';
import { HighlightService } from '../../service/highlightService.js';
import { EventBus } from '../../core/eventBus.js';
import { SVGInspector } from './svgInspector.js';

export const ComposerEvents = {

    register(hotspot) {
        if (!hotspot) return;

        hotspot.addEventListener("mouseenter", event => this.hotspotEnter(event));
        hotspot.addEventListener("mouseleave", event => this.hotspotLeave(event));
        hotspot.addEventListener("click", event => this.hotspotClick(event));
    },

    hotspotEnter(event) {
        const hotspot = event.currentTarget;
        const componentCode = hotspot.dataset.component;
        if (!componentCode) return;

        SelectionState.hover(componentCode);
    },

    hotspotLeave(event) {
        const hotspot = event.currentTarget;
        const componentCode = hotspot.dataset.component;
        if (!componentCode) return;

        SelectionState.clearHover();

        if (SelectionState.isSelected(componentCode)) {
            if (typeof HighlightService !== "undefined") {
                HighlightService.highlight(componentCode);
            }
        }
    },

    hotspotClick(event) {
        event.preventDefault();
        event.stopPropagation();

        const hotspot = event.currentTarget;
        const componentCode = hotspot.dataset.component;
        if (!componentCode) return;

        console.log("--------------------------------");
        console.log("Hotspot :", hotspot.id);
        console.log("Component :", componentCode);
        console.log("--------------------------------");

        SelectionState.select(componentCode);

        EventBus.emit("selection:requested", { componentId: componentCode });

        if (typeof SVGInspector !== "undefined") {
            SVGInspector.inspect(hotspot);
        }
    }

};
