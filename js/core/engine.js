/* ==========================================================
   SDTD ENGINE

   engine.js

   Main Engine

========================================================== */

import { SDTD } from './app.js';
import { DataManager } from './dataManager.js';
import { ComponentManager } from './componentManager.js';
import { SelectionState } from './selectionState.js';
import { ModuleManager } from './moduleManager.js';
import { UI } from '../ui/ui.js';
import { Workspace } from '../ui/workspace.js';
import { SelectionManager } from '../ui/selectionManager.js';
import { Panel } from '../ui/panel.js';
import { BOM } from '../ui/bom.js';
import { NavigationService } from '../service/navigationService.js';
import { HighlightService } from '../service/highlightService.js';
import { SynchronizationService } from '../service/synchronizationService.js';
import { HistoryService } from '../service/historyService.js';

export const Engine = {

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

        NavigationService.initialize();
        HighlightService.initialize();
        SynchronizationService.initialize();
        HistoryService.initialize();

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