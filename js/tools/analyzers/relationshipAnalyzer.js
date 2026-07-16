/* ==========================================================
   SDTD ENGINE

   Relationship Analyzer

   Reverse Engineering Tool

   Version : 1.0.0

========================================================== */

const RelationshipAnalyzer = {

    /* ======================================================
       RUN
    ====================================================== */

    run(svgDocument) {

        if (!svgDocument) {

            console.warn("RelationshipAnalyzer: SVG not available.");

            return null;

        }

        console.log("");

        console.log("========================================");

        console.log("RELATIONSHIP ANALYZER");

        console.log("========================================");



        //--------------------------------------------------
        // HOTSPOTS
        //--------------------------------------------------

        const hotspots = [

            ...svgDocument.querySelectorAll("g[id^='hotspot.']")

        ];



        console.log("");

        console.log("Hotspots Found :", hotspots.length);



        const relationships = [];



        hotspots.forEach(hotspot => {

            const component = hotspot.dataset.component || "";



            //--------------------------------------------------
            // Bounding Box
            //--------------------------------------------------

            let bbox = null;

            let center = null;



            try {

                bbox = hotspot.getBBox();

                center = {

                    x: bbox.x + bbox.width / 2,

                    y: bbox.y + bbox.height / 2

                };

            }

            catch (error) {

                bbox = null;

            }



            //--------------------------------------------------
            // Parent
            //--------------------------------------------------

            const parent = hotspot.parentElement;



            //--------------------------------------------------
            // Children
            //--------------------------------------------------

            const paths = hotspot.querySelectorAll("path");

            const texts = hotspot.querySelectorAll("text");

            const groups = hotspot.querySelectorAll("g");



            //--------------------------------------------------
            // Store
            //--------------------------------------------------

            relationships.push({

                hotspotID: hotspot.id,

                component,

                parent: parent

                    ? parent.id || "(no id)"

                    : "(none)",

                paths: paths.length,

                texts: texts.length,

                groups: groups.length,

                center,

                bbox

            });



            //--------------------------------------------------
            // Console
            //--------------------------------------------------

            console.log("");

            console.log("----------------------------------------");

            console.log(hotspot.id);

            console.log("----------------------------------------");



            console.log("Component :", component);

            console.log("Parent    :", parent

                ? parent.id || "(no id)"

                : "(none)");



            console.log("Paths     :", paths.length);

            console.log("Texts     :", texts.length);

            console.log("Groups    :", groups.length);



            if (bbox) {

                console.log(

                    "BBox      :",

                    bbox.x.toFixed(2),

                    bbox.y.toFixed(2),

                    bbox.width.toFixed(2),

                    bbox.height.toFixed(2)

                );



                console.log(

                    "Center    :",

                    center.x.toFixed(2),

                    center.y.toFixed(2)

                );

            }

            else {

                console.log("BBox      : unavailable");

            }

        });



        //--------------------------------------------------
        // SUMMARY
        //--------------------------------------------------

        console.log("");

        console.log("========================================");

        console.log("RELATIONSHIP SUMMARY");

        console.log("========================================");



        console.log(

            "Relationships :", relationships.length

        );



        console.log("");



        return {

            totalRelationships: relationships.length,

            relationships

        };

    }

};