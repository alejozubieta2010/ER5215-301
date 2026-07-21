import * as THREE from "three";

export class CameraAnimator {

    constructor(camera, controls, container) {
        this.camera = camera;
        this.controls = controls;
        this.container = container;
        this.defaultPosition = camera.position.clone();
        this.defaultTarget = controls.target.clone();
        this.defaultZoom = camera.zoom;
        this.animating = false;
        this.modelSize = null;
    }

    setDefaultZoom(zoom) {
        this.defaultZoom = zoom;
    }

    setModelSize(size) {
        this.modelSize = size.clone();
    }

    focusComponent(meshes, options = {}) {
        if (!meshes || meshes.length === 0) return;

        const duration = options.duration || 800;

        const box = new THREE.Box3();
        for (const mesh of meshes) {
            box.expandByObject(mesh);
        }

        const center = new THREE.Vector3();
        box.getCenter(center);

        const size = new THREE.Vector3();
        box.getSize(size);

        const maxDim = Math.max(size.x, size.y, size.z);

        const direction = new THREE.Vector3();
        direction.subVectors(this.camera.position, this.controls.target).normalize();

        const targetPosition = new THREE.Vector3();

        if (this.camera.isOrthographicCamera) {
            const aspect = this.container
                ? this.container.clientWidth / this.container.clientHeight
                : 1;

            let halfHeight = maxDim * 2;

            if (this.modelSize) {
                const modelMax = Math.max(this.modelSize.x, this.modelSize.y, this.modelSize.z);
                const maxAllowed = modelMax * 0.5;
                halfHeight = Math.min(halfHeight, maxAllowed);
                halfHeight = Math.max(halfHeight, modelMax * 0.05);
            }

            const halfWidth = halfHeight * aspect;
            this.camera.left = -halfWidth;
            this.camera.right = halfWidth;
            this.camera.top = halfHeight;
            this.camera.bottom = -halfHeight;
            this.camera.updateProjectionMatrix();

            targetPosition.copy(center).add(direction.multiplyScalar(maxDim * 2));
        } else {
            const fov = this.camera.fov * (Math.PI / 180);
            let dist = maxDim / (2 * Math.tan(fov / 2));
            dist *= 2;
            targetPosition.copy(center).add(direction.multiplyScalar(dist));
        }

        this.animateTo(targetPosition, center, this.camera.zoom, duration);
    }

    animateTo(targetPosition, targetLookAt, targetZoom, duration) {
        if (this.animating) return;
        this.animating = true;

        const startPosition = this.camera.position.clone();
        const startTarget = this.controls.target.clone();
        const startZoom = this.camera.zoom;
        const startTime = performance.now();

        const animate = (time) => {
            const elapsed = time - startTime;
            const t = Math.min(elapsed / duration, 1);
            const ease = t < 0.5
                ? 4 * t * t * t
                : 1 - Math.pow(-2 * t + 2, 3) / 2;

            this.camera.position.lerpVectors(startPosition, targetPosition, ease);
            this.controls.target.lerpVectors(startTarget, targetLookAt, ease);

            if (this.camera.isOrthographicCamera) {
                this.camera.zoom = startZoom + (targetZoom - startZoom) * ease;
                this.camera.updateProjectionMatrix();
            }

            this.controls.update();

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                this.animating = false;
            }
        };

        requestAnimationFrame(animate);
    }

    clearFocus() {
        const duration = 600;
        this.animateTo(
            this.defaultPosition.clone(),
            this.defaultTarget.clone(),
            this.defaultZoom,
            duration
        );
    }

}
