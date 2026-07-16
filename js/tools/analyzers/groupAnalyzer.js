/* ==========================================================
   SDTD ENGINE

   Composer Analyzer

   Reverse Engineering Laboratory

   Version : 2.0.0

========================================================== */

const ComposerAnalyzer = {

    /* ======================================================
       PROPERTIES
    ====================================================== */

    svgDocument: null,

    report: {},



    /* ======================================================
       INITIALIZE
    ====================================================== */

    initialize(svgDocument) {

        if (!svgDocument) {

            console.error("ComposerAnalyzer: SVG not available.");

            return;

        }

        this.svgDocument = svgDocument;

        console.log("");

        console.log("========================================");

        console.log(" COMPOSER ANALYZER");

        console.log(" Reverse Engineering Laboratory");

        console.log("========================================");

    },



    /* ======================================================
       RUN
    ====================================================== */

    run() {

        if (!this.svgDocument) {

            console.error("ComposerAnalyzer: SVG not initialized.");

            return;

        }

        console.log("");

        console.log("Running Reverse Engineering...");

        console.log("");



        this.report = {};



        //--------------------------------------------------
        // GROUP ANALYZER
        //--------------------------------------------------

        if (typeof GroupAnalyzer !== "undefined") {

            this.report.groups =

                GroupAnalyzer.run(this.svgDocument);

        }

        else {

            console.warn("GroupAnalyzer not found.");

        }



        //--------------------------------------------------
        // SCRIPT ANALYZER
        //--------------------------------------------------

        if (typeof ScriptAnalyzer !== "undefined") {

            this.report.scripts =

                ScriptAnalyzer.run(this.svgDocument);

        }



        //--------------------------------------------------
        // TEXT ANALYZER
        //--------------------------------------------------

        if (typeof TextAnalyzer !== "undefined") {

            this.report.texts =

                TextAnalyzer.run(this.svgDocument);

        }



        //--------------------------------------------------
        // PATH ANALYZER
        //--------------------------------------------------

        if (typeof PathAnalyzer !== "undefined") {

            this.report.paths =

                PathAnalyzer.run(this.svgDocument);

        }



        //--------------------------------------------------
        // IMAGE ANALYZER
        //--------------------------------------------------

        if (typeof ImageAnalyzer !== "undefined") {

            this.report.images =

                ImageAnalyzer.run(this.svgDocument);

        }



        //--------------------------------------------------
        // DEFS ANALYZER
        //--------------------------------------------------

        if (typeof DefsAnalyzer !== "undefined") {

            this.report.defs =

                DefsAnalyzer.run(this.svgDocument);

        }



        //--------------------------------------------------
        // EVENT ANALYZER
        //--------------------------------------------------

        if (typeof EventAnalyzer !== "undefined") {

            this.report.events =

                EventAnalyzer.run(this.svgDocument);

        }



        //--------------------------------------------------
        // STYLE ANALYZER
        //--------------------------------------------------

        if (typeof StyleAnalyzer !== "undefined") {

            this.report.styles =

                StyleAnalyzer.run(this.svgDocument);

        }



        console.log("");

        console.log("========================================");

        console.log(" REVERSE ENGINEERING COMPLETE");

        console.log("========================================");

        console.log("");



        return this.report;

    },



    /* ======================================================
       GET REPORT
    ====================================================== */

    getReport() {

        return this.report;

    }

};