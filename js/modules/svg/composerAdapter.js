/* ==========================================================
   SDTD ENGINE

   Composer Adapter

   Version : 3.1.0

   SVG Entry Point

========================================================== */

const ComposerAdapter={

    svgDocument:null,

    activeHotspot:null,

    /* ======================================================
       HIGHLIGHT COMPONENT
       Busca la pieza en el SVG (vía ComposerLookup) y le
       aplica opacidad .5 (el mismo mecanismo nativo de
       Composer), para marcarla como seleccionada.
    ====================================================== */

    highlightComponent(componentID){

        if(!this.svgDocument){

            return;

        }

        // Quita cualquier resaltado anterior antes de aplicar uno nuevo
        this.clearHighlight();

        const hotspot=

            ComposerLookup.getHotspot(

                componentID

            );

        if(!hotspot){

            console.warn(

                "⚠ No se encontró hotspot en el SVG para:",

                componentID

            );

            return;

        }

        // Usa el mismo mecanismo nativo de Composer (opacity),
        // en vez de un efecto visual nuevo.
        hotspot.setAttribute(

            "opacity",

            ".5"

        );

        this.activeHotspot=hotspot;

    },



    /* ======================================================
       CLEAR HIGHLIGHT
    ====================================================== */

    clearHighlight(){

        if(this.activeHotspot){

            this.activeHotspot.setAttribute(

                "opacity",

                "0"

            );

            this.activeHotspot=null;

        }

    },



    initialize(svgViewer){

        this.svgDocument=svgViewer.contentDocument;

        if(!this.svgDocument){

            console.error("Composer SVG not available.");

            return;

        }

        console.log("✔ Composer Adapter Ready");

        //--------------------------------------------------
        // Runtime
        //--------------------------------------------------

        if(typeof EventAnalyzer!=="undefined"){

            EventAnalyzer.initialize(

                this.svgDocument

            );

        }

        //--------------------------------------------------
        // Lookup
        //--------------------------------------------------

        ComposerLookup.initialize(

            this.svgDocument

        );

        //--------------------------------------------------
        // Clic en zona vacía del dibujo = limpiar selección
        // (los hotspots detienen la propagación con
        // event.stopPropagation() en composerEvents.js, así
        // que si el clic llega hasta aquí, fue fuera de una pieza)
        //--------------------------------------------------

        this.svgDocument.addEventListener(

            "click",

            () => {

                if(typeof SelectionManager!=="undefined"){

                    SelectionManager.clear();

                }

            }

        );

        //--------------------------------------------------
        // ESC dentro del SVG
        // El <object> embebe el SVG como documento separado,
        // así que al hacer clic en una pieza el foco se mueve
        // ahí adentro y el ESC nunca llega al document principal
        // (donde escucha SelectionManager). Por eso este listener
        // vive aquí, sobre el mismo svgDocument.
        //--------------------------------------------------

        this.svgDocument.addEventListener(

            "keydown",

            (event) => {

                if(event.key!=="Escape"){

                    return;

                }

                if(typeof SelectionManager!=="undefined"){

                    SelectionManager.clear();

                }

            }

        );

    }

};