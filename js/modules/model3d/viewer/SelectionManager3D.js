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
        this._pointerDownPos = null;
        this._onPointerDown = this.onPointerDown.bind(this);
        this._onPointerUp = this.onPointerUp.bind(this);
    }

    onPointerDown(event) {
        this._activePointers.add(event.pointerId);
        this._pointerDownPos = { x: event.clientX, y: event.clientY };
    }

    onPointerUp(event) {
        this._activePointers.delete(event.pointerId);

        if (this._activePointers.size > 1) return;
        if (!this.enabled) return;
        if (!this._pointerDownPos) return;

        const dx = event.clientX - this._pointerDownPos.x;
        const dy = event.clientY - this._pointerDownPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 10) return;

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
            const reference = hit.userData.reference || this.referenceIndex.extractReference(hit.name);

            if (reference && this.referenceIndex.references.has(reference) && this.onSelect) {
                this.onSelect(reference);
            }
        }

        this._pointerDownPos = null;
    }

    bindEvents(element) {
        element.addEventListener('pointerdown', this._onPointerDown);
        element.addEventListener('pointerup', this._onPointerUp);
        element.addEventListener('pointercancel', () => {
            this._activePointers.clear();
            this._pointerDownPos = null;
        });
    }

    dispose() {
        this.enabled = false;
        this._activePointers.clear();
        this._pointerDownPos = null;
    }

}
