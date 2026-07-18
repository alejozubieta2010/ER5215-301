/* ==========================================================
   SDTD SERVICES

   Navigation Service

   Synchronizes every visual module.

   Version : 1.0.0

========================================================== */

import { ComponentManager } from '../core/componentManager.js';
import { Panel } from '../ui/panel.js';
import { BOM } from '../ui/bom.js';
import { ComposerAdapter } from '../modules/svg/composerAdapter.js';

export const NavigationService = {

    /* ======================================================
       NAVIGATE
    ====================================================== */

    navigate(componentID) {

        if (!componentID) {

            return;

        }

        //--------------------------------------------------
        // Verify component exists
        //--------------------------------------------------

        if (!ComponentManager.exists(componentID)) {

            console.warn(

                "Navigation Service:",

                "Unknown component",

                componentID

            );

            return;

        }

        //--------------------------------------------------
        // Update Panel
        //--------------------------------------------------

        Panel.update(

            componentID

        );

        //--------------------------------------------------
        // Update BOM
        //--------------------------------------------------

        BOM.highlight(

            componentID

        );

        //--------------------------------------------------
        // Update Composer
        //--------------------------------------------------

        ComposerAdapter.highlightComponent(

            componentID

        );

        //--------------------------------------------------
        // Future Modules
        //--------------------------------------------------

        /*
            PDFViewer.navigate(componentID);

            Model3D.focus(componentID);

            Documents.update(componentID);

            History.add(componentID);
        */

    },



    /* ======================================================
       CLEAR
    ====================================================== */

    clear() {

        Panel.showEmptyState();

        if (BOM.clearSelection) {

            BOM.clearSelection();

        }

        if (ComposerAdapter.clearHighlight) {

            ComposerAdapter.clearHighlight();

        }

    }

};