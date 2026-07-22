import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export class GLBLoader {

    constructor(scene) {
        this.scene = scene;
        this.loader = new GLTFLoader();
        this.modelRoot = null;
    }

    load(path) {
        return new Promise((resolve, reject) => {
            this.loader.load(
                path,
                (gltf) => {
                    this.modelRoot = gltf.scene;

                    this.modelRoot.rotation.set(Math.PI / 2, 0, Math.PI);

                    this.applyFrontSide(this.modelRoot);

                    this.applyTranslucency(this.modelRoot, 'AR112-037');

                    this.scene.add(this.modelRoot);

                    resolve(this.modelRoot);
                },
                undefined,
                (error) => {
                    reject(error);
                }
            );
        });
    }

    applyFrontSide(root) {
        const traverse = (node) => {
            if (node.isMesh && node.material) {
                if (Array.isArray(node.material)) {
                    node.material = node.material.map(mat => {
                        const clone = mat.clone();
                        clone.side = THREE.FrontSide;
                        return clone;
                    });
                } else {
                    const clone = node.material.clone();
                    clone.side = THREE.FrontSide;
                    node.material = clone;
                }
            }
            if (node.children) {
                for (const child of node.children) {
                    traverse(child);
                }
            }
        };
        traverse(root);
    }

    applyTranslucency(root, groupName) {
        const traverse = (node) => {
            if (node.isMesh && node.material) {
                const ref = node.userData.reference;
                if (ref === groupName) {
                    if (Array.isArray(node.material)) {
                        node.material = node.material.map(mat => {
                            const clone = mat.clone();
                            clone.transparent = true;
                            clone.opacity = 0.3;
                            clone.side = THREE.DoubleSide;
                            return clone;
                        });
                    } else {
                        const clone = node.material.clone();
                        clone.transparent = true;
                        clone.opacity = 0.3;
                        clone.side = THREE.DoubleSide;
                        node.material = clone;
                    }
                }
            }
            if (node.children) {
                for (const child of node.children) {
                    traverse(child);
                }
            }
        };
        traverse(root);
    }

}
