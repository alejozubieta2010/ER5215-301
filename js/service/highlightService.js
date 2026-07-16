/* ==========================================================
   SDTD SERVICES

   Highlight Service

   Controls every visual highlight in SDTD.

   Version : 1.0.0

========================================================== */

const HighlightService = {

    /* ======================================================
       SETTINGS
    ====================================================== */

    color: "#00ff00",

    activeComponent: null,



    /* ======================================================
       INITIALIZE
    ====================================================== */

    initialize() {

        console.log(

            "✔ Highlight Service Ready"

        );

    },



    /* ======================================================
       SET COLOR
    ====================================================== */

    setColor(color) {

        this.color = color;

    },



    /* ======================================================
       GET COLOR
    ====================================================== */

    getColor() {

        return this.color;

    },



    /* ======================================================
       HIGHLIGHT
    ====================================================== */

    highlight(componentID) {

        if (!componentID) {

            return;

        }

        //--------------------------------------------------
        // Save Active Component
        //--------------------------------------------------

        this.activeComponent = componentID;

        //--------------------------------------------------
        // SVG
        //--------------------------------------------------

        if (

            typeof ComposerAdapter !== "undefined"

        ) {

            ComposerAdapter.highlightComponent(

                componentID

            );

        }

        //--------------------------------------------------
        // BOM
        //--------------------------------------------------

        if (

            typeof BOM !== "undefined"

        ) {

            BOM.highlight(

                componentID

            );

        }

        //--------------------------------------------------
        // Future Modules
        //--------------------------------------------------

        /*
            PDFViewer.highlight(componentID);

            Model3D.highlight(componentID);

            ARViewer.highlight(componentID);
        */

    },



    /* ======================================================
       CLEAR
    ====================================================== */

    clear() {

        this.activeComponent = null;

        if (

            typeof ComposerAdapter !== "undefined"

        ) {

            ComposerAdapter.clearHighlight();

        }

        if (

            typeof BOM !== "undefined"

        ) {

            BOM.clearSelection?.();

        }

    },



    /* ======================================================
       ACTIVE COMPONENT
    ====================================================== */

    getActiveComponent() {

        return this.activeComponent;

    }

};