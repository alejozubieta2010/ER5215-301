/* ==========================================================
   SDTD ENGINE

   Actor Analyzer

   Reverse Engineering Tool

   Version : 1.0.0

========================================================== */

const ActorAnalyzer = {

    /* ======================================================
       RUN
    ====================================================== */

    run(svgDocument) {

        if (!svgDocument) {

            console.warn("ActorAnalyzer: SVG not available.");

            return null;

        }

        console.log("");

        console.log("========================================");

        console.log("ACTOR ANALYZER");

        console.log("========================================");



        const actors = [

            ...svgDocument.querySelectorAll("g[id^='Actor']")

        ];



        console.log("");

        console.log("Actors Found :", actors.length);



        const results = [];



        actors.forEach(actor => {

            const paths = actor.querySelectorAll("path");

            const groups = actor.querySelectorAll("g");

            const texts = actor.querySelectorAll("text");

            const images = actor.querySelectorAll("image");



            const transform =

                actor.getAttribute("transform");



            const style =

                actor.getAttribute("style");



            const opacity =

                actor.getAttribute("opacity");



            results.push({

                id: actor.id,

                paths: paths.length,

                groups: groups.length,

                texts: texts.length,

                images: images.length,

                transform,

                style,

                opacity

            });

        });



        console.log("");

        console.log("----------------------------------------");

        console.log("FIRST ACTORS");

        console.log("----------------------------------------");



        results.slice(0,20).forEach(actor=>{

            console.log("");

            console.log(actor.id);

            console.log("Paths      :",actor.paths);

            console.log("Groups     :",actor.groups);

            console.log("Texts      :",actor.texts);

            console.log("Images     :",actor.images);

            console.log("Transform  :",actor.transform);

            console.log("Opacity    :",actor.opacity);

        });



        console.log("");

        console.log("========================================");

        console.log("");



        return{

            totalActors:actors.length,

            actors:results

        };

    }

};