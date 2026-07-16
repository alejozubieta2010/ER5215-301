/* ==========================================================
   SDTD UI

   Selection Manager

   Central component selection manager.

   Version : 3.1.0

========================================================== */

const SelectionManager = {

    /* ======================================================
       PROPERTIES
    ====================================================== */

    selectedComponent: null,

    _escBound: false,

    _escHandler: null,



    /* ======================================================
       INITIALIZE
    ====================================================== */

    initialize() {

        this.bindEscKey();

        console.log(

            "✔ Selection Manager Initialized"

        );

    },



    /* ======================================================
       BIND ESC KEY
       Escucha ESC globalmente para limpiar la selección.
       Protegido contra doble binding: si initialize() se
       llama más de una vez (por ejemplo al recargar módulos
       o al alternar 2D/3D en el futuro), el listener anterior
       se remueve antes de agregar uno nuevo.
    ====================================================== */

    bindEscKey() {

        if (this._escBound && this._escHandler) {

            document.removeEventListener(

                "keydown",

                this._escHandler

            );

            this._escBound = false;

        }

        this._escHandler = (event) => {

            if (event.key !== "Escape") {

                return;

            }

            if (!this.hasSelection()) {

                return;

            }

            this.clear();

        };

        document.addEventListener(

            "keydown",

            this._escHandler

        );

        this._escBound = true;

    },



    /* ======================================================
       SELECT
    ====================================================== */

    select(componentID) {

        if (!componentID) {

            return;

        }

        //--------------------------------------------------
        // Component exists?
        //--------------------------------------------------

        if (

            !ComponentManager.exists(componentID)

        ) {

            console.warn(

                "Selection Manager:",

                "Unknown component",

                componentID

            );

            return;

        }

        //--------------------------------------------------
        // Save Selection
        //--------------------------------------------------

        this.selectedComponent = componentID;

        //--------------------------------------------------
        // Console
        //--------------------------------------------------

        console.log("------------------------------------");

        console.log("Selected Component:");

        console.log(componentID);

        console.log("------------------------------------");

        //--------------------------------------------------
        // Navigation
        //--------------------------------------------------

        NavigationService.navigate(

            componentID

        );

        //--------------------------------------------------
        // Highlight
        //--------------------------------------------------

        HighlightService.highlight(

            componentID

        );

        //--------------------------------------------------
        // Synchronization
        //--------------------------------------------------

        SynchronizationService.synchronize(

            componentID

        );

        //--------------------------------------------------
        // History
        //--------------------------------------------------

        HistoryService.add(

            componentID

        );

    },



    /* ======================================================
       CLEAR
    ====================================================== */

    clear() {

        this.selectedComponent = null;

        HighlightService.clear();

        NavigationService.clear();

        HistoryService.clear();

    },



    /* ======================================================
       CURRENT
    ====================================================== */

    current() {

        return this.selectedComponent;

    },



    /* ======================================================
       HAS SELECTION
    ====================================================== */

    hasSelection() {

        return this.selectedComponent !== null;

    }

};