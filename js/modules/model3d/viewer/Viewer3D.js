import * as THREE from "three";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { ReferenceIndex3D } from "./ReferenceIndex3D.js";
import { ModelIndex3D } from "./ModelIndex3D.js";
import { HighlightManager3D } from "./HighlightManager3D.js";
import { BomBuilder3D } from "./BomBuilder3D.js";
import { GLBLoader } from "./GLBLoader.js";
import { CameraAnimator } from "./CameraAnimator.js";
import { SelectionManager3D } from "./SelectionManager3D.js";
import { EventBus } from "../../../core/eventBus.js";

export class Viewer3D {

    constructor(container, options = {}) {
        this.container = container;
        this.modelPath = options.modelPath || "resources/models/ER5215-301.glb";
        this.hdrPath = options.hdrPath || "resources/hdr/white_studio_05_2k.hdr";
        this.bomData = options.bomData || [];
        this.onSelect = options.onSelect || null;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.modelRoot = null;

        this.referenceIndex = null;
        this.modelIndex = null;
        this.highlightManager = null;
        this.bomBuilder = null;
        this.glbLoader = null;
        this.cameraAnimator = null;
        this.selectionManager3D = null;

        this._onResize = this.onResize.bind(this);
        this._resizeObserver = null;
        this._animationId = null;
        this._destroyed = false;
        this._isResetting = false;
        this._postResetQuat = null;
    }

    init() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xffffff);

        const aspect = this.container.clientWidth / this.container.clientHeight;
        const frustumSize = 10;
        this.camera = new THREE.OrthographicCamera(
            -frustumSize * aspect / 2,
            frustumSize * aspect / 2,
            frustumSize / 2,
            -frustumSize / 2,
            0.1,
            1000
        );
        this.camera.position.set(5, 5, 10);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;

        this.container.appendChild(this.renderer.domElement);

        this.controls = new TrackballControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.85;
        this.controls.rotateSpeed = 2.0;
        this.controls.zoomSpeed = 1.2;

        this.controls.panSpeed = 0.8;
        this.controls.noRotate = false;
        this.controls.noZoom = false;
        this.controls.noPan = false;
        this.controls.update();

        this.referenceIndex = new ReferenceIndex3D();
        this.modelIndex = new ModelIndex3D();
        this.glbLoader = new GLBLoader(this.scene);
        this.cameraAnimator = new CameraAnimator(this.camera, this.controls, this.container);

        this.modelBoundingBox = null;

        this._resizeObserver = new ResizeObserver(() => this.onResize());
        this._resizeObserver.observe(this.container);

        window.addEventListener('resize', this._onResize);

        this.loadHDR();

        this.animate();
    }

    loadHDR() {
        const loader = new RGBELoader();
        loader.load(
            this.hdrPath,
            (texture) => {
                texture.mapping = THREE.EquirectangularReflectionMapping;
                this.scene.environment = texture;
                this.renderer.toneMappingExposure = 1.0;
            },
            undefined,
            () => {
                console.warn("HDR load failed, using fallback lighting");
                const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
                this.scene.add(ambientLight);
                const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
                dirLight.position.set(5, 10, 7);
                this.scene.add(dirLight);
            }
        );
    }

    async loadModel(path) {
        const modelPath = path || this.modelPath;

        this.referenceIndex.buildFromComponents(this.bomData);

        this.modelRoot = await this.glbLoader.load(modelPath);

        this.referenceIndex.build(this.modelRoot);

        this.modelIndex.build(this.modelRoot);

        this.highlightManager = new HighlightManager3D(this.scene, this.referenceIndex);

        this.bomBuilder = new BomBuilder3D(this.referenceIndex);

        this.selectionManager3D = new SelectionManager3D(
            this.camera,
            this.scene,
            this.referenceIndex,
            (ref) => {
                if (this.onSelect) {
                    this.onSelect(ref);
                }
            }
        );
        this.selectionManager3D.bindEvents(this.renderer.domElement);
        this.fitCameraToModel();

        this.collectNonBomMeshes(this.modelRoot);

        this.createExtraPartsButton();
        this.createHomeButton();

    }

    collectNonBomMeshes(root) {

        this.nonBomMeshes = [];

        const bomRefs = new Set(this.referenceIndex.getAllReferences());

        const hiddenRefs = new Set();
        for (const comp of this.bomData) {
            if (comp.visible3d === false) {
                hiddenRefs.add(comp.id);
            }
        }

        root.traverse((obj) => {

            if (!obj.isMesh) return;

            const ref = this.referenceIndex.nameToReference.get(obj.name);

            if (!ref || !bomRefs.has(ref) || hiddenRefs.has(ref)) {

                this.nonBomMeshes.push(obj);

            }

        });

    }



    createExtraPartsButton() {

        const btn = document.createElement("button");

        btn.textContent = "Ocultar piezas extra";

        btn.className = "viewer-toggle-btn";

        btn.addEventListener("click", () => {

            this.nonBomHidden = !this.nonBomHidden;

            this.nonBomMeshes.forEach(m => { m.visible = !this.nonBomHidden; });

            btn.textContent = this.nonBomHidden ? "Mostrar piezas extra" : "Ocultar piezas extra";

            EventBus.emit("extra-parts:toggled", { hidden: this.nonBomHidden });

        });

        this.container.appendChild(btn);

    }

    createHomeButton() {
        const btn = document.createElement("button");
        btn.className = "home-view-btn";
        btn.title = "Vista isométrica";
        btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
        </svg>`;
        btn.addEventListener("click", () => this.resetToHome());
        this.container.appendChild(btn);
    }

    resetToHome() {
        if (!this.homePosition || !this.homeTarget) return;

        const duration = 600;
        const startPos = this.camera.position.clone();
        const startTarget = this.controls.target.clone();
        const startQuat = this.camera.quaternion.clone();
        const startZoom = this.camera.zoom;
        const startTime = performance.now();

        this._isResetting = true;
        this.controls.enabled = false;

        const tmpQuat = new THREE.Quaternion();

        const animate = (time) => {
            const elapsed = time - startTime;
            const t = Math.min(elapsed / duration, 1);
            const ease = t < 0.5
                ? 4 * t * t * t
                : 1 - Math.pow(-2 * t + 2, 3) / 2;

            this.camera.position.lerpVectors(startPos, this.homePosition, ease);
            this.controls.target.lerpVectors(startTarget, this.homeTarget, ease);

            tmpQuat.slerpQuaternions(startQuat, this.homeQuaternion, ease);
            this.camera.quaternion.copy(tmpQuat);

            if (this.camera.isOrthographicCamera) {
                this.camera.zoom = startZoom + (this.homeZoom - startZoom) * ease;
                this.camera.updateProjectionMatrix();
            }

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                this.camera.position.copy(this.homePosition);
                this.camera.quaternion.copy(this.homeQuaternion);
                this.camera.zoom = this.homeZoom;
                this.camera.updateProjectionMatrix();

                if (this.modelRoot) {
                    this.modelRoot.rotation.set(Math.PI / 2, 0, Math.PI);
                }

                this.controls.dispose();
                this.controls = new TrackballControls(this.camera, this.renderer.domElement);
                this.controls.target.copy(this.homeTarget);
                this.controls.rotateSpeed = 2.0;
                this.controls.dampingFactor = 0.85;
                this.controls.enabled = true;
                this.camera.quaternion.copy(this.homeQuaternion);

                this._isResetting = false;
                this._postResetQuat = this.homeQuaternion.clone();

                const onPointerDown = (e) => {
                    this._dragStart = { x: e.clientX, y: e.clientY };
                    const onPointerMove = (e2) => {
                        const dx = e2.clientX - this._dragStart.x;
                        const dy = e2.clientY - this._dragStart.y;
                        if (Math.sqrt(dx * dx + dy * dy) > 5) {
                            this._postResetQuat = null;
                            window.removeEventListener('pointermove', onPointerMove);
                            window.removeEventListener('pointerup', onPointerUp);
                        }
                    };
                    const onPointerUp = () => {
                        window.removeEventListener('pointermove', onPointerMove);
                        window.removeEventListener('pointerup', onPointerUp);
                    };
                    window.addEventListener('pointermove', onPointerMove);
                    window.addEventListener('pointerup', onPointerUp);
                };
                this.renderer.domElement.addEventListener('pointerdown', onPointerDown);
                this._clearPostReset = onPointerDown;
            }
        };

        requestAnimationFrame(animate);
    }



    fitCameraToModel() {
        if (!this.modelRoot) return;

        const box = new THREE.Box3().setFromObject(this.modelRoot);
        const center = new THREE.Vector3();
        box.getCenter(center);
        const size = new THREE.Vector3();
        box.getSize(size);

        this.modelBoundingBox = { center: center.clone(), size: size.clone() };

        const maxDim = Math.max(size.x, size.y, size.z);
        const aspect = this.container.clientWidth / this.container.clientHeight;

        if (this.camera.isOrthographicCamera) {
            const halfHeight = maxDim * 0.6;
            const halfWidth = halfHeight * aspect;
            this.camera.left = -halfWidth;
            this.camera.right = halfWidth;
            this.camera.top = halfHeight;
            this.camera.bottom = -halfHeight;
            this.camera.updateProjectionMatrix();

            this.cameraAnimator.setDefaultZoom(this.camera.zoom);
            this.cameraAnimator.setModelSize(size);
            this.controls.minZoom = 0.3;
            this.controls.maxZoom = 10;
        }

        console.log("✔ Model dimensions:", {
            X: (size.x * 1000).toFixed(1) + " mm",
            Y: (size.y * 1000).toFixed(1) + " mm",
            Z: (size.z * 1000).toFixed(1) + " mm"
        });

        this.camera.position.set(
            center.x + size.x * 0.5,
            center.y + size.y * 0.8,
            center.z + size.z * 1.2
        );
        this.controls.target.copy(center);
        this.controls.update();

        this.homePosition = this.camera.position.clone();
        this.homeTarget = this.controls.target.clone();
        this.homeZoom = this.camera.zoom;
        this.homeQuaternion = this.camera.quaternion.clone();
        this.homeRotation = { x: Math.PI / 2, y: 0, z: Math.PI };
    }

    highlightComponent(bomId) {
        if (!this.highlightManager) return;
        this.highlightManager.highlightReferences([bomId], { clearPrevious: true });
    }

    clearHighlight() {
        if (!this.highlightManager) return;
        this.highlightManager.clearHighlight();
    }

    focusComponent(bomId) {
        if (!this.referenceIndex || !this.cameraAnimator) return;
        const meshNames = this.referenceIndex.getReferences(bomId);
        const meshes = this.referenceIndex.getMeshesByReferences([bomId], this.scene);
        if (meshes.length > 0) {
            this.cameraAnimator.focusComponent(meshes);
        }
    }

    onResize() {
        if (this._destroyed) return;

        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        if (width === 0 || height === 0) return;

        const aspect = width / height;

        if (this.camera.isOrthographicCamera) {
            const frustumSize = this.camera.top - this.camera.bottom;
            const halfHeight = frustumSize / 2;
            const halfWidth = halfHeight * aspect;
            this.camera.left = -halfWidth;
            this.camera.right = halfWidth;
            this.camera.updateProjectionMatrix();
        }

        this.renderer.setSize(width, height);
    }

    animate() {
        if (this._destroyed) return;

        this._animationId = requestAnimationFrame(() => this.animate());

        if (!this._isResetting) {
            this.controls.update();
        }

        if (this._postResetQuat) {
            this.camera.quaternion.copy(this._postResetQuat);
        }

        this.renderer.render(this.scene, this.camera);
    }

    destroy() {
        this._destroyed = true;

        if (this._animationId) {
            cancelAnimationFrame(this._animationId);
            this._animationId = null;
        }

        if (this._resizeObserver) {
            this._resizeObserver.disconnect();
            this._resizeObserver = null;
        }

        window.removeEventListener('resize', this._onResize);

        if (this.selectionManager3D) {
            this.selectionManager3D.dispose();
            this.selectionManager3D = null;
        }

        if (this.highlightManager) {
            this.highlightManager.clearHighlight();
            this.highlightManager = null;
        }

        if (this.controls) {
            this.controls.dispose();
            this.controls = null;
        }

        if (this._clearPostReset && this.renderer) {
            this.renderer.domElement.removeEventListener('pointerdown', this._clearPostReset);
        }

        this.nonBomMeshes = [];
        this.nonBomHidden = false;

        if (this.renderer) {
            this.renderer.dispose();
            if (this.renderer.domElement && this.renderer.domElement.parentNode) {
                this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
            }
            this.renderer = null;
        }

        this.scene = null;
        this.camera = null;
        this.modelRoot = null;
        this.referenceIndex = null;
        this.modelIndex = null;
        this.bomBuilder = null;
        this.cameraAnimator = null;
    }

}
