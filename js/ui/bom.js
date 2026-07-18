/* ==========================================================
   SDTD BOM

   bom.js

   Version : 2.1.0

   Bill Of Materials

========================================================== */

import { SDTD } from '../core/app.js';
import { ComponentManager } from '../core/componentManager.js';
import { SelectionManager } from './selectionManager.js';
import { HighlightService } from '../service/highlightService.js';
import { Panel } from './panel.js';

export const BOM = {

    /* ======================================================
       ELEMENTS
    ====================================================== */

    container: null,

    selectedRow: null,

    quoteSelection: new Set(),



    /* ======================================================
       INITIALIZE
    ====================================================== */

    initialize() {

        this.container =

            document.getElementById(

                "bom-content"

            );

        console.log("✔ BOM Initialized");

    },



    /* ======================================================
       BUILD BOM
    ====================================================== */

    build() {

        if (!this.container) {

            return;

        }

        this.container.innerHTML = "";



        //--------------------------------------------------
        // No Components
        //--------------------------------------------------

        if (

            !SDTD.components ||

            SDTD.components.length === 0

        ) {

            this.container.innerHTML =

                "<div class='panel-placeholder'>No BOM available.</div>";

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
                            <label
                                for="bom-select-all"
                                class="bom-select-all-label"
                            >
                                <input
                                    type="checkbox"
                                    id="bom-select-all"
                                    title="Sélectionner / désélectionner tout"
                                >
                                <span>Tout</span>
                            </label>
                        </th>

                    </tr>

                </thead>

                <tbody>

        `;



        SDTD.components.forEach(component => {

            html += `

                <tr

                    data-component="${component.id}"

                >

                    <td>${component.item ?? "-"}</td>

                    <td>${component.id}</td>

                    <td>${component.description ?? "-"}</td>

                    <td>${component.quantity ?? "-"}</td>

                    <td class="bom-checkbox-col">
                        <input
                            type="checkbox"
                            class="bom-quote-checkbox"
                            data-component="${component.id}"
                        >
                    </td>

                </tr>

            `;

        });



        html += `

                </tbody>

            </table>

        `;



        this.container.innerHTML = html;



        this.attachEvents();



        console.log("✔ BOM Built");

    },



    /* ======================================================
       EVENTS
    ====================================================== */

    attachEvents() {

        const rows =

            this.container.querySelectorAll(

                "tbody tr"

            );

        rows.forEach(row => {

            row.addEventListener(

                "click",

                event => {

                    //--------------------------------------------------
                    // Si el clic fue sobre el checkbox, no seleccionar
                    // la pieza en el SVG (son dos acciones distintas)
                    //--------------------------------------------------

                    if (

                        event.target.classList.contains(

                            "bom-quote-checkbox"

                        )

                    ) {

                        return;

                    }

                    SelectionManager.select(

                        row.dataset.component

                    );

                }

            );

        });

        //--------------------------------------------------
        // Checkboxes de selección para cotización
        //--------------------------------------------------

        const checkboxes =

            this.container.querySelectorAll(

                ".bom-quote-checkbox"

            );

        checkboxes.forEach(checkbox => {

            checkbox.addEventListener(

                "change",

                () => {

                    this.toggleQuoteItem(

                        checkbox.dataset.component,

                        checkbox.checked

                    );

                    this.syncSelectAllCheckbox();

                }

            );

        });

        //--------------------------------------------------
        // Checkbox de encabezado: seleccionar/deseleccionar todas
        //--------------------------------------------------

        const selectAllCheckbox =

            document.getElementById("bom-select-all");

        if (selectAllCheckbox) {

            selectAllCheckbox.addEventListener(

                "change",

                () => {

                    this.toggleSelectAll(

                        selectAllCheckbox.checked

                    );

                }

            );

        }

    },



    /* ======================================================
       QUOTE SELECTION (checkboxes)
    ====================================================== */

    toggleQuoteItem(componentCode, isChecked) {

        if (isChecked) {

            this.quoteSelection.add(componentCode);

        } else {

            this.quoteSelection.delete(componentCode);

        }

        if (

            typeof Panel !== "undefined" &&

            Panel.refreshActions

        ) {

            Panel.refreshActions();

        }

    },



    getQuoteSelection() {

        return Array.from(this.quoteSelection).map(

            code => ComponentManager.get(code)

        ).filter(Boolean);

    },



    /* ======================================================
       SELECT ALL / DESELECT ALL
    ====================================================== */

    toggleSelectAll(checked) {

        const checkboxes =

            this.container.querySelectorAll(

                ".bom-quote-checkbox"

            );

        checkboxes.forEach(checkbox => {

            checkbox.checked = checked;

            this.toggleQuoteItem(

                checkbox.dataset.component,

                checked

            );

        });

    },



    /* ======================================================
       SYNC SELECT ALL CHECKBOX
       (si el usuario marca/desmarca filas una por una, el
       checkbox de encabezado refleja si quedaron todas
       marcadas, todas vacías, o algo intermedio)
    ====================================================== */

    syncSelectAllCheckbox() {

        const selectAllCheckbox =

            document.getElementById("bom-select-all");

        if (!selectAllCheckbox) {

            return;

        }

        const totalCount =

            SDTD.components.length;

        const selectedCount =

            this.quoteSelection.size;

        selectAllCheckbox.checked =

            totalCount > 0 && selectedCount === totalCount;

        selectAllCheckbox.indeterminate =

            selectedCount > 0 && selectedCount < totalCount;

    },



    /* ======================================================
       HIGHLIGHT
    ====================================================== */

    highlight(componentCode) {

        if (!componentCode) {

            return;

        }



        if (this.selectedRow) {

            this.selectedRow.classList.remove(

                "bom-selected"

            );

        }



        const row =

            this.container.querySelector(

                `[data-component="${componentCode}"]`

            );



        if (!row) {

            return;

        }



        row.classList.add(

            "bom-selected"

        );

        //--------------------------------------------------
        // Color dinámico (mismo color de selección del SVG)
        //--------------------------------------------------

        if(typeof HighlightService!=="undefined"){

            row.style.setProperty(

                "--bom-highlight-color",

                HighlightService.getColor()

            );

        }



        row.scrollIntoView({

            behavior: "smooth",

            block: "center"

        });



        this.selectedRow = row;

    },



    /* ======================================================
       CLEAR SELECTION
       (la fila iluminada, no las casillas de cotización)
    ====================================================== */

    clearSelection() {

        if (this.selectedRow) {

            this.selectedRow.classList.remove(

                "bom-selected"

            );

            this.selectedRow.style.removeProperty(

                "--bom-highlight-color"

            );

            this.selectedRow = null;

        }

    }

};