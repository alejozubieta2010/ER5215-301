/* ==========================================================
   SDTD ENGINE
   SVG MODULE

   File : svg.js

   SVG Viewer Module

========================================================== */

import { SDTD } from '../../core/app.js';
import { ComposerAdapter } from './composerAdapter.js';
import { SVGPanZoom } from './svgPanZoom.js';

export const SVGModule = {

    /* ======================================================
       PROPERTIES
    ====================================================== */

    container: null,

    viewer: null,



    /* ======================================================
       INITIALIZE
    ====================================================== */

    initialize() {

        this.container = document.getElementById("viewer-container");

        console.log("SVG Module Initialized");

    },



    /* ======================================================
       LOAD SVG
    ====================================================== */

    load() {

        console.log("Loading SVG Viewer...");

        if (!this.container) {

            console.error("Viewer container not found.");

            return;

        }

        this.container.innerHTML = "";

        this.viewer = document.createElement("object");

        this.viewer.id = "svg-viewer";

        this.viewer.type = "image/svg+xml";

        this.viewer.data = SDTD.project.resources.svg;

        this.viewer.style.width = "100%";

        this.viewer.style.height = "100%";

        this.viewer.style.border = "none";

        this.viewer.addEventListener(

            "load",

            () => {

                console.log("✔ SVG Viewer Loaded");

                if (typeof ComposerAdapter !== "undefined") {

                    ComposerAdapter.initialize(this.viewer);

                }
                else {

                    console.warn("ComposerAdapter not found.");

                }

                // Initialize pan/zoom for touch & mouse
                SVGPanZoom.initialize(this.container, this.viewer);

            }

        );

        this.container.appendChild(this.viewer);

    },



    /* ======================================================
       GET SVG DOCUMENT
    ====================================================== */

    getDocument() {

        if (!this.viewer) {

            return null;

        }

        return this.viewer.contentDocument;

    },



    /* ======================================================
       GET SVG OBJECT
    ====================================================== */

    getViewer() {

        return this.viewer;

    }

};