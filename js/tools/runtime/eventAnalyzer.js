/* ==========================================================
   SDTD ENGINE

   Event Analyzer (RUNTIME)

   Observes Composer interactions in real time

   Version : 1.0.0

========================================================== */

const EventAnalyzer = {

    /* ======================================================
       STATE
    ====================================================== */

    enabled: true,

    events: [],

    svgDocument: null,



    /* ======================================================
       INITIALIZE
    ====================================================== */

    initialize(svgDocument) {

        if (!svgDocument) {

            console.warn("EventAnalyzer: SVG not available.");

            return;

        }

        this.svgDocument = svgDocument;

        this.bindEvents();

        console.log("");

        console.log("========================================");

        console.log("EVENT ANALYZER (RUNTIME)");

        console.log("========================================");

        console.log("✔ Listening for Composer interactions");

    },



    /* ======================================================
       BIND EVENTS
    ====================================================== */

    bindEvents() {

        if (!this.svgDocument) return;



        const hotspots =

            this.svgDocument.querySelectorAll(

                "g[id^='hotspot.']"

            );



        hotspots.forEach(hotspot => {

            hotspot.addEventListener(

                "click",

                (event) => this.capture(event, "click")

            );



            hotspot.addEventListener(

                "mouseover",

                (event) => this.capture(event, "mouseover")

            );



            hotspot.addEventListener(

                "mousemove",

                (event) => this.capture(event, "mousemove")

            );



            hotspot.addEventListener(

                "mousedown",

                (event) => this.capture(event, "mousedown")

            );

        });

    },



    /* ======================================================
       CAPTURE EVENT
    ====================================================== */

    capture(event, type) {

        if (!this.enabled) return;



        const hotspot = event.currentTarget;



        const record = {

            type,

            timestamp: performance.now(),

            hotspot: hotspot.id || "(no id)",

            component: hotspot.dataset.component || "(no component)",

            mouse: {

                x: event.clientX,

                y: event.clientY

            },

            target: event.target.tagName

        };



        this.events.push(record);



        this.print(record);

    },



    /* ======================================================
       PRINT EVENT
    ====================================================== */

    print(event) {

        console.log("");

        console.log("========================================");

        console.log("EVENT");

        console.log("========================================");



        console.log("Type       :", event.type);

        console.log("Hotspot    :", event.hotspot);

        console.log("Component  :", event.component);

        console.log("Mouse X    :", event.mouse.x);

        console.log("Mouse Y    :", event.mouse.y);

        console.log("Target     :", event.target);

        console.log("Time       :", event.timestamp.toFixed(2));

    },



    /* ======================================================
       GET EVENTS
    ====================================================== */

    getEvents() {

        return this.events;

    },



    /* ======================================================
       CLEAR EVENTS
    ====================================================== */

    clear() {

        this.events = [];

        console.log("EventAnalyzer: events cleared");

    }

};