import * as THREE from "three";

export class AxesOverlay {

    constructor(container, camera) {
        this.container = container;
        this.camera = camera;
        this.canvas = null;
        this.ctx = null;
        this.size = 150;
        this.center = this.size / 2;
        this.len = 50;
        this.labelOffset = 1.2;
        this.lineWidth = 2.5;
        this.font = "bold 14px Arial";
        this.modelRotation = new THREE.Matrix4().makeRotationX(-Math.PI / 2);

        this.axes = [
            { name: "X", color: "#ff4444", dir: new THREE.Vector3(1, 0, 0).applyMatrix4(this.modelRotation) },
            { name: "Y", color: "#44cc44", dir: new THREE.Vector3(0, 1, 0).applyMatrix4(this.modelRotation) },
            { name: "Z", color: "#4488ff", dir: new THREE.Vector3(0, 0, 1).applyMatrix4(this.modelRotation) }
        ];
        this.animating = false;
        this._onCanvasClick = this._onCanvasClick.bind(this);
    }

    create() {
        this.canvas = document.createElement("canvas");
        this.canvas.width = this.size;
        this.canvas.height = this.size;
        this.canvas.style.cssText = "position:absolute;bottom:16px;right:16px;z-index:100;pointer-events:auto;cursor:pointer;background:rgba(255,255,255,0.9);border:1px solid #ccc;box-shadow:0 2px 6px rgba(0,0,0,0.2);";

        this.ctx = this.canvas.getContext("2d");
        this.container.appendChild(this.canvas);

        this.canvas.addEventListener("click", this._onCanvasClick);
    }

    _project(dir) {
        const viewMatrix = new THREE.Matrix4().lookAt(
            this.camera.position,
            new THREE.Vector3(0, 0, 0),
            this.camera.up
        );

        const projected = dir.clone().applyMatrix4(viewMatrix);

        return {
            x: projected.x,
            y: -projected.y,
            z: projected.z
        };
    }

    _onCanvasClick(e) {
        if (this.animating) return;

        const rect = this.canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left - this.center;
        const my = e.clientY - rect.top - this.center;

        let bestAxis = null;
        let bestScore = -Infinity;

        for (const axis of this.axes) {
            const p = this._project(axis.dir);
            const score = p.x * mx + p.y * my;
            if (score > bestScore) {
                bestScore = score;
                bestAxis = axis.name;
            }
        }

        if (bestAxis) {
            this._snapToAxis(bestAxis);
        }
    }

    _snapToAxis(axisName) {
        if (this.animating) return;

        const axisDirs = {
            "X": new THREE.Vector3(1, 0, 0),
            "Y": new THREE.Vector3(0, 1, 0),
            "Z": new THREE.Vector3(0, 0, 1)
        };

        const target = new THREE.Vector3(0, 0, 0);
        const dist = this.camera.position.distanceTo(target);
        const dir = axisDirs[axisName].clone();
        const cameraPos = target.clone().add(dir.multiplyScalar(dist));

        this._animateCamera(cameraPos, target);
    }

    _animateCamera(targetPos, targetLookAt) {
        this.animating = true;
        const startPos = this.camera.position.clone();
        const startTime = performance.now();
        const duration = 600;

        const animate = (time) => {
            const elapsed = time - startTime;
            const t = Math.min(elapsed / duration, 1);
            const ease = t < 0.5
                ? 4 * t * t * t
                : 1 - Math.pow(-2 * t + 2, 3) / 2;

            this.camera.position.lerpVectors(startPos, targetPos, ease);
            this.camera.lookAt(targetLookAt);

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                this.animating = false;
            }
        };

        requestAnimationFrame(animate);
    }

    update() {
        if (!this.ctx) return;

        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.size, this.size);

        const projected = this.axes.map(axis => ({
            name: axis.name,
            color: axis.color,
            p: this._project(axis.dir)
        }));

        projected.sort((a, b) => a.p.z - b.p.z);

        for (const axis of projected) {
            const ex = this.center + axis.p.x * this.len;
            const ey = this.center + axis.p.y * this.len;

            ctx.beginPath();
            ctx.moveTo(this.center, this.center);
            ctx.lineTo(ex, ey);
            ctx.strokeStyle = axis.color;
            ctx.lineWidth = this.lineWidth;
            ctx.stroke();

            const lx = this.center + axis.p.x * this.len * this.labelOffset;
            const ly = this.center + axis.p.y * this.len * this.labelOffset;

            ctx.fillStyle = axis.color;
            ctx.font = this.font;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(axis.name, lx, ly);
        }

        ctx.beginPath();
        ctx.arc(this.center, this.center, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#888";
        ctx.fill();
    }

    dispose() {
        if (this.canvas) {
            this.canvas.removeEventListener("click", this._onCanvasClick);
            if (this.canvas.parentNode) {
                this.canvas.parentNode.removeChild(this.canvas);
            }
        }
    }

}
