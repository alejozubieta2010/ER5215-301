/* ==========================================================
   SDTD ENGINE
   moduleManager.js

   Dynamic Module Loader
========================================================== */

/* ==========================================================
   ⚠️ ORDEN DE CARGA — RESUELTO POR ES6 IMPORTS

   Antes de la migración a ES6, este archivo dependía del orden
   de los <script> en index.html. Ahora los imports resuelven
   las dependencias automáticamente — el orden de carga ya no
   importa (el bundler/motor ES6 maneja el grafo de dependencias).
========================================================== */

import { SDTD } from './app.js';
import { SVGModule } from '../modules/svg/svg.js';
import { DocumentsModule } from '../modules/documents/documents.js';
import { Model3DModule } from '../modules/model3d/model3d.js';

export const ModuleManager = {

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
