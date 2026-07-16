/* ==========================================================
   SDTD TOOLS - SVG Source Adapter (versión navegador)

   Responsabilidad única: recibir el TEXTO de un archivo .svg
   exportado de SolidWorks Composer, y devolver la lista de
   piezas (código por cada hotspot).

   ⚠ No confundir con js/modules/svg/composerAdapter.js —
   ese archivo corre dentro del visor y controla la selección
   en vivo. Este archivo solo se usa en generator.html, para
   preparar components.json antes de publicar el proyecto.
========================================================== */

const SvgSourceAdapter={

    extract(svgText){

        const hotspotPattern=

            /<g id="(hotspot\.\d+)"[^>]*onmousemove="ShowToolTip\([^,]+,[^,]+,&quot;([^&]+)&quot;\)"/g;

        const codes=[];

        let match;

        while((match=hotspotPattern.exec(svgText))!==null){

            codes.push({

                hotspotId:match[1],

                code:match[2]

            });

        }

        return codes;

    }

};