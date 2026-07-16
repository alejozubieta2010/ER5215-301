/* ==========================================================
   SDTD ENGINE

   Console Reporter

   Reverse Engineering Laboratory

   Version : 1.0.0

========================================================== */

const ConsoleReporter = {

    /* ======================================================
       PRINT REPORT
    ====================================================== */

    print(report) {

        if (!report) {

            console.warn("ConsoleReporter: No report.");

            return;

        }

        console.clear();



        console.log("");

        console.log("================================================");

        console.log(" COMPOSER LAB REPORT");

        console.log("================================================");

        console.log("");



        console.log("Project :");

        console.log(report.project);

        console.log("");



        console.log("Generated :");

        console.log(report.date);

        console.log("");



        console.log("Analyzers");

        console.log("------------------------------------------------");



        Object.entries(report.analyzers).forEach(

            ([name,data]) => {

                this.printAnalyzer(

                    name,

                    data

                );

            }

        );



        console.log("");

        console.log("================================================");

        console.log("");

    },



    /* ======================================================
       ANALYZER
    ====================================================== */

    printAnalyzer(name,data){

        console.log("");

        console.log("✔ " + name);



        if(!data){

            console.log("   No Data");

            return;

        }



        Object.entries(data).forEach(

            ([key,value])=>{

                if(Array.isArray(value)){

                    console.log(

                        "   " +

                        key +

                        " : " +

                        value.length

                    );

                }

                else if(

                    typeof value === "object"

                ){

                    console.log(

                        "   " +

                        key +

                        " : Object"

                    );

                }

                else{

                    console.log(

                        "   " +

                        key +

                        " : " +

                        value

                    );

                }

            }

        );

    }

};