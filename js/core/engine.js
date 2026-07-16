/* ==========================================================
   SDTD ENGINE

   engine.js

   Main Engine

========================================================== */

const Engine = {

    /* ======================================================
       INITIALIZE
    ====================================================== */

    async initialize() {

        console.clear();

        console.log("====================================");
        console.log(" SDTD ENGINE");
        console.log(" Version 2.1.0");
        console.log("====================================");

        //--------------------------------------------------
        // Configuration
        //--------------------------------------------------

        await this.loadConfiguration();

        //--------------------------------------------------
        // Project Information
        //--------------------------------------------------

        await this.loadProjectData();

        //--------------------------------------------------
        // Project Data
        //--------------------------------------------------

        await DataManager.initialize();

        //--------------------------------------------------
        // Core Managers
        //--------------------------------------------------

        ComponentManager.initialize();

        SelectionState.initialize();

        //--------------------------------------------------
        // User Interface
        //--------------------------------------------------

        this.initializeUI();

        //--------------------------------------------------
        // Modules
        //--------------------------------------------------

        this.initializeModules();

        //--------------------------------------------------
        // Workspace
        //--------------------------------------------------

        this.startWorkspace();

        //--------------------------------------------------
        // Build BOM
        //--------------------------------------------------

        BOM.build();

        console.log("====================================");
        console.log("✔ Engine Ready");
        console.log("====================================");

        console.log(SDTD);

    },



    /* ======================================================
       CONFIGURATION
    ====================================================== */

    async loadConfiguration() {

        SDTD.config = await this.loadJSON(

            "config.json"

        );

    },



    /* ======================================================
       PROJECT DATA
    ====================================================== */

    async loadProjectData() {

        SDTD.client = await this.loadJSON(

            "data/client.json"

        );

        SDTD.project = await this.loadJSON(

            "data/project.json"

        );

    },



    /* ======================================================
       USER INTERFACE
    ====================================================== */

    initializeUI() {

        UI.initialize();

        UI.buildHeader();

        Workspace.initialize();

        SelectionManager.initialize();

        Panel.initialize();

        BOM.initialize();

    },



    /* ======================================================
       MODULES
    ====================================================== */

    initializeModules() {

        ModuleManager.initialize();

    },



    /* ======================================================
       WORKSPACE
    ====================================================== */

    startWorkspace() {

        Workspace.loadDefaultView();

    },



    /* ======================================================
       JSON LOADER
    ====================================================== */

    async loadJSON(path) {

        try {

            const response = await fetch(path);

            if (!response.ok) {

                throw new Error(response.status);

            }

            return await response.json();

        }

        catch (error) {

            console.error("Unable to load:");

            console.error(path);

            console.error(error);

            return null;

        }

    }

};