/* ==========================================================
   SDTD ENGINE

   Data Manager

   Loads and normalizes all project data.

   Version : 2.1.0

========================================================== */

import { SDTD } from './app.js';
import { EventBus } from './eventBus.js';

export const DataManager = {

    _lastHash: null,
    _watchInterval: null,

    /* ======================================================
       INITIALIZE
    ====================================================== */

    async initialize() {

        console.log("------------------------------------");
        console.log("Loading Project Data...");
        console.log("------------------------------------");

        await this.loadComponents();

        await this.loadDocuments();

        this.startBomWatcher();

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

            const text = await response.text();

            this._lastHash = text;

            const json = JSON.parse(text);

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

                component.part_number ??

                component.partNumber ??

                component.code ??

                component.reference ??

                "",

            name:

                component.name ??

                component.id ??

                component.part_number ??

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

                [],

            visible3d:

                component.visible3d ??

                true

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

    },



    /* ======================================================
       BOM WATCHER
       Polls components.json for changes (auto-reload)
    ====================================================== */

    startBomWatcher() {

        console.log("✔ BOM Watcher started (3s interval)");

        this._watchInterval = setInterval(() => this._checkBomUpdate(), 3000);

    },

    stopBomWatcher() {

        clearInterval(this._watchInterval);

        this._watchInterval = null;

        console.log("BOM Watcher stopped");

    },

    async _checkBomUpdate() {

        try {

            const response = await fetch("data/components.json");

            if (!response.ok) return;

            const text = await response.text();

            if (text === this._lastHash) return;

            console.log("📦 BOM updated — reloading...");

            this._lastHash = text;

            const json = JSON.parse(text);

            SDTD.components = json.map(c => this.normalizeComponent(c));

            EventBus.emit("bom:updated", { components: SDTD.components });

        }

        catch (error) {

            // silent

        }

    }

};