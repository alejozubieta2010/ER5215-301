export class BomBuilder3D {

    constructor(referenceIndex) {
        this.referenceIndex = referenceIndex;
    }

    build(scene, bomData) {
        const bomMap = new Map();
        for (const entry of bomData) {
            bomMap.set(entry.id, entry);
        }

        const tree = {
            name: scene.name || 'Scene',
            children: [],
            meshes: [],
            bomEntry: null
        };

        this.buildRecursive(scene, bomData, bomMap, tree);

        return tree;
    }

    buildRecursive(node, bomData, bomMap, treeNode) {
        if (node.isMesh) {
            const ref = node.userData.reference;
            const bomEntry = ref ? bomMap.get(ref) || null : null;

            treeNode.meshes.push({
                name: node.name,
                uuid: node.uuid,
                reference: ref,
                bomEntry: bomEntry
            });
        }

        if (node.children) {
            for (const child of node.children) {
                const childNode = {
                    name: child.name,
                    children: [],
                    meshes: [],
                    bomEntry: null
                };

                if (child.isMesh) {
                    const ref = child.userData.reference;
                    childNode.bomEntry = ref ? bomMap.get(ref) || null : null;
                }

                this.buildRecursive(child, bomData, bomMap, childNode);

                if (childNode.children.length > 0 || childNode.meshes.length > 0) {
                    treeNode.children.push(childNode);
                }
            }
        }
    }

}
