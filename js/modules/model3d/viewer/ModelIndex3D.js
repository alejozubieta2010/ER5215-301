export class ModelIndex3D {

    constructor() {
        this.nameIndex = new Map();
        this.uuidIndex = new Map();
    }

    build(scene) {
        this.nameIndex.clear();
        this.uuidIndex.clear();

        const traverse = (node) => {
            if (node.isMesh) {
                this.uuidIndex.set(node.uuid, node);

                const name = node.name;
                if (!this.nameIndex.has(name)) {
                    this.nameIndex.set(name, []);
                }
                this.nameIndex.get(name).push(node);
            }

            if (node.children) {
                for (const child of node.children) {
                    traverse(child);
                }
            }
        };

        traverse(scene);
    }

    findByName(name) {
        return this.nameIndex.get(name) || [];
    }

    findByUUID(uuid) {
        return this.uuidIndex.get(uuid) || null;
    }

    findByNamePattern(pattern) {
        const regex = new RegExp(pattern);
        const results = [];

        for (const [name, meshes] of this.nameIndex) {
            if (regex.test(name)) {
                results.push(...meshes);
            }
        }

        return results;
    }

}
