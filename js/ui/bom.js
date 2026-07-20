/* ==========================================================
   SDTD BOM
   bom.js
   Version : 3.0.0 — Fase 2: la fila del BOM emite
   "selection:requested" en vez de llamar a
   SelectionManager.select() directo. Los checkboxes de
   cotización no cambian, no pasan por EventBus.
========================================================== */

import { SDTD } from '../core/app.js';
import { ComponentManager } from '../core/componentManager.js';
import { EventBus } from '../core/eventBus.js';
import { HighlightService } from '../service/highlightService.js';
import { Panel } from './panel.js';

export const BOM = {

    container: null,
    selectedRow: null,
    quoteSelection: new Set(),

    initialize() {
        this.container = document.getElementById("bom-content");
        console.log("✔ BOM Initialized");
    },

    build() {
        if (!this.container) return;
        this.container.innerHTML = "";

        if (!SDTD.components || SDTD.components.length === 0) {
            this.container.innerHTML = "<div class='panel-placeholder'>No BOM available.</div>";
            return;
        }

        let html = `
            <table id="bom-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Code</th>
                        <th>Description</th>
                        <th>Qty</th>
                        <th class="bom-checkbox-col">
                            <label for="bom-select-all" class="bom-select-all-label">
                                <input type="checkbox" id="bom-select-all" title="Sélectionner / désélectionner tout">
                                <span>Tout</span>
                            </label>
                        </th>
                    </tr>
                </thead>
                <tbody>
        `;

        SDTD.components.forEach(component => {
            html += `
                <tr data-component="${component.id}">
                    <td>${component.item ?? "-"}</td>
                    <td>${component.id}</td>
                    <td>${component.description ?? "-"}</td>
                    <td>${component.quantity ?? "-"}</td>
                    <td class="bom-checkbox-col">
                        <input type="checkbox" class="bom-quote-checkbox" data-component="${component.id}">
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table>`;

        this.container.innerHTML = html;
        this.attachEvents();

        console.log("✔ BOM Built");
    },

    attachEvents() {
        const rows = this.container.querySelectorAll("tbody tr");
        rows.forEach(row => {
            row.addEventListener("click", event => {

                if (event.target.classList.contains("bom-quote-checkbox")) {
                    return;
                }

                EventBus.emit("selection:requested", {
                    componentId: row.dataset.component
                });

            });
        });

        const checkboxes = this.container.querySelectorAll(".bom-quote-checkbox");
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener("change", () => {
                this.toggleQuoteItem(checkbox.dataset.component, checkbox.checked);
                this.syncSelectAllCheckbox();
            });
        });

        const selectAllCheckbox = document.getElementById("bom-select-all");
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener("change", () => {
                this.toggleSelectAll(selectAllCheckbox.checked);
            });
        }
    },

    toggleQuoteItem(componentCode, isChecked) {
        if (isChecked) this.quoteSelection.add(componentCode);
        else this.quoteSelection.delete(componentCode);

        if (typeof Panel !== "undefined" && Panel.refreshActions) {
            Panel.refreshActions();
        }
    },

    getQuoteSelection() {
        return Array.from(this.quoteSelection)
            .map(code => ComponentManager.get(code))
            .filter(Boolean);
    },

    toggleSelectAll(checked) {
        const checkboxes = this.container.querySelectorAll(".bom-quote-checkbox");
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
            this.toggleQuoteItem(checkbox.dataset.component, checked);
        });
    },

    syncSelectAllCheckbox() {
        const selectAllCheckbox = document.getElementById("bom-select-all");
        if (!selectAllCheckbox) return;

        const totalCount = SDTD.components.length;
        const selectedCount = this.quoteSelection.size;

        selectAllCheckbox.checked = totalCount > 0 && selectedCount === totalCount;
        selectAllCheckbox.indeterminate = selectedCount > 0 && selectedCount < totalCount;
    },

    highlight(componentCode) {
        if (!componentCode) return;

        if (this.selectedRow) {
            this.selectedRow.classList.remove("bom-selected");
        }

        const row = this.container.querySelector(`[data-component="${componentCode}"]`);
        if (!row) return;

        row.classList.add("bom-selected");

        if (typeof HighlightService !== "undefined") {
            row.style.setProperty("--bom-highlight-color", HighlightService.getColor());
        }

        row.scrollIntoView({ behavior: "smooth", block: "center" });

        this.selectedRow = row;
    },

    clearSelection() {
        if (this.selectedRow) {
            this.selectedRow.classList.remove("bom-selected");
            this.selectedRow.style.removeProperty("--bom-highlight-color");
            this.selectedRow = null;
        }
    }

};
