import * as THREE from "three";

export class AxesOverlay {

    constructor(container) {
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.axesScene = null;
        this.axesCamera = null;
        this.axesRenderer = null;
        this.size = 80;
    }

    create() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.size;
        this.canvas.height = this.size;
        this.canvas.style.cssText = 'position:absolute;bottom:10px;right:10px;z-index:100;pointer-events:none;';

        this.container.appendChild(this.canvas);

        this.axesScene = new THREE.Scene();

        this.axesCamera = new THREE.OrthographicCamera(-1.5, 1.5, 1.5, -1.5, 0.1, 100);
        this.axesCamera.position.set(0, 0, 3);
        this.axesCamera.lookAt(0, 0, 0);

        const lineMaterialX = new THREE.LineBasicMaterial({ color: 0xff4444 });
        const lineMaterialY = new THREE.LineBasicMaterial({ color: 0x44ff44 });
        const lineMaterialZ = new THREE.LineBasicMaterial({ color: 0x4444ff });

        const origin = new THREE.Vector3(0, 0, 0);

        const xAxisGeo = new THREE.BufferGeometry().setFromPoints([
            origin,
            new THREE.Vector3(1, 0, 0)
        ]);
        const yAxisGeo = new THREE.BufferGeometry().setFromPoints([
            origin,
            new THREE.Vector3(0, 1, 0)
        ]);
        const zAxisGeo = new THREE.BufferGeometry().setFromPoints([
            origin,
            new THREE.Vector3(0, 0, 1)
        ]);

        this.axesScene.add(new THREE.Line(xAxisGeo, lineMaterialX));
        this.axesScene.add(new THREE.Line(yAxisGeo, lineMaterialY));
        this.axesScene.add(new THREE.Line(zAxisGeo, lineMaterialZ));

        const labelCanvas = document.createElement('canvas');
        labelCanvas.width = 64;
        labelCanvas.height = 64;
        const labelCtx = labelCanvas.getContext('2d');

        const labels = [
            { text: 'X', color: '#ff4444', pos: [1.3, 0, 0] },
            { text: 'Y', color: '#44ff44', pos: [0, 1.3, 0] },
            { text: 'Z', color: '#4444ff', pos: [0, 0, 1.3] }
        ];

        for (const label of labels) {
            labelCtx.clearRect(0, 0, 64, 64);
            labelCtx.fillStyle = label.color;
            labelCtx.font = 'bold 48px Arial';
            labelCtx.textAlign = 'center';
            labelCtx.textBaseline = 'middle';
            labelCtx.fillText(label.text, 32, 32);

            const texture = new THREE.CanvasTexture(labelCanvas);
            const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
            const sprite = new THREE.Sprite(spriteMat);
            sprite.position.set(...label.pos);
            sprite.scale.set(0.5, 0.5, 0.5);
            this.axesScene.add(sprite);
        }

        this.axesRenderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true
        });
        this.axesRenderer.setPixelRatio(window.devicePixelRatio);
        this.axesRenderer.setSize(this.size, this.size);
        this.axesRenderer.setClearColor(0x000000, 0);
    }

    update(camera) {
        if (!this.axesRenderer || !this.axesScene || !this.axesCamera) return;

        const quat = camera.quaternion.clone();
        this.axesCamera.position.set(0, 0, 3);
        this.axesCamera.quaternion.copy(quat);
        this.axesCamera.updateProjectionMatrix();

        this.axesRenderer.render(this.axesScene, this.axesCamera);
    }

    dispose() {
        if (this.axesRenderer) {
            this.axesRenderer.dispose();
        }
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }

}
