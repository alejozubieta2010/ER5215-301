/* ==========================================================
   SDTD ENGINE

   Composer Lookup

   Version : 1.0.0

   Discovers Composer Hotspots
   Builds Component Lookup Table

========================================================== */

import { ComposerEvents } from './composerEvents.js';
import { HighlightService } from '../../service/highlightService.js';
import { SDTD } from '../../core/app.js';
import { EventBus } from '../../core/eventBus.js';

export const ComposerLookup={

    svgDocument:null,

    hotspots:[],

    componentMap:{},



    /* ======================================================
       INITIALIZE
    ====================================================== */

    initialize(svgDocument){

        this.svgDocument=svgDocument;

        this.findHotspots();

    },



    /* ======================================================
       FIND HOTSPOTS
    ====================================================== */

    findHotspots(){

        this.hotspots=Array.from(

            this.svgDocument.querySelectorAll(

                "g[id^='hotspot.']"

            )

        );

        this.componentMap={};

        console.log("------------------------------------");
        console.log("Hotspots found:",this.hotspots.length);
        console.log("------------------------------------");

        this.hotspots.forEach(hotspot=>{

            hotspot.style.cursor="pointer";

            //--------------------------------------------------
            // Component Code
            //--------------------------------------------------

            const componentCode=

                this.extractComponentCode(

                    hotspot

                );

            hotspot.dataset.component=

                componentCode;

            //--------------------------------------------------
            // Lookup
            //--------------------------------------------------

            if(componentCode){

                this.componentMap[componentCode]=

                    hotspot;

            }

            //--------------------------------------------------
            // Register Events
            //--------------------------------------------------

            if(typeof ComposerEvents!=="undefined"){

                ComposerEvents.register(

                    hotspot

                );

            }

        });

        console.log(

            "Indexed Components:",

            Object.keys(

                this.componentMap

            ).length

        );

        SDTD.svgComponents = new Set(Object.keys(this.componentMap));

        EventBus.emit("svg:components:discovered", { components: SDTD.svgComponents });

        //--------------------------------------------------
        // Color de resaltado (viene del propio SVG del cliente)
        //--------------------------------------------------

        this.applyHighlightColor();

    },



    /* ======================================================
       APPLY HIGHLIGHT COLOR
       Lee el color de selección del primer hotspot del SVG
       y lo comparte con HighlightService para que el BOM
       (y cualquier otro módulo) use el mismo color.
    ====================================================== */

    applyHighlightColor(){

        if(this.hotspots.length===0){

            return;

        }

        const color=

            this.extractHighlightColor(

                this.hotspots[0]

            );

        if(!color){

            return;

        }

        console.log(

            "Color de resaltado detectado:",

            color

        );

        if(typeof HighlightService!=="undefined"){

            HighlightService.setColor(

                color

            );

        }

    },



    /* ======================================================
       EXTRACT HIGHLIGHT COLOR
    ====================================================== */

    extractHighlightColor(hotspot){

        const shape=

            hotspot.querySelector(

                "path, polygon, rect, circle"

            );

        if(!shape){

            return null;

        }

        const style=

            shape.getAttribute("style")||"";

        const match=

            style.match(

                /fill:\s*(#[0-9a-fA-F]{3,6})/

            );

        if(match){

            return match[1];

        }

        return shape.getAttribute("fill");

    },



    /* ======================================================
       EXTRACT COMPONENT CODE
    ====================================================== */

    extractComponentCode(hotspot){

        const tooltip=

            hotspot.getAttribute(

                "onmousemove"

            );

        if(!tooltip){

            return null;

        }

        const match=

            tooltip.match(

                /"([^"]+)"/

            );

        if(match){

            return match[1];

        }

        return null;

    },



    /* ======================================================
       GET HOTSPOT
    ====================================================== */

    getHotspot(componentCode){

        return this.componentMap[

            componentCode

        ]||null;

    },



    /* ======================================================
       GET HOTSPOTS
    ====================================================== */

    getHotspots(){

        return this.hotspots;

    },



    /* ======================================================
       COUNT
    ====================================================== */

    count(){

        return this.hotspots.length;

    },



    /* ======================================================
       REPORT
    ====================================================== */

    report(){

        console.groupCollapsed(

            "Composer Lookup"

        );

        console.log(

            "Hotspots:",

            this.hotspots.length

        );

        console.log(

            "Components:",

            Object.keys(

                this.componentMap

            ).length

        );

        console.table(

            Object.keys(

                this.componentMap

            )

        );

        console.groupEnd();

    }

};