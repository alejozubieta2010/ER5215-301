/* ==========================================================
   SDTD ENGINE
   SVG Pan/Zoom
   Touch-friendly pan & pinch-to-zoom for SVG viewer
   Applies CSS transforms to the SVG object element.
   Works on both touch and mouse (scroll wheel).
========================================================== */

export const SVGPanZoom = {

    container: null,
    svgObject: null,

    scale: 1,
    minScale: 0.5,
    maxScale: 5,
    panX: 0,
    panY: 0,

    // Touch tracking
    _isPanning: false,
    _startX: 0,
    _startY: 0,
    _lastPanX: 0,
    _lastPanY: 0,

    // Pinch tracking
    _isPinching: false,
    _pinchStartDist: 0,
    _pinchStartScale: 1,

    // Mouse drag (desktop)
    _isDragging: false,
    _dragStartX: 0,
    _dragStartY: 0,

    /**
     * Initialize pan/zoom on the SVG viewer container.
     * @param {HTMLElement} containerEl - The #viewer-container element
     * @param {HTMLObjectElement} svgObj - The <object> SVG element
     */
    initialize(containerEl, svgObj) {
        if (!containerEl || !svgObj) return;

        this.container = containerEl;
        this.svgObject = svgObj;

        // Ensure container allows overflow and captures events
        this.container.style.overflow = "hidden";
        this.container.style.touchAction = "none";
        this.container.style.cursor = "grab";

        // Pointer events on the container
        this.container.addEventListener("pointerdown", e => this._onPointerDown(e));
        this.container.addEventListener("pointermove", e => this._onPointerMove(e));
        this.container.addEventListener("pointerup", e => this._onPointerUp(e));
        this.container.addEventListener("pointercancel", e => this._onPointerUp(e));
        this.container.addEventListener("pointerleave", e => this._onPointerUp(e));

        // Mouse wheel for zoom on desktop
        this.container.addEventListener("wheel", e => this._onWheel(e), { passive: false });

        // Double-tap / double-click to reset
        this.container.addEventListener("dblclick", e => this._onDoubleClick(e));

        console.log("✔ SVG Pan/Zoom initialized");
    },

    /* ==========================================================
       POINTER EVENTS (unified touch + mouse)
    ========================================================== */

    _activePointers: new Map(),

    _onPointerDown(event) {
        this._activePointers.set(event.pointerId, {
            x: event.clientX,
            y: event.clientY
        });

        if (this._activePointers.size === 1) {
            // Single pointer — start pan
            this._isPanning = true;
            this._lastPanX = this.panX;
            this._lastPanY = this.panY;
            this._startX = event.clientX;
            this._startY = event.clientY;
            this.container.style.cursor = "grabbing";
        } else if (this._activePointers.size === 2) {
            // Two pointers — start pinch
            this._isPanning = false;
            this._isPinching = true;
            this._pinchStartDist = this._getPinchDistance();
            this._pinchStartScale = this.scale;
        }

        // Prevent default to stop browser from scrolling/zooming
        event.preventDefault();
    },

    _onPointerMove(event) {
        if (!this._activePointers.has(event.pointerId)) return;

        // Update tracked position
        this._activePointers.set(event.pointerId, {
            x: event.clientX,
            y: event.clientY
        });

        if (this._isPinching && this._activePointers.size === 2) {
            // Pinch zoom
            const currentDist = this._getPinchDistance();
            const ratio = currentDist / this._pinchStartDist;
            const newScale = Math.min(this.maxScale, Math.max(this.minScale, this._pinchStartScale * ratio));
            this.scale = newScale;
            this._applyTransform();
        } else if (this._isPanning && this._activePointers.size === 1) {
            // Pan
            const dx = event.clientX - this._startX;
            const dy = event.clientY - this._startY;
            this.panX = this._lastPanX + dx;
            this.panY = this._lastPanY + dy;
            this._applyTransform();
        }
    },

    _onPointerUp(event) {
        this._activePointers.delete(event.pointerId);

        if (this._activePointers.size < 2) {
            this._isPinching = false;
        }

        if (this._activePointers.size === 0) {
            this._isPanning = false;
            this.container.style.cursor = "grab";
        }
    },

    /* ==========================================================
       PINCH DISTANCE
    ========================================================== */

    _getPinchDistance() {
        const pointers = Array.from(this._activePointers.values());
        if (pointers.length < 2) return 0;
        const dx = pointers[0].x - pointers[1].x;
        const dy = pointers[0].y - pointers[1].y;
        return Math.sqrt(dx * dx + dy * dy);
    },

    /* ==========================================================
       MOUSE WHEEL ZOOM
    ========================================================== */

    _onWheel(event) {
        event.preventDefault();

        const delta = event.deltaY > 0 ? -0.1 : 0.1;
        const newScale = Math.min(this.maxScale, Math.max(this.minScale, this.scale + delta));

        // Zoom toward mouse position
        const rect = this.container.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const scaleChange = newScale / this.scale;
        this.panX = mouseX - (mouseX - this.panX) * scaleChange;
        this.panY = mouseY - (mouseY - this.panY) * scaleChange;
        this.scale = newScale;

        this._applyTransform();
    },

    /* ==========================================================
       DOUBLE TAP / DOUBLE CLICK — RESET
    ========================================================== */

    _onDoubleClick(event) {
        event.preventDefault();
        this.reset();
    },

    /* ==========================================================
       APPLY TRANSFORM
    ========================================================== */

    _applyTransform() {
        if (!this.svgObject) return;
        this.svgObject.style.transformOrigin = "0 0";
        this.svgObject.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.scale})`;
    },

    /* ==========================================================
       PUBLIC API
    ========================================================== */

    reset() {
        this.scale = 1;
        this.panX = 0;
        this.panY = 0;
        this._applyTransform();
    },

    setScale(newScale) {
        this.scale = Math.min(this.maxScale, Math.max(this.minScale, newScale));
        this._applyTransform();
    },

    fitToContainer() {
        if (!this.container || !this.svgObject) return;
        // Reset to fill container
        this.reset();
    },

    dispose() {
        if (this.container) {
            this.container.style.touchAction = "";
            this.container.style.cursor = "";
        }
        this._activePointers.clear();
        this._isPanning = false;
        this._isPinching = false;
    }

};
