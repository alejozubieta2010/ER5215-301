/* ==========================================================
   SDTD WORKSPACE

   app.js

   Application Entry Point

   Creates the global application state and
   starts the Engine.

========================================================== */

import { Engine } from './engine.js';

/* ==========================================================
   GLOBAL STATE
========================================================== */

export const SDTD = {

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