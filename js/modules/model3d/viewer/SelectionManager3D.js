import * as THREE from "three";

export class SelectionManager3D {

    constructor(camera, scene, referenceIndex, onSelect) {
        this.camera = camera;
        this.scene = scene;
        this.referenceIndex = referenceIndex;
        this.onSelect = onSelect;
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();
        this.enabled = true;

        this._activePointers = new Set();
        this._onPointerDown = this.onPointerDown.bind(this);
        this._onPointerUp = this.onPointerUp.bind(this);
    }

    onPointerDown(event) {
        this._activePointers.add(event.pointerId);

        // Ignore selection during multi-touch (pinch-to-zoom)
        if (this._activePointers.size > 1) return;

        if (!this.enabled) return;

        // Delay selection slightly to detect multi-touch
        this._selectTimer = setTimeout(() => {
            if (this._activePointers.size > 1) return;

            const rect = event.target.getBoundingClientRect();
            this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            this.raycaster.setFromCamera(this.pointer, this.camera);

            const meshes = [];
            const traverse = (node) => {
                if (node.isMesh) {
                    meshes.push(node);
                }
                if (node.children) {
                    for (const child of node.children) {
                        traverse(child);
                    }
                }
            };
            traverse(this.scene);

            const intersects = this.raycaster.intersectObjects(meshes, false);

            if (intersects.length > 0) {
                const hit = intersects[0].object;
                const reference = this.referenceIndex.extractReference(hit.name);

                if (reference && this.referenceIndex.references.has(reference) && this.onSelect) {
                    this.onSelect(reference);
                }
            }
        }, 150);
    }

    onPointerUp(event) {
        this._activePointers.delete(event.pointerId);

        if (this._activePointers.size === 0 && this._selectTimer) {
            clearTimeout(this._selectTimer);
            this._selectTimer = null;
        }
    }

    bindEvents(element) {
        element.addEventListener('pointerdown', this._onPointerDown);
        element.addEventListener('pointerup', this._onPointerUp);
        element.addEventListener('pointercancel', this._onPointerUp);
    }

    dispose() {
        this.enabled = false;
        this._activePointers.clear();
        if (this._selectTimer) {
            clearTimeout(this._selectTimer);
        }
    }

}
