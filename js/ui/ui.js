/* ==========================================================
   SDTD ENGINE
   UI MODULE

   File : ui.js

   User Interface Manager

========================================================== */

const UI = {

    /* ======================================================
       UI ELEMENTS
    ====================================================== */

    elements: {},

    /* ======================================================
       INITIALIZE
    ====================================================== */

    initialize() {

        this.elements = {

            clientLogo: document.getElementById("client-logo"),

            clientName: document.getElementById("client-name"),

            projectTitle: document.getElementById("project-title"),

            projectCode: document.getElementById("project-code")

        };

        console.log("✔ UI Initialized");

    },

    /* ======================================================
       BUILD HEADER
    ====================================================== */

    buildHeader() {

        if (!SDTD.client || !SDTD.project) {

            console.error("Project data not available.");

            return;

        }

        /* ==============================================
           CLIENT LOGO
        ============================================== */

        if (this.elements.clientLogo) {

            this.elements.clientLogo.src = SDTD.client.logo;

        }

        /* ==============================================
           CLIENT NAME
        ============================================== */

        if (this.elements.clientName) {

            this.elements.clientName.textContent =
                SDTD.client.name;

        }

        /* ==============================================
           PROJECT TITLE
        ============================================== */

        if (this.elements.projectTitle) {

            this.elements.projectTitle.textContent =
                SDTD.project.project.title;

        }

        /* ==============================================
           PROJECT CODE
        ============================================== */

        if (this.elements.projectCode) {

            this.elements.projectCode.textContent =
                SDTD.project.project.code;

        }

        console.log("✔ Header Updated");

    }

};