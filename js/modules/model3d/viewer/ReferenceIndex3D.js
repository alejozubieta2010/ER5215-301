export class ReferenceIndex3D {

    constructor() {
        this.bomLookup = new Set();
        this.references = new Map();
        this.nameToReference = new Map();
    }

    buildFromComponents(components) {
        this.bomLookup.clear();
        for (const comp of components) {
            if (comp.id) {
                this.bomLookup.add(comp.id);
            }
        }
    }

    build(root) {
        this.references.clear();
        this.nameToReference.clear();
        this.buildRecursive(root, null);
        console.log("✔ ReferenceIndex3D:", this.references.size, "components tagged,", [...this.references.values()].reduce((a, s) => a + s.size, 0), "meshes");
    }

    buildRecursive(node, inheritedRef) {
        let currentRef = inheritedRef;

        if (node.name) {
            const pn = node.name.replace(/\.?stp$/i, '').trim();
            if (this.bomLookup.has(pn)) {
                currentRef = pn;
            }
        }

        if (node.isMesh && currentRef) {
            node.userData.reference = currentRef;
            if (node.name) {
                this.nameToReference.set(node.name, currentRef);
            }
            if (!this.references.has(currentRef)) {
                this.references.set(currentRef, new Set());
            }
            this.references.get(currentRef).add(node.name);
        }

        if (node.children) {
            for (const child of node.children) {
                this.buildRecursive(child, currentRef);
            }
        }
    }

    extractReference(name) {
        if (!name) return null;
        const pn = name.replace(/\.?stp$/i, '').trim();
        if (this.bomLookup.has(pn)) return pn;
        return null;
    }

    getReferences(bomId) {
        return this.references.get(bomId) || new Set();
    }

    getAllReferences() {
        return [...this.references.keys()];
    }

    getMeshesByReferences(references, root) {
        const meshSet = new Set(references);
        const result = [];

        const traverse = (node) => {
            if (node.isMesh && node.userData.reference && meshSet.has(node.userData.reference)) {
                result.push(node);
            }
            if (node.children) {
                for (const child of node.children) {
                    traverse(child);
                }
            }
        };

        traverse(root);
        return result;
    }

}
