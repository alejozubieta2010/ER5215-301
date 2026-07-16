/* ==========================================================
   SDTD ENGINE
   moduleManager.js

   Dynamic Module Loader
========================================================== */

/* ==========================================================
   ⚠️ ORDEN DE CARGA REQUERIDO (ver index.html)

   Este archivo NO usa imports — depende de que los siguientes
   objetos ya existan en el scope global (window) al momento
   de ejecutarse. Si el orden de los <script> en index.html
   cambia, esto puede romperse en silencio.

   Orden obligatorio:
   1. js/core/*                (SDTD, Engine, DataManager,
                                 ComponentManager, SelectionState)
   2. js/modules/svg/*          (SVGModule y dependencias)
   3. js/modules/model3d/*      (Model3DModule y dependencias)
   4. js/modules/documents/*    (DocumentsModule y dependencias)
   5. js/core/moduleManager.js  (este archivo — debe cargar
                                 DESPUÉS de todos los módulos
                                 porque referencia directamente
                                 SVGModule, DocumentsModule,
                                 Model3DModule por nombre)
   6. js/service/*
   7. js/ui/*

   Si agregas un módulo nuevo (ej. Model3DModule real, no
   stub), debe cargarse ANTES de esta línea en index.html.
========================================================== */

const ModuleManager = {

    /* ======================================================
       REGISTERED MODULES
    ====================================================== */

    modules: {

        svg: SVGModule,

        documents: DocumentsModule,

        model3d: Model3DModule

    },



    /* ======================================================
       INITIALIZE MODULE SYSTEM
    ====================================================== */

    initialize() {

        console.log("====================================");
        console.log(" Loading Modules");
        console.log("====================================");

        if (!SDTD.project || !SDTD.project.modules) {

            console.warn("No modules defined.");

            return;

        }

        const projectModules = SDTD.project.modules;

        Object.keys(this.modules).forEach(moduleName => {

            if (projectModules[moduleName]) {

                console.log("✔ " + moduleName + " module");

                if (this.modules[moduleName] &&
                    typeof this.modules[moduleName].initialize === "function") {

                    this.modules[moduleName].initialize();

                } else {

                    console.warn(
                        "Module not valid:",
                        moduleName
                    );

                }

            }

        });

        console.log("====================================");

    }

};



/* ==========================================================
   GLOBAL EXPORT (IMPORTANT FIX)
========================================================== */

window.ModuleManager = ModuleManager;