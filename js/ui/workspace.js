/* ==========================================================
   SDTD WORKSPACE
   workspace.js

   Workspace Manager

   Controls the central visualization area.

   SVG
   3D
   PDF

========================================================== */

const Workspace = {

    /* ======================================================
       PROPERTIES
    ====================================================== */

    container: null,



    /* ======================================================
       INITIALIZE
    ====================================================== */

    initialize() {

        this.container = document.getElementById("viewer-container");

        if (!this.container) {

            console.error("Workspace container not found.");

            return;

        }

        console.log("✔ Workspace Initialized");

    },



    /* ======================================================
       LOAD DEFAULT VIEW
    ====================================================== */

    loadDefaultView() {

        if (!SDTD.project) {

            console.error("Project not loaded.");

            return;

        }

        const modules = SDTD.project.modules;

        if (modules.svg) {

            this.showSVG();

            return;

        }

        if (modules.model3d) {

            this.showModel3D();

            return;

        }

        if (modules.documents) {

            this.showPDF();

            return;

        }

        console.warn("No visualization module enabled.");

    },



    /* ======================================================
       GENERIC VIEW LOADER
    ====================================================== */

    loadView(module, viewName) {

        this.clear();

        SDTD.workspace.currentView = viewName;

        module.load();

        console.log("✔ Workspace → " + viewName);

    },



    /* ======================================================
       SVG VIEW
    ====================================================== */

    showSVG() {

        this.loadView(

            SVGModule,

            "svg"

        );

    },



    /* ======================================================
       3D VIEW
    ====================================================== */

    showModel3D() {

        this.loadView(

            Model3DModule,

            "model3d"

        );

    },



    /* ======================================================
       PDF VIEW
    ====================================================== */

    showPDF() {

        this.loadView(

            DocumentsModule,

            "pdf"

        );

    },



    /* ======================================================
       REFRESH CURRENT VIEW
    ====================================================== */

    refresh() {

        switch (SDTD.workspace.currentView) {

            case "svg":

                this.showSVG();

                break;

            case "model3d":

                this.showModel3D();

                break;

            case "pdf":

                this.showPDF();

                break;

            default:

                console.warn("No active workspace view.");

        }

    },



    /* ======================================================
       CLEAR VIEWER
    ====================================================== */

    clear() {

        if (!this.container) {

            return;

        }

        this.container.innerHTML = "";

    },



    /* ======================================================
       CURRENT VIEW
    ====================================================== */

    getCurrentView() {

        return SDTD.workspace.currentView;

    }

};