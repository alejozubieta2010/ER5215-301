/* ==========================================================
   SDTD PANEL

   panel.js

   Version : 2.1.0

   Right Information Panel

========================================================== */

const Panel = {

    componentContainer: null,

    informationContainer: null,

    documentsContainer: null,

    actionsContainer: null,



    initialize() {

        this.componentContainer =
            document.getElementById("component-content");

        this.informationContainer =
            document.getElementById("information-content");

        this.documentsContainer =
            document.getElementById("documents-content");

        this.actionsContainer =
            document.getElementById("actions-content");

        console.log("✔ Panel Initialized");

        this.showEmptyState();

        this.renderActions();

    },



    update(componentID) {

        if (!componentID) {

            this.showEmptyState();

            return;

        }

        const component = DataManager.getComponent(

            componentID

        );

        if (!component) {

            console.warn(

                "Component not found:",

                componentID

            );

            this.showEmptyState();

            return;

        }

        this.render(component);

    },



    showEmptyState() {

        this.componentContainer.innerHTML =

            "<span class='panel-placeholder'>Select a component</span>";

        this.informationContainer.innerHTML =

            "<span class='panel-placeholder'>No information available.</span>";

        this.documentsContainer.innerHTML =

            "<span class='panel-placeholder'>No documents available.</span>";

    },



    clear() {

        this.componentContainer.innerHTML = "";

        this.informationContainer.innerHTML = "";

        this.documentsContainer.innerHTML = "";

    },



    renderComponent(component) {

        this.componentContainer.innerHTML = `

            <div class="component-name">

                ${component.name || component.id}

            </div>

            <div class="component-code">

                ${component.id}

            </div>

        `;

    },



    renderInformation(component) {

        this.informationContainer.innerHTML = `

            <table class="panel-table">

                <tr>

                    <td><strong>Quantity</strong></td>

                    <td>${component.quantity}</td>

                </tr>

                <tr>

                    <td><strong>Material</strong></td>

                    <td>${component.material || "-"}</td>

                </tr>

                <tr>

                    <td><strong>Description</strong></td>

                    <td>${component.description || "-"}</td>

                </tr>

            </table>

        `;

    },



    renderDocuments(component) {

        this.documentsContainer.innerHTML = "";

        const documents = DataManager.getDocuments(

            component.id

        );

        if (!documents || documents.length === 0) {

            this.documentsContainer.innerHTML =

                "<span class='panel-placeholder'>No documents available.</span>";

            return;

        }

        documents.forEach(document => {

            this.documentsContainer.innerHTML += `

                <div class="document-item">

                    📄 ${document.name || document.file || document}

                </div>

            `;

        });

    },



    render(component) {

        this.clear();

        this.renderComponent(component);

        this.renderInformation(component);

        this.renderDocuments(component);

    },



    /* ======================================================
       ACTIONS — Solicitud de cotización
    ====================================================== */

    renderActions() {

        if (!this.actionsContainer) {

            return;

        }

        const count =

            (typeof BOM !== "undefined")

                ? BOM.quoteSelection.size

                : 0;

        const projectCode =

            (SDTD.project && SDTD.project.project && SDTD.project.project.code)

                ? SDTD.project.project.code

                : "";

        const itemizedLabel =

            count > 0

                ? `Demander un devis (${count})`

                : "Demander un devis";

        this.actionsContainer.innerHTML = `

            <button
                id="quote-whole-project-button"
                class="action-button action-button-primary"
            >
                Demander un devis pour ${projectCode}
            </button>

            <p class="panel-hint">
                Demande de devis pour l'ensemble complet du projet.
            </p>

            <div class="action-divider"></div>

            <button
                id="quote-request-button"
                class="action-button"
                ${count === 0 ? "disabled" : ""}
            >
                ${itemizedLabel}
            </button>

            <p class="panel-hint">
                ${

                    count > 0

                        ? "Sélectionnez des pièces dans le Bill of Materials pour les ajouter."

                        : "Cochez une ou plusieurs pièces dans le Bill of Materials pour demander un devis."

                }
            </p>

        `;

        const wholeProjectButton =

            document.getElementById("quote-whole-project-button");

        if (wholeProjectButton) {

            wholeProjectButton.addEventListener(

                "click",

                () => this.sendWholeProjectQuoteRequest()

            );

        }

        const itemizedButton =

            document.getElementById("quote-request-button");

        if (itemizedButton) {

            itemizedButton.addEventListener(

                "click",

                () => this.sendQuoteRequest()

            );

        }

    },



    refreshActions() {

        this.renderActions();

    },



    /* ======================================================
       SEND WHOLE PROJECT QUOTE REQUEST
       (botón directo, sin necesidad de marcar checkboxes)
    ====================================================== */

    sendWholeProjectQuoteRequest() {

        const projectName =

            (SDTD.project && SDTD.project.project && SDTD.project.project.title)

                ? SDTD.project.project.title

                : "";

        const projectCode =

            (SDTD.project && SDTD.project.project && SDTD.project.project.code)

                ? SDTD.project.project.code

                : "";

        const subject =

            `Demande de devis - Ensemble complet ${projectCode}`;

        const body =

            `Bonjour,\n\n` +
            `Je souhaite obtenir un devis pour l'ensemble complet ` +
            `${projectCode} - ${projectName}.\n\n` +
            `Merci.`;

        this.openMailto(subject, body);

    },



    /* ======================================================
       SEND QUOTE REQUEST
       (piezas marcadas con checkbox en el BOM)
    ====================================================== */

    sendQuoteRequest() {

        const items =

            (typeof BOM !== "undefined")

                ? BOM.getQuoteSelection()

                : [];

        if (items.length === 0) {

            return;

        }

        const projectName =

            (SDTD.project && SDTD.project.project && SDTD.project.project.title)

                ? SDTD.project.project.title

                : "";

        const totalComponents =

            (SDTD.components) ? SDTD.components.length : 0;

        //--------------------------------------------------
        // Si están TODAS las piezas marcadas, se entiende
        // como una solicitud del conjunto completo.
        //--------------------------------------------------

        if (totalComponents > 0 && items.length === totalComponents) {

            this.sendWholeProjectQuoteRequest();

            return;

        }

        const subject =

            `Demande de devis - ${projectName}`;

        const lines =

            items.map(item =>

                `- ${item.id} | ${item.description || item.name} | Qté: ${item.quantity}`

            );

        const body =

            `Bonjour,\n\n` +
            `Je souhaite obtenir un devis pour les pièces suivantes ` +
            `(${projectName}) :\n\n` +
            lines.join("\n") +
            `\n\nMerci.`;

        this.openMailto(subject, body);

    },



    openMailto(subject, body) {

        const salesEmail =

            (SDTD.client && SDTD.client.salesEmail)

                ? SDTD.client.salesEmail

                : "";

        const mailtoUrl =

            `mailto:${salesEmail}` +
            `?subject=${encodeURIComponent(subject)}` +
            `&body=${encodeURIComponent(body)}`;

        window.location.href = mailtoUrl;

    }

};