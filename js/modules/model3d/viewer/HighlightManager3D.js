import * as THREE from "three";

export class HighlightManager3D {

    constructor(scene, referenceIndex) {
        this.scene = scene;
        this.referenceIndex = referenceIndex;
        this.originalMaterials = new Map();
    }

    highlightReferences(bomIds, options = {}) {
        if (options.clearPrevious) {
            this.clearHighlight();
        }

        const ids = Array.isArray(bomIds) ? bomIds : [bomIds];
        const meshes = this.referenceIndex.getMeshesByReferences(ids, this.scene);

        this.highlightMeshes(meshes);
    }

    highlightMeshes(meshes) {
        for (const mesh of meshes) {
            this.applyHighlightMaterial(mesh);
        }
    }

    clearHighlight() {
        for (const [mesh, material] of this.originalMaterials) {
            mesh.material = material;
        }
        this.originalMaterials.clear();
    }

    applyHighlightMaterial(mesh) {
        if (!this.originalMaterials.has(mesh)) {
            this.originalMaterials.set(mesh, mesh.material);
        }

        const highlightMat = new THREE.MeshStandardMaterial({
            color: 0x00ff00,
            emissive: 0x003300,
            roughness: mesh.material.roughness || 0.5,
            metalness: mesh.material.metalness || 0.5,
            side: THREE.FrontSide,
            transparent: mesh.material.transparent || false,
            opacity: mesh.material.opacity !== undefined ? mesh.material.opacity : 1
        });

        mesh.material = highlightMat;
    }

    restoreMaterial(mesh) {
        if (this.originalMaterials.has(mesh)) {
            mesh.material = this.originalMaterials.get(mesh);
            this.originalMaterials.delete(mesh);
        }
    }

}
