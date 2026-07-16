/* ==========================================================
   SDTD ENGINE

   Composer Analyzer

   Reverse Engineering Laboratory

   Version : 3.0.0

========================================================== */

const ComposerAnalyzer = {

    /* ======================================================
       PROPERTIES
    ====================================================== */

    svgDocument: null,

    report: {},

    analyzers: [],



    /* ======================================================
       INITIALIZE
    ====================================================== */

    initialize(svgDocument) {

        if (!svgDocument) {

            console.error("ComposerAnalyzer: SVG not available.");

            return;

        }

        this.svgDocument = svgDocument;

        this.registerAnalyzers();

        console.log("");

        console.log("========================================");

        console.log(" COMPOSER ANALYZER");

        console.log(" Reverse Engineering Laboratory");

        console.log("========================================");

    },



    /* ======================================================
       REGISTER ANALYZERS
    ====================================================== */

    registerAnalyzers() {

        this.analyzers = [];



        if (typeof GroupAnalyzer !== "undefined") {

            this.analyzers.push({

                name: "GroupAnalyzer",

                instance: GroupAnalyzer

            });

        }



        if (typeof ScriptAnalyzer !== "undefined") {

            this.analyzers.push({

                name: "ScriptAnalyzer",

                instance: ScriptAnalyzer

            });

        }



        if (typeof TextAnalyzer !== "undefined") {

            this.analyzers.push({

                name: "TextAnalyzer",

                instance: TextAnalyzer

            });

        }



        if (typeof RelationshipAnalyzer !== "undefined") {

            this.analyzers.push({

                name: "RelationshipAnalyzer",

                instance: RelationshipAnalyzer

            });

        }



        if (typeof PathAnalyzer !== "undefined") {

            this.analyzers.push({

                name: "PathAnalyzer",

                instance: PathAnalyzer

            });

        }

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



        ReportManager.initialize(

            SDTD.project.project.code

        );



        this.analyzers.forEach(analyzer => {

            try {

                const result =

                    analyzer.instance.run(

                        this.svgDocument

                    );



                ReportManager.save(

                    analyzer.name,

                    result

                );

            }

            catch (error) {

                console.error(

                    analyzer.name,

                    error

                );

            }

        });



        this.report =

            ReportManager.getReport();



        ReportManager.print();



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