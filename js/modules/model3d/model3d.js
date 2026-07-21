import { SDTD } from '../../core/app.js';
import { Viewer3D } from './viewer/Viewer3D.js';
import { SelectionManager } from '../../ui/selectionManager.js';

export const Model3DModule = {

    container: null,
    viewer3d: null,
    loaded: false,

    initialize() {
        this.container = document.getElementById('viewer-3d-container');
        console.log("3D Viewer Module Initialized");
    },

    async load() {
        if (!this.container) {
            console.warn("3D Viewer: container not found");
            return;
        }

        this.unload();

        this.container.style.display = 'block';

        this.viewer3d = new Viewer3D(this.container, {
            bomData: SDTD.components || [],
            onSelect: (componentID) => {
                this._handleSelect(componentID);
            }
        });

        this.viewer3d.init();

        await this.viewer3d.loadModel();

        this.loaded = true;

        console.log("3D Viewer loaded");
    },

    unload() {
        if (this.viewer3d) {
            this.viewer3d.destroy();
            this.viewer3d = null;
        }

        this.loaded = false;

        if (this.container) {
            this.container.style.display = 'none';
        }
    },

    focus(componentID) {
        if (!this.viewer3d || !this.loaded) return;
        this.viewer3d.focusComponent(componentID);
    },

    highlight(componentID) {
        if (!this.viewer3d || !this.loaded) return;
        this.viewer3d.highlightComponent(componentID);
    },

    clear() {
        if (!this.viewer3d || !this.loaded) return;
        this.viewer3d.clearHighlight();
    },

    isLoaded() {
        return this.loaded;
    },

    _handleSelect(componentID) {
        SelectionManager.select(componentID);
    }

};
