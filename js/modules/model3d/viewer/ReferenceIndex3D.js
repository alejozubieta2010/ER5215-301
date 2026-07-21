export class ReferenceIndex3D {

    constructor() {
        this.bomLookup = new Set();
        this.overrideMap = new Map();
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

    loadOverrides(overrides) {
        this.overrideMap.clear();
        if (overrides && overrides.mappings) {
            for (const [key, value] of Object.entries(overrides.mappings)) {
                this.overrideMap.set(key, value);
            }
        }
    }

    build(root) {
        this.references.clear();
        this.nameToReference.clear();
        this.buildRecursive(root, null);
    }

    buildRecursive(node, inheritedRef) {
        let currentRef = inheritedRef;

        const name = node.name;
        if (name) {
            const resolvedRef = this.extractReference(name);
            if (resolvedRef) {
                currentRef = resolvedRef;
            }
        }

        if (node.isMesh && currentRef) {
            node.userData.reference = currentRef;
            this.nameToReference.set(name, currentRef);
            if (!this.references.has(currentRef)) {
                this.references.set(currentRef, new Set());
            }
            this.references.get(currentRef).add(name);
        }

        if (node.children) {
            for (const child of node.children) {
                this.buildRecursive(child, currentRef);
            }
        }
    }

    extractReference(name) {
        if (!name) return null;

        let current = name;

        const override1 = this.overrideMap.get(current);
        if (override1 && this.bomLookup.has(override1)) {
            return override1;
        }
        if (this.bomLookup.has(current)) {
            return current;
        }

        const stripped1 = current.replace(/:\d+$/, '');
        if (stripped1 !== current) {
            current = stripped1;
            const ov1 = this.overrideMap.get(current);
            if (ov1 && this.bomLookup.has(ov1)) {
                return ov1;
            }
            if (this.bomLookup.has(current)) {
                return current;
            }
        }

        const stripped2 = current.replace(/stp\d*/, '');
        if (stripped2 !== current) {
            current = stripped2;
            const ov2 = this.overrideMap.get(current);
            if (ov2 && this.bomLookup.has(ov2)) {
                return ov2;
            }
            if (this.bomLookup.has(current)) {
                return current;
            }
        }

        const stripped3 = current.replace(/[_-]\d+$/, '');
        if (stripped3 !== current) {
            current = stripped3;
            const ov3 = this.overrideMap.get(current);
            if (ov3 && this.bomLookup.has(ov3)) {
                return ov3;
            }
            if (this.bomLookup.has(current)) {
                return current;
            }
        }

        return null;
    }

    extractBaseRef(name) {
        if (!name) return null;

        let current = name;
        current = current.replace(/:\d+$/, '');
        current = current.replace(/stp\d*/, '');

        return current;
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
