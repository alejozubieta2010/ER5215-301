/* ==========================================================
   SDTD SERVICES

   Synchronization Service

   Keeps every viewer synchronized.

   Version : 1.0.0

========================================================== */

const SynchronizationService = {

    /* ======================================================
       PROPERTIES
    ====================================================== */

    currentComponent: null,

    state: {

        svg: false,

        bom: false,

        panel: false,

        pdf: false,

        model3d: false

    },



    /* ======================================================
       INITIALIZE
    ====================================================== */

    initialize() {

        console.log(

            "✔ Synchronization Service Ready"

        );

    },



    /* ======================================================
       SYNCHRONIZE
    ====================================================== */

    synchronize(componentID) {

        if (!componentID) {

            return;

        }

        this.currentComponent = componentID;

        this.reset();

        //--------------------------------------------------
        // SVG
        //--------------------------------------------------

        this.state.svg = true;

        //--------------------------------------------------
        // BOM
        //--------------------------------------------------

        this.state.bom = true;

        //--------------------------------------------------
        // PANEL
        //--------------------------------------------------

        this.state.panel = true;

        //--------------------------------------------------
        // Future modules
        //--------------------------------------------------

        /*
        this.state.pdf = true;

        this.state.model3d = true;
        */

        this.report();

    },



    /* ======================================================
       RESET
    ====================================================== */

    reset() {

        Object.keys(this.state).forEach(key => {

            this.state[key] = false;

        });

    },



    /* ======================================================
       REPORT
    ====================================================== */

    report() {

        console.groupCollapsed(

            "Synchronization"

        );

        console.log(

            "Component:",

            this.currentComponent

        );

        console.table(

            this.state

        );

        console.groupEnd();

    },



    /* ======================================================
       GET CURRENT COMPONENT
    ====================================================== */

    getCurrentComponent() {

        return this.currentComponent;

    },



    /* ======================================================
       IS SYNCHRONIZED
    ====================================================== */

    isSynchronized() {

        return Object.values(

            this.state

        ).every(value => value === true);

    },



    /* ======================================================
       GET STATE
    ====================================================== */

    getState() {

        return {

            ...this.state

        };

    }

};