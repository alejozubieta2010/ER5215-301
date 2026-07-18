/* ==========================================================
   SDTD SERVICES

   History Service

   Navigation history for SDTD.

   Version : 1.0.0

========================================================== */

export const HistoryService = {

    /* ======================================================
       PROPERTIES
    ====================================================== */

    history: [],

    currentIndex: -1,

    maxItems: 100,



    /* ======================================================
       INITIALIZE
    ====================================================== */

    initialize() {

        console.log(

            "✔ History Service Ready"

        );

    },



    /* ======================================================
       ADD
    ====================================================== */

    add(componentID) {

        if (!componentID) {

            return;

        }

        //--------------------------------------------------
        // Ignore duplicated consecutive selections
        //--------------------------------------------------

        if (

            this.current() === componentID

        ) {

            return;

        }

        //--------------------------------------------------
        // Remove future history
        //--------------------------------------------------

        if (

            this.currentIndex < this.history.length - 1

        ) {

            this.history = this.history.slice(

                0,

                this.currentIndex + 1

            );

        }

        //--------------------------------------------------
        // Add component
        //--------------------------------------------------

        this.history.push(

            componentID

        );

        //--------------------------------------------------
        // Limit size
        //--------------------------------------------------

        if (

            this.history.length > this.maxItems

        ) {

            this.history.shift();

        }

        //--------------------------------------------------
        // Update index
        //--------------------------------------------------

        this.currentIndex =

            this.history.length - 1;

    },



    /* ======================================================
       BACK
    ====================================================== */

    back() {

        if (

            this.currentIndex <= 0

        ) {

            return null;

        }

        this.currentIndex--;

        return this.history[

            this.currentIndex

        ];

    },



    /* ======================================================
       FORWARD
    ====================================================== */

    forward() {

        if (

            this.currentIndex >=

            this.history.length - 1

        ) {

            return null;

        }

        this.currentIndex++;

        return this.history[

            this.currentIndex

        ];

    },



    /* ======================================================
       CURRENT
    ====================================================== */

    current() {

        if (

            this.currentIndex < 0

        ) {

            return null;

        }

        return this.history[

            this.currentIndex

        ];

    },



    /* ======================================================
       PREVIOUS
    ====================================================== */

    previous() {

        if (

            this.currentIndex <= 0

        ) {

            return null;

        }

        return this.history[

            this.currentIndex - 1

        ];

    },



    /* ======================================================
       NEXT
    ====================================================== */

    next() {

        if (

            this.currentIndex >=

            this.history.length - 1

        ) {

            return null;

        }

        return this.history[

            this.currentIndex + 1

        ];

    },



    /* ======================================================
       CLEAR
    ====================================================== */

    clear() {

        this.history = [];

        this.currentIndex = -1;

    },



    /* ======================================================
       COUNT
    ====================================================== */

    count() {

        return this.history.length;

    },



    /* ======================================================
       GET HISTORY
    ====================================================== */

    getHistory() {

        return [

            ...this.history

        ];

    },



    /* ======================================================
       REPORT
    ====================================================== */

    report() {

        console.groupCollapsed(

            "History"

        );

        console.table(

            this.history.map(

                (component, index) => ({

                    index,

                    component,

                    current:

                        index === this.currentIndex

                })

            )

        );

        console.groupEnd();

    }

};