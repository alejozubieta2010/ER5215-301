/* ==========================================================
   SDTD ENGINE
   SVG Inspector
   Version : 1.0.0

   Developer Tool

   Inspects Composer SVG structure.

========================================================== */

export const SVGInspector = {

    /* ======================================================
       SETTINGS
    ====================================================== */

    enabled: true,



    /* ======================================================
       INSPECT HOTSPOT
    ====================================================== */

    inspect(hotspot) {

        if (!this.enabled) {

            return;

        }

        if (!hotspot) {

            console.warn("SVG Inspector: Hotspot not found.");

            return;

        }

        console.log("");

        console.log("========================================");

        console.log("SVG INSPECTOR");

        console.log("========================================");



        //--------------------------------------------------
        // GENERAL
        //--------------------------------------------------

        console.log("");

        console.log("GENERAL");

        console.log("----------------------------------------");

        console.log("Tag       :", hotspot.tagName);

        console.log("ID        :", hotspot.id);

        console.log("Component :", hotspot.dataset.component);



        //--------------------------------------------------
        // ATTRIBUTES
        //--------------------------------------------------

        console.log("");

        console.log("ATTRIBUTES");

        console.log("----------------------------------------");

        this.inspectAttributes(hotspot);



        //--------------------------------------------------
        // PARENT
        //--------------------------------------------------

        console.log("");

        console.log("PARENT");

        console.log("----------------------------------------");

        this.inspectParent(hotspot);



        //--------------------------------------------------
        // CHILDREN
        //--------------------------------------------------

        console.log("");

        console.log("CHILDREN");

        console.log("----------------------------------------");

        this.inspectChildren(hotspot);



        //--------------------------------------------------
        // SIBLINGS
        //--------------------------------------------------

        console.log("");

        console.log("SIBLINGS");

        console.log("----------------------------------------");

        this.inspectSiblings(hotspot);



        //--------------------------------------------------
        // NEARBY ELEMENTS
        //--------------------------------------------------

        console.log("");

        console.log("NEARBY ELEMENTS");

        console.log("----------------------------------------");

        this.inspectNearby(hotspot);



        //--------------------------------------------------
        // PATH INFORMATION
        //--------------------------------------------------

        console.log("");

        console.log("PATH");

        console.log("----------------------------------------");

        this.inspectPath(hotspot);



        console.log("");

        console.log("========================================");

        console.log("");

    },



    /* ======================================================
       ATTRIBUTES
    ====================================================== */

    inspectAttributes(element) {

        if (!element.attributes.length) {

            console.log("No attributes");

            return;

        }

        [...element.attributes].forEach(attribute => {

            console.log(

                attribute.name,

                "=",

                attribute.value

            );

        });

    },



    /* ======================================================
       PARENT
    ====================================================== */

    inspectParent(element) {

        if (!element.parentElement) {

            console.log("None");

            return;

        }

        console.log(

            element.parentElement.tagName,

            element.parentElement.id || "(no id)"

        );

    },



    /* ======================================================
       CHILDREN
    ====================================================== */

    inspectChildren(element) {

        console.log(

            "Children:",

            element.children.length

        );

        [...element.children].forEach(child => {

            console.log(

                child.tagName,

                child.id || "(no id)"

            );

        });

    },



    /* ======================================================
       SIBLINGS
    ====================================================== */

    inspectSiblings(element) {

        const previous = element.previousElementSibling;

        const next = element.nextElementSibling;

        console.log(

            "Previous:",

            previous

                ? previous.id || previous.tagName

                : "None"

        );

        console.log(

            "Next:",

            next

                ? next.id || next.tagName

                : "None"

        );

    },



    /* ======================================================
       NEARBY ELEMENTS
    ====================================================== */

    inspectNearby(element) {

        const parent = element.parentElement;

        if (!parent) {

            return;

        }

        const paths = parent.querySelectorAll("path");

        const texts = parent.querySelectorAll("text");

        const lines = parent.querySelectorAll("line");

        const circles = parent.querySelectorAll("circle");

        const groups = parent.querySelectorAll("g");

        console.log("Groups  :", groups.length);

        console.log("Paths   :", paths.length);

        console.log("Texts   :", texts.length);

        console.log("Lines   :", lines.length);

        console.log("Circles :", circles.length);

    },



    /* ======================================================
       PATH INFORMATION
    ====================================================== */

    inspectPath(hotspot) {

        const path = hotspot.querySelector("path");

        if (!path) {

            console.log("No path found.");

            return;

        }

        console.log("Fill      :", path.style.fill);

        console.log("Stroke    :", path.style.stroke);

        console.log("Opacity   :", path.style.opacity);

        console.log("Style     :", path.getAttribute("style"));

        console.log("Class     :", path.getAttribute("class"));

    },



    /* ======================================================
       EXPORT REPORT
    ====================================================== */

    exportReport(hotspot) {

        if (!hotspot) {

            return null;

        }

        return {

            id: hotspot.id,

            component: hotspot.dataset.component,

            tag: hotspot.tagName,

            parent: hotspot.parentElement

                ? hotspot.parentElement.id

                : null,

            children: hotspot.children.length

        };

    }

};