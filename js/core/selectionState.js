/* ==========================================================
   SDTD CORE

   Selection State

   Central selection state of the application.

   Version : 1.0.0

========================================================== */

const SelectionState = {

    /* ======================================================
       PROPERTIES
    ====================================================== */

    hovered: null,

    selected: null,

    locked: false,



    /* ======================================================
       INITIALIZE
    ====================================================== */

    initialize() {

        console.log(

            "✔ Selection State Ready"

        );

    },



    /* ======================================================
       HOVER
    ====================================================== */

    hover(componentID) {

        if (

            this.locked &&

            this.selected !== componentID

        ) {

            return;

        }

        this.hovered = componentID;

    },



    /* ======================================================
       CLEAR HOVER
    ====================================================== */

    clearHover() {

        if (this.locked) {

            return;

        }

        this.hovered = null;

    },



    /* ======================================================
       SELECT
    ====================================================== */

    select(componentID) {

        this.selected = componentID;

        this.hovered = componentID;

        this.locked = true;

    },



    /* ======================================================
       CLEAR SELECTION
    ====================================================== */

    clearSelection() {

        this.selected = null;

        this.hovered = null;

        this.locked = false;

    },



    /* ======================================================
       GET SELECTED
    ====================================================== */

    getSelected() {

        return this.selected;

    },



    /* ======================================================
       GET HOVERED
    ====================================================== */

    getHovered() {

        return this.hovered;

    },



    /* ======================================================
       IS LOCKED
    ====================================================== */

    isLocked() {

        return this.locked;

    },



    /* ======================================================
       HAS SELECTION
    ====================================================== */

    hasSelection() {

        return this.selected !== null;

    },



    /* ======================================================
       IS SELECTED
    ====================================================== */

    isSelected(componentID) {

        return this.selected === componentID;

    },



    /* ======================================================
       IS HOVERED
    ====================================================== */

    isHovered(componentID) {

        return this.hovered === componentID;

    },



    /* ======================================================
       REPORT
    ====================================================== */

    report() {

        console.groupCollapsed(

            "Selection State"

        );

        console.table({

            hovered: this.hovered,

            selected: this.selected,

            locked: this.locked

        });

        console.groupEnd();

    }

};