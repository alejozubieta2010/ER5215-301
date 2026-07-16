/* ==========================================================
   SDTD TOOLS - Generator (orquestador)

   Este archivo NO sabe cómo se lee un SVG ni un Excel — solo
   le pide la información a SvgSourceAdapter y ExcelAdapter,
   las combina, y arma components.json.

   Depende de que ya estén cargados en la página:
     - xlsx.full.min.js
     - adapters/svgSourceAdapter.js
     - adapters/excelAdapter.js
========================================================== */

const Generator={

    logEl:null,

    initialize(){

        this.logEl=document.getElementById("log");

        document

            .getElementById("generateButton")

            .addEventListener("click",()=>this.run());

    },

    log(message,type){

        this.logEl.style.display="block";

        const line=document.createElement("div");

        if(type){

            line.className="log-"+type;

        }

        line.textContent=message;

        this.logEl.appendChild(line);

        this.logEl.scrollTop=this.logEl.scrollHeight;

    },

    clearLog(){

        this.logEl.innerHTML="";

        this.logEl.style.display="none";

    },



    readFileAsText(file){

        return new Promise((resolve,reject)=>{

            const reader=new FileReader();

            reader.onload=()=>resolve(reader.result);

            reader.onerror=reject;

            reader.readAsText(file);

        });

    },

    readFileAsArrayBuffer(file){

        return new Promise((resolve,reject)=>{

            const reader=new FileReader();

            reader.onload=()=>resolve(reader.result);

            reader.onerror=reject;

            reader.readAsArrayBuffer(file);

        });

    },



    /* ======================================================
       ARMAR components.json
    ====================================================== */

    buildComponents(svgCodes,bom){

        const components=[];

        const seen=new Set();

        svgCodes.forEach(entry=>{

            const code=entry.code;

            if(seen.has(code)){

                return;

            }

            seen.add(code);

            if(bom[code]){

                components.push({

                    id:code,

                    name:bom[code].description||code,

                    description:bom[code].description,

                    quantity:bom[code].quantity,

                    material:"",

                    documents:[]

                });

            }else{

                components.push({

                    id:code,

                    name:"Sin identificar",

                    description:"Sin identificar",

                    quantity:"Sin identificar",

                    material:"",

                    documents:[]

                });

            }

        });

        //--------------------------------------------------
        // Ordenar alfabéticamente por código (id)
        //--------------------------------------------------

        components.sort((a,b)=>

            a.id.localeCompare(b.id,undefined,{numeric:true,sensitivity:"base"})

        );

        //--------------------------------------------------
        // Numerar consecutivamente (1, 2, 3...) según el
        // orden final del BOM
        //--------------------------------------------------

        components.forEach((component,index)=>{

            component.item=index+1;

        });

        return components;

    },



    /* ======================================================
       RUN — se ejecuta al hacer clic en "Generar"
    ====================================================== */

    async run(){

        this.clearLog();

        document.getElementById("downloadArea").style.display="none";

        const svgFile=

            document.getElementById("svgInput").files[0];

        const excelFile=

            document.getElementById("excelInput").files[0];

        if(!svgFile){

            this.log("⚠ Selecciona primero el archivo SVG.","error");

            return;

        }

        if(!excelFile){

            this.log("⚠ Selecciona primero el archivo Excel.","error");

            return;

        }

        try{

            const svgText=

                await this.readFileAsText(svgFile);

            const svgCodes=

                SvgSourceAdapter.extract(svgText);

            const excelBuffer=

                await this.readFileAsArrayBuffer(excelFile);

            const bom=

                ExcelAdapter.extract(excelBuffer);

            const components=

                this.buildComponents(svgCodes,bom);

            const pending=

                components.filter(c=>c.name==="Sin identificar").length;

            this.log("✔ "+components.length+" piezas detectadas en el SVG","ok");

            this.log("✔ "+(components.length-pending)+" completadas con \""+excelFile.name+"\"","ok");

            if(pending>0){

                this.log("⚠ "+pending+" piezas sin información (marcadas como \"Sin identificar\"):","warn");

                components

                    .filter(c=>c.name==="Sin identificar")

                    .forEach(c=>this.log("   - "+c.id,"warn"));

            }

            const jsonText=

                JSON.stringify(components,null,4);

            const blob=

                new Blob([jsonText],{type:"application/json"});

            const url=

                URL.createObjectURL(blob);

            document.getElementById("downloadLink").href=url;

            document.getElementById("downloadArea").style.display="block";

            this.log("","ok");

            this.log("✔ Listo. Descarga el archivo y reemplaza tu data/components.json","ok");

        }catch(error){

            this.log("✖ Error: "+error.message,"error");

        }

    }

};



document.addEventListener("DOMContentLoaded",()=>{

    Generator.initialize();

});