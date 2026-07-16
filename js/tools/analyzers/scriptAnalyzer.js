/* ==========================================================
   SDTD ENGINE

   Script Analyzer

   Reverse Engineering Tool

   Version : 1.0.0

========================================================== */

const ScriptAnalyzer = {

    /* ======================================================
       RUN
    ====================================================== */

    run(svgDocument) {

        if (!svgDocument) {

            console.warn("ScriptAnalyzer: SVG not available.");

            return null;

        }

        console.log("");

        console.log("========================================");

        console.log("SCRIPT ANALYZER");

        console.log("========================================");



        //--------------------------------------------------
        // FIND ALL <script>
        //--------------------------------------------------

        const scripts = [

            ...svgDocument.querySelectorAll("script")

        ];



        console.log("");

        console.log("Scripts Found :", scripts.length);



        if (scripts.length === 0) {

            console.log("No embedded JavaScript.");

            console.log("");

            return {

                totalScripts: 0,

                functions: [],

                variables: [],

                scripts: []

            };

        }



        const allFunctions = [];

        const allVariables = [];



        //--------------------------------------------------
        // ANALYZE EACH SCRIPT
        //--------------------------------------------------

        scripts.forEach((script, index) => {

            console.log("");

            console.log("----------------------------------------");

            console.log("SCRIPT", index + 1);

            console.log("----------------------------------------");



            const code = script.textContent || "";



            console.log(

                "Characters :",

                code.length

            );



            //----------------------------------------------
            // FUNCTIONS
            //----------------------------------------------

            const functions = [

                ...code.matchAll(

                    /function\s+([a-zA-Z0-9_]+)/g

                )

            ];



            console.log(

                "Functions :",

                functions.length

            );



            functions.forEach(match => {

                console.log("   ", match[1]);

                allFunctions.push(match[1]);

            });



            //----------------------------------------------
            // VARIABLES
            //----------------------------------------------

            const variables = [

                ...code.matchAll(

                    /\bvar\s+([a-zA-Z0-9_]+)/g

                )

            ];



            console.log(

                "Variables :",

                variables.length

            );



            variables.forEach(match => {

                console.log("   ", match[1]);

                allVariables.push(match[1]);

            });

        });



        //--------------------------------------------------
        // SUMMARY
        //--------------------------------------------------

        console.log("");

        console.log("----------------------------------------");

        console.log("SUMMARY");

        console.log("----------------------------------------");



        console.log(

            "Total Functions :",

            allFunctions.length

        );



        console.log(

            "Total Variables :",

            allVariables.length

        );



        console.log("");

        console.log("========================================");

        console.log("");



        return {

            totalScripts: scripts.length,

            functions: allFunctions,

            variables: allVariables,

            scripts

        };

    }

};