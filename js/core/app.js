/* ==========================================================
   SDTD WORKSPACE

   app.js

   Application Entry Point

   Creates the global application state and
   starts the Engine.

========================================================== */

/* ==========================================================
   GLOBAL STATE
========================================================== */

const SDTD = {

    /* ------------------------------
       Configuration
    ------------------------------ */

    config: null,

    client: null,

    project: null,

    /* ------------------------------
       Project Data
    ------------------------------ */

    components: [],

    documents: [],

    /* ------------------------------
       Workspace State
    ------------------------------ */

    workspace: {

        currentView: null,

        selectedComponent: null

    },

    /* ------------------------------
       Future Modules
    ------------------------------ */

    settings: {}

};

/* ==========================================================
   APPLICATION START
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        Engine.initialize();

    }

);