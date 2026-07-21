/* ==========================================================
   SDTD WORKSPACE
   workspace.js

   Workspace Manager

   Controls the central visualization area.

   SVG
   3D
   PDF

========================================================== */

import { SDTD } from '../core/app.js';
import { SVGModule } from '../modules/svg/svg.js';
import { Model3DModule } from '../modules/model3d/model3d.js';
import { DocumentsModule } from '../modules/documents/documents.js';

export const Workspace = {

    container: null,

    container3d: null,

    toggleBtn: null,



    initialize() {

        this.container = document.getElementById("viewer-container");

        this.container3d = document.getElementById("viewer-3d-container");

        this.createToggleButton();

        console.log("✔ Workspace Initialized");

    },



    createToggleButton() {

        this.toggleBtn = document.createElement("button");

        this.toggleBtn.id = "view-toggle";

        this.toggleBtn.setAttribute("data-view", "svg");

        this.toggleBtn.textContent = "3D";

        this.toggleBtn.className = "view-toggle-btn";

        this.toggleBtn.addEventListener("click", () => this.toggle());

        this.container.appendChild(this.toggleBtn);

    },



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



    toggle() {

        if (SDTD.workspace.currentView === "svg") {

            this.showModel3D();

        } else {

            this.showSVG();

        }

    },



    showSVG() {

        if (this.container) {

            this.container.style.display = "block";

        }

        if (this.container3d) {

            this.container3d.style.display = "none";

        }

        if (this.toggleBtn) {

            this.toggleBtn.setAttribute("data-view", "svg");

            this.toggleBtn.textContent = "3D";

        }

        SDTD.workspace.currentView = "svg";

        this.container.innerHTML = "";

        SVGModule.load();

        if (this.toggleBtn) {

            this.container.appendChild(this.toggleBtn);

        }

        console.log("✔ Workspace → SVG");

    },



    showModel3D() {

        if (this.container) {

            this.container.style.display = "none";

        }

        if (this.container3d) {

            this.container3d.style.display = "block";

        }

        if (this.toggleBtn) {

            this.toggleBtn.setAttribute("data-view", "3d");

            this.toggleBtn.textContent = "2D";

        }

        SDTD.workspace.currentView = "3d";

        Model3DModule.load().then(() => {

            if (this.toggleBtn) {

                this.container3d.appendChild(this.toggleBtn);

            }

        });

        console.log("✔ Workspace → 3D");

    },



    showPDF() {

        SDTD.workspace.currentView = "pdf";

        DocumentsModule.load();

        console.log("✔ Workspace → PDF");

    },



    refresh() {

        switch (SDTD.workspace.currentView) {

            case "svg":

                this.showSVG();

                break;

            case "3d":

                this.showModel3D();

                break;

            case "pdf":

                this.showPDF();

                break;

            default:

                console.warn("No active workspace view.");

        }

    },



    clear() {

        if (this.container) {

            this.container.innerHTML = "";

        }

    },



    getCurrentView() {

        return SDTD.workspace.currentView;

    }

};
