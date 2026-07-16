/* ==========================================================
   SDTD ENGINE

   Path Analyzer

   Reverse Engineering Tool

   Version : 1.0.0

========================================================== */

const PathAnalyzer = {

    /* ======================================================
       RUN
    ====================================================== */

    run(svgDocument) {

        if (!svgDocument) {

            console.warn("PathAnalyzer: SVG not available.");

            return null;

        }

        console.log("");

        console.log("========================================");

        console.log("PATH ANALYZER");

        console.log("========================================");



        //--------------------------------------------------
        // GLOBAL PATHS
        //--------------------------------------------------

        const paths = [

            ...svgDocument.querySelectorAll("path")

        ];



        console.log("");

        console.log("Total Paths :", paths.length);



        //--------------------------------------------------
        // HOTSPOTS
        //--------------------------------------------------

        const hotspots = [

            ...svgDocument.querySelectorAll("g[id^='hotspot.']")

        ];



        const relationships = [];



        hotspots.forEach(hotspot => {

            const component =

                hotspot.dataset.component || "";



            const hotspotPaths = [

                ...hotspot.querySelectorAll("path")

            ];



            console.log("");

            console.log("----------------------------------------");

            console.log(hotspot.id);

            console.log("----------------------------------------");



            console.log(

                "Component :",

                component

            );



            console.log(

                "Paths :", hotspotPaths.length

            );



            hotspotPaths.forEach((path,index)=>{

                const fill =

                    path.style.fill ||

                    path.getAttribute("fill") ||

                    "(none)";



                const stroke =

                    path.style.stroke ||

                    path.getAttribute("stroke") ||

                    "(none)";



                const opacity =

                    path.style.opacity ||

                    path.getAttribute("opacity") ||

                    "(none)";



                const style =

                    path.getAttribute("style") ||

                    "(none)";



                const cls =

                    path.getAttribute("class") ||

                    "(none)";



                console.log("");

                console.log(

                    "Path",

                    index + 1

                );



                console.log(

                    "Fill     :",

                    fill

                );



                console.log(

                    "Stroke   :",

                    stroke

                );



                console.log(

                    "Opacity  :",

                    opacity

                );



                console.log(

                    "Class    :",

                    cls

                );



                console.log(

                    "Style    :",

                    style

                );



                relationships.push({

                    hotspot: hotspot.id,

                    component,

                    fill,

                    stroke,

                    opacity,

                    className: cls,

                    style

                });



            });

        });



        //--------------------------------------------------
        // GLOBAL COLORS
        //--------------------------------------------------

        const fills = new Set();



        paths.forEach(path=>{

            const fill =

                path.style.fill ||

                path.getAttribute("fill");



            if(fill){

                fills.add(fill);

            }

        });



        console.log("");

        console.log("----------------------------------------");

        console.log("GLOBAL COLORS");

        console.log("----------------------------------------");



        [...fills].forEach(color=>{

            console.log(color);

        });



        console.log("");

        console.log("Unique Colors :",fills.size);



        console.log("");

        console.log("========================================");

        console.log("");



        return{

            totalPaths:paths.length,

            hotspotRelationships:relationships,

            colors:[...fills]

        };



    }

};