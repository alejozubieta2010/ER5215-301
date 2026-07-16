/* ==========================================================
   SDTD ENGINE
   VIEWER MODULE
   Version : 1.1.0
   File    : viewer.js

   SVG Viewer Manager
========================================================== */

const Viewer = {

    /* ======================================================
       Properties
    ====================================================== */

    container: null,

    svgObject: null,

    /* ======================================================
       Initialize Viewer
    ====================================================== */

    initialize() {

        this.container = document.getElementById("workspace");

        if (!this.container) {

            console.error("Workspace not found.");

            return;

        }

        console.log("✔ Viewer Initialized");

    },

    /* ======================================================
       Load SVG
    ====================================================== */

    load() {

        if (!SDTD.project) {

            console.error("Project not loaded.");

            return;

        }

        if (!this.container) {

            console.error("Workspace not initialized.");

            return;

        }

        const svgPath = SDTD.project.resources.svg;

        this.container.innerHTML = `

            <object
                id="svgObject"
                data="${svgPath}"
                type="image/svg+xml">

            </object>

        `;

        this.svgObject = document.getElementById("svgObject");

        console.log("✔ SVG Loaded");

        console.log(svgPath);

    }

};