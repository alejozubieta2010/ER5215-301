/* ==========================================================
   SDTD ENGINE

   Text Analyzer

   Reverse Engineering Tool

   Version : 1.0.0

========================================================== */

const TextAnalyzer = {

    /* ======================================================
       RUN
    ====================================================== */

    run(svgDocument) {

        if (!svgDocument) {

            console.warn("TextAnalyzer: SVG not available.");

            return null;

        }

        console.log("");

        console.log("========================================");

        console.log("TEXT ANALYZER");

        console.log("========================================");



        //--------------------------------------------------
        // FIND TEXTS
        //--------------------------------------------------

        const texts = [

            ...svgDocument.querySelectorAll("text")

        ];



        console.log("");

        console.log("Total Text Elements :", texts.length);



        const balloons = [];

        const numericTexts = [];

        const emptyTexts = [];

        const labels = [];



        texts.forEach(text => {

            const value = text.textContent.trim();



            //--------------------------------------------------
            // EMPTY
            //--------------------------------------------------

            if (value === "") {

                emptyTexts.push(text);

                return;

            }



            //--------------------------------------------------
            // NUMERIC
            //--------------------------------------------------

            if (/^\d+$/.test(value)) {

                numericTexts.push(text);



                balloons.push({

                    value: value,

                    id: text.id || "(no id)",

                    parent:

                        text.parentElement

                            ? text.parentElement.id || "(no id)"

                            : "(none)",

                    x: text.getAttribute("x"),

                    y: text.getAttribute("y")

                });



                return;

            }



            //--------------------------------------------------
            // LABELS
            //--------------------------------------------------

            labels.push({

                value: value,

                id: text.id || "(no id)",

                parent:

                    text.parentElement

                        ? text.parentElement.id || "(no id)"

                        : "(none)"

            });

        });



        //--------------------------------------------------
        // SUMMARY
        //--------------------------------------------------

        console.log("");

        console.log("----------------------------------------");

        console.log("SUMMARY");

        console.log("----------------------------------------");



        console.log("Numeric :", numericTexts.length);

        console.log("Labels  :", labels.length);

        console.log("Empty   :", emptyTexts.length);



        //--------------------------------------------------
        // FIRST BALLOONS
        //--------------------------------------------------

        console.log("");

        console.log("----------------------------------------");

        console.log("FIRST NUMERIC TEXTS");

        console.log("----------------------------------------");



        balloons.slice(0,20).forEach(balloon => {

            console.log(

                balloon.value,

                "| Parent:",

                balloon.parent

            );

        });



        //--------------------------------------------------
        // FIRST LABELS
        //--------------------------------------------------

        console.log("");

        console.log("----------------------------------------");

        console.log("FIRST LABELS");

        console.log("----------------------------------------");



        labels.slice(0,20).forEach(label => {

            console.log(

                label.value,

                "| Parent:",

                label.parent

            );

        });



        console.log("");

        console.log("========================================");

        console.log("");



        return {

            totalTexts: texts.length,

            numericTexts,

            labels,

            emptyTexts,

            balloons

        };

    }

};