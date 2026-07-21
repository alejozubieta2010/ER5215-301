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

        this._onPointerDown = this.onPointerDown.bind(this);
    }

    onPointerDown(event) {
        if (!this.enabled) return;

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
    }

    bindEvents(element) {
        element.addEventListener('pointerdown', this._onPointerDown);
    }

    dispose() {
        this.enabled = false;
    }

}
