/* ==========================================================
   SDTD PANEL

   panel.js

   Version : 2.1.0

   Right Information Panel

========================================================== */

import { SDTD } from '../core/app.js';
import { DataManager } from '../core/dataManager.js';
import { BOM } from './bom.js';

export const Panel = {

    componentContainer: null,

    informationContainer: null,

    documentsContainer: null,

    actionsContainer: null,

    modalOverlay: null,

    modalForm: null,

    modalStatus: null,



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

        this.initModal();

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

                ${component.id}

            </div>

            <div class="component-code">

                ${component.description || "-"}

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
       ACTIONS — Quote Modal
    ====================================================== */

    initModal() {

        this.modalOverlay =
            document.getElementById("quote-modal-overlay");

        this.modalForm =
            document.getElementById("quote-modal-form");

        this.modalStatus =
            document.getElementById("quote-modal-status");

        const closeBtn =
            document.getElementById("quote-modal-close");

        if (closeBtn) {

            closeBtn.addEventListener(
                "click",
                () => this.closeQuoteModal()
            );

        }

        if (this.modalOverlay) {

            this.modalOverlay.addEventListener(
                "click",
                (e) => {
                    if (e.target === this.modalOverlay) {
                        this.closeQuoteModal();
                    }
                }
            );

        }

        if (this.modalForm) {

            this.modalForm.addEventListener(
                "submit",
                (e) => this.handleQuoteSubmit(e)
            );

        }

        document.addEventListener("keydown", (e) => {

            if (
                e.key === "Escape" &&
                this.modalOverlay &&
                this.modalOverlay.style.display !== "none"
            ) {

                e.stopPropagation();

                this.closeQuoteModal();

            }

        });

    },



    openQuoteModal(items, isWholeProject) {

        if (!this.modalOverlay) {

            return;

        }

        const projectCode =
            (SDTD.project && SDTD.project.project && SDTD.project.project.code)
                ? SDTD.project.project.code
                : "";

        const projectTitle =
            (SDTD.project && SDTD.project.project && SDTD.project.project.title)
                ? SDTD.project.project.title
                : "";

        document.getElementById("quote-modal-project").textContent =
            projectCode + " — " + projectTitle;

        const itemsContainer =
            document.getElementById("quote-modal-items");

        if (isWholeProject) {

            itemsContainer.innerHTML =
                "<p>Ensemble complet du projet</p>";

        } else {

            const list = items.map(item =>
                `<li>${item.id} | ${item.description || item.name || ""} | Qté: ${item.quantity}</li>`
            ).join("");

            itemsContainer.innerHTML =
                `<ul>${list}</ul>`;

        }

        const subject = isWholeProject
            ? `Demande de devis - Ensemble complet ${projectCode}`
            : `Demande de devis - ${projectTitle}`;

        const details = isWholeProject
            ? `Bonjour,\n\nJe souhaite obtenir un devis pour l'ensemble complet ${projectCode} - ${projectTitle}.\n\nMerci.`
            : `Bonjour,\n\nJe souhaite obtenir un devis pour les pièces suivantes (${projectTitle}) :\n\n${items.map(item => `- ${item.id} | ${item.description || item.name || ""} | Qté: ${item.quantity}`).join("\n")}\n\nMerci.`;

        document.getElementById("quote-hidden-subject").value = subject;
        document.getElementById("quote-hidden-details").value = details;

        this.modalForm.reset();

        document.getElementById("quote-hidden-subject").value = subject;
        document.getElementById("quote-hidden-details").value = details;

        this.modalStatus.textContent = "";
        this.modalStatus.className = "panel-hint";

        this.modalOverlay.style.display = "flex";

    },



    closeQuoteModal() {

        if (this.modalOverlay) {

            this.modalOverlay.style.display = "none";

        }

    },



    handleQuoteSubmit(e) {

        e.preventDefault();

        const submitBtn =
            document.getElementById("quote-modal-submit");

        submitBtn.disabled = true;

        this.modalStatus.textContent = "Envoi en cours...";

        this.modalStatus.className = "panel-hint";

        fetch("https://formspree.io/f/mdaqgkya", {

            method: "POST",

            headers: { "Accept": "application/json" },

            body: new FormData(this.modalForm)

        })

        .then(response => {

            if (response.ok) {

                this.modalStatus.textContent =
                    "✔ Demande envoyée avec succès";

                this.modalStatus.className = "panel-hint success";

                setTimeout(() => this.closeQuoteModal(), 2000);

            } else {

                throw new Error();

            }

        })

        .catch(() => {

            this.modalStatus.textContent =
                "✖ Erreur d'envoi. Veuillez réessayer ou nous contacter directement.";

            this.modalStatus.className = "panel-hint error";

            submitBtn.disabled = false;

        });

    },



    /* ======================================================
       SEND WHOLE PROJECT QUOTE REQUEST
    ====================================================== */

    sendWholeProjectQuoteRequest() {

        this.openQuoteModal([], true);

    },



    /* ======================================================
       SEND QUOTE REQUEST (itemized from BOM checkboxes)
    ====================================================== */

    sendQuoteRequest() {

        const items =
            (typeof BOM !== "undefined")
                ? BOM.getQuoteSelection()
                : [];

        if (items.length === 0) {

            return;

        }

        const totalComponents =
            (SDTD.components) ? SDTD.components.length : 0;

        if (totalComponents > 0 && items.length === totalComponents) {

            this.openQuoteModal([], true);

            return;

        }

        this.openQuoteModal(items, false);

    }

};