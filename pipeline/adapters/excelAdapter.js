/* ==========================================================
   SDTD TOOLS - Excel Adapter (versión navegador)

   Responsabilidad única: recibir el contenido binario de un
   archivo Excel (BOM del cliente) y devolver un diccionario
   { code: {description, quantity} }.

   Reconoce distintos nombres de columna según el idioma o
   formato del cliente (francés, inglés, español).

   Requiere que la librería xlsx.full.min.js ya esté cargada
   en la página (define la variable global XLSX).
========================================================== */

const ExcelAdapter={

    COLUMN_ALIASES:{

        part_number:[

            "part_number","part number","partnumber",
            "code","código","codigo","réf","ref"

        ],

        description:[

            "description","descripción","descripcion",
            "objet","désignation","designation"

        ],

        quantity:[

            "quantity","quantité","quantite",
            "cantidad","qty"

        ]

    },



    /* ======================================================
       NORMALIZE HEADERS
    ====================================================== */

    normalizeHeaders(rawHeaders){

        const mapping={};

        rawHeaders.forEach((header,index)=>{

            const headerClean=

                String(header||"").trim().toLowerCase();

            for(const [internalKey,aliases] of Object.entries(this.COLUMN_ALIASES)){

                if(aliases.includes(headerClean)){

                    mapping[internalKey]=index;

                }

            }

        });

        const missing=

            Object.keys(this.COLUMN_ALIASES).filter(

                key=>!(key in mapping)

            );

        if(missing.length>0){

            throw new Error(

                "No se encontraron las columnas: "+missing.join(", ")+
                ". Encabezados detectados: "+rawHeaders.join(", ")

            );

        }

        return mapping;

    },



    /* ======================================================
       EXTRACT
       Recibe el archivo Excel como ArrayBuffer (ya leído
       desde el <input type="file"> con FileReader).
    ====================================================== */

    extract(arrayBuffer){

        const workbook=

            XLSX.read(arrayBuffer,{type:"array"});

        const sheetName=

            workbook.SheetNames[0];

        const sheet=

            workbook.Sheets[sheetName];

        const rows=

            XLSX.utils.sheet_to_json(sheet,{header:1});

        const headerMap=

            this.normalizeHeaders(rows[0]);

        const bom={};

        for(let i=1;i<rows.length;i++){

            const row=rows[i];

            if(!row||row.length===0){

                continue;

            }

            const partNumber=

                row[headerMap.part_number];

            if(!partNumber){

                continue;

            }

            bom[String(partNumber).trim()]={

                description:row[headerMap.description]||"",

                quantity:row[headerMap.quantity]

            };

        }

        return bom;

    }

};
