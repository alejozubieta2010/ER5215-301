/* ==========================================================
   SDTD ENGINE

   Data Manager

   Loads and normalizes all project data.

   Version : 2.1.0

========================================================== */

import { SDTD } from './app.js';

export const DataManager = {

    /* ======================================================
       INITIALIZE
    ====================================================== */

    async initialize() {

        console.log("------------------------------------");
        console.log("Loading Project Data...");
        console.log("------------------------------------");

        await this.loadComponents();

        await this.loadDocuments();

        console.log("✔ Data Manager Ready");

    },



    /* ======================================================
       LOAD COMPONENTS
    ====================================================== */

    async loadComponents() {

        try {

            const response = await fetch(

                "data/components.json"

            );

            if (!response.ok) {

                throw new Error(response.status);

            }

            const json = await response.json();

            //--------------------------------------------------
            // Normalize Components
            //--------------------------------------------------

            SDTD.components = json.map(

                component => this.normalizeComponent(component)

            );

            console.log(

                "Components :",

                SDTD.components.length

            );

        }

        catch (error) {

            console.warn(

                "Unable to load components.json"

            );

            console.warn(error.message);

            SDTD.components = [];

        }

    },



    /* ======================================================
       NORMALIZE COMPONENT
    ====================================================== */

normalizeComponent(component) {

        return {

            id:

                component.id ??

                component.partNumber ??

                component.code ??

                component.reference ??

                "",

            name:

                component.name ??

                component.id ??

                "",

            description:

                component.description ??

                "",

            quantity:

                component.quantity ??

                1,

            material:

                component.material ??

                "",

            item:

                component.item ??

                "-",

            documents:

                component.documents ??

                []

        };

    },


    /* ======================================================
       LOAD DOCUMENTS
    ====================================================== */

    async loadDocuments() {

        try {

            const response = await fetch(

                "data/documents.json"

            );

            if (!response.ok) {

                throw new Error(response.status);

            }

            const json = await response.json();

            SDTD.documents = json;

            console.log(

                "Documents :",

                SDTD.documents.length

            );

        }

        catch (error) {

            console.warn(

                "Unable to load documents.json"

            );

            console.warn(error.message);

            SDTD.documents = [];

        }

    },



    /* ======================================================
       GET COMPONENT
    ====================================================== */

    getComponent(componentID) {

        return SDTD.components.find(

            component =>

                component.id === componentID

        );

    },



    /* ======================================================
       GET ALL COMPONENTS
    ====================================================== */

    getComponents() {

        return SDTD.components;

    },



    /* ======================================================
       GET DOCUMENTS
    ====================================================== */

    getDocuments(componentID) {

        return SDTD.documents.filter(

            document =>

                document.id === componentID ||

                document.component === componentID

        );

    }

};