/* ==========================================================
   SDTD ENGINE

   Report Manager

   Reverse Engineering Laboratory

   Version : 2.0.0

========================================================== */

const ReportManager = {

    report: null,



    /* ======================================================
       INITIALIZE
    ====================================================== */

    initialize(projectName){

        this.report={

            project:projectName,

            date:new Date().toLocaleString(),

            analyzers:{}

        };

    },



    /* ======================================================
       SAVE
    ====================================================== */

    save(name,data){

        this.report.analyzers[name]=data;

    },



    /* ======================================================
       GET
    ====================================================== */

    getReport(){

        return this.report;

    },



    /* ======================================================
       PRINT
    ====================================================== */

    print(){

        if(

            typeof ConsoleReporter !==

            "undefined"

        ){

            ConsoleReporter.print(

                this.report

            );

        }

    }

};