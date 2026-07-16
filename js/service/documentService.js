/* ==========================================================
   SDTD SERVICES

   Document Service

   Centralized document management.

   Version : 1.0.0

========================================================== */

const DocumentService = {

    /* ======================================================
       INITIALIZE
    ====================================================== */

    initialize() {

        console.log(

            "✔ Document Service Ready"

        );

    },



    /* ======================================================
       GET DOCUMENTS
    ====================================================== */

    get(componentID) {

        if (!componentID) {

            return [];

        }

        return DataManager.getDocuments(

            componentID

        );

    },



    /* ======================================================
       HAS DOCUMENTS
    ====================================================== */

    has(componentID) {

        return this.get(

            componentID

        ).length > 0;

    },



    /* ======================================================
       COUNT
    ====================================================== */

    count(componentID) {

        return this.get(

            componentID

        ).length;

    },



    /* ======================================================
       FIRST DOCUMENT
    ====================================================== */

    first(componentID) {

        const documents = this.get(

            componentID

        );

        if (!documents.length) {

            return null;

        }

        return documents[0];

    },



    /* ======================================================
       FIND DOCUMENT
    ====================================================== */

    find(componentID, fileName) {

        return this.get(

            componentID

        ).find(document =>

            document.name === fileName ||

            document.file === fileName

        ) || null;

    },



    /* ======================================================
       OPEN
    ====================================================== */

    open(document) {

        if (!document) {

            return;

        }

        console.log(

            "Opening document:",

            document

        );

        /*
            Future:

            PDF Viewer

            Browser

            SharePoint

            ERP

            Download

        */

    },



    /* ======================================================
       DOWNLOAD
    ====================================================== */

    download(document) {

        if (!document) {

            return;

        }

        console.log(

            "Downloading:",

            document

        );

        /*
            Future implementation
        */

    },



    /* ======================================================
       GET ALL
    ====================================================== */

    getAll() {

        return SDTD.documents;

    }

};