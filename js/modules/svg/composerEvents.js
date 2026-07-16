/* ==========================================================
   SDTD ENGINE

   Composer Events

   Version : 1.0.0

   Handles Composer SVG Events

========================================================== */

const ComposerEvents={

    /* ======================================================
       REGISTER EVENTS
    ====================================================== */

    register(hotspot){

        if(!hotspot){

            return;

        }

        hotspot.addEventListener(

            "mouseenter",

            event=>{

                this.hotspotEnter(event);

            }

        );

        hotspot.addEventListener(

            "mouseleave",

            event=>{

                this.hotspotLeave(event);

            }

        );

        hotspot.addEventListener(

            "click",

            event=>{

                this.hotspotClick(event);

            }

        );

    },



    /* ======================================================
       HOTSPOT ENTER
    ====================================================== */

    hotspotEnter(event){

        const hotspot=

            event.currentTarget;

        const componentCode=

            hotspot.dataset.component;

        if(!componentCode){

            return;

        }

        //--------------------------------------------------
        // Update State (solo referencia interna, no ilumina)
        //--------------------------------------------------

        SelectionState.hover(

            componentCode

        );

    },



    /* ======================================================
       HOTSPOT LEAVE
    ====================================================== */

    hotspotLeave(event){

        const hotspot=

            event.currentTarget;

        const componentCode=

            hotspot.dataset.component;

        if(!componentCode){

            return;

        }

        //--------------------------------------------------
        // Update State (solo referencia interna)
        //--------------------------------------------------

        SelectionState.clearHover();

        //--------------------------------------------------
        // Composer apaga la pieza automáticamente al salir
        // el mouse (nativo, sin preguntar). Si esta pieza
        // está SELECCIONADA, la volvemos a iluminar.
        //--------------------------------------------------

        if(SelectionState.isSelected(componentCode)){

            if(typeof HighlightService!=="undefined"){

                HighlightService.highlight(

                    componentCode

                );

            }

        }

    },



    /* ======================================================
       HOTSPOT CLICK
    ====================================================== */

    hotspotClick(event){

        event.preventDefault();

        event.stopPropagation();

        const hotspot=

            event.currentTarget;

        const componentCode=

            hotspot.dataset.component;

        if(!componentCode){

            return;

        }

        console.log("--------------------------------");
        console.log("Hotspot :",hotspot.id);
        console.log("Component :",componentCode);
        console.log("--------------------------------");

        //--------------------------------------------------
        // Save Selection State
        //--------------------------------------------------

        SelectionState.select(

            componentCode

        );

        //--------------------------------------------------
        // Application Selection
        //--------------------------------------------------

        SelectionManager.select(

            componentCode

        );

        //--------------------------------------------------
        // Developer Tools
        //--------------------------------------------------

        if(typeof SVGInspector!=="undefined"){

            SVGInspector.inspect(

                hotspot

            );

        }

    }

};