/* ==========================================================
   SDTD CORE

   Component Manager

   Central access point for all project components.

   Version : 1.0.0

========================================================== */

const ComponentManager = {

    /* ======================================================
       PROPERTIES
    ====================================================== */

    components: new Map(),



    /* ======================================================
       INITIALIZE
    ====================================================== */

    initialize() {

        this.components.clear();

        SDTD.components.forEach(component => {

            this.components.set(

                component.id,

                component

            );

        });

        console.log(

            "✔ Component Manager Ready",

            "(" + this.components.size + " components)"

        );

    },



    /* ======================================================
       GET COMPONENT
    ====================================================== */

    get(id) {

        return this.components.get(id) || null;

    },



    /* ======================================================
       EXISTS
    ====================================================== */

    exists(id) {

        return this.components.has(id);

    },



    /* ======================================================
       GET ALL
    ====================================================== */

    getAll() {

        return Array.from(

            this.components.values()

        );

    },



    /* ======================================================
       FIND
    ====================================================== */

    find(predicate) {

        return this.getAll().filter(

            predicate

        );

    },



    /* ======================================================
       COUNT
    ====================================================== */

    count() {

        return this.components.size;

    }

};