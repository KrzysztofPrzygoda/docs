import * as THREE from "https://unpkg.com/three@0.180.0/build/three.module.js";
const { Vector2 } = THREE;

/**
 * Mouse Tracker Class
 * Tracks mouse movement and screen size.
 */
export class MouseTracker {
    constructor() {
        this.cursor = new Vector2();
        this.initEvents();
        window.__debugMouse = this;
        this.screenWidth = window.innerWidth;
        this.screenHeight = window.innerHeight;
        this.update();
    }
    initEvents() {
        window.addEventListener("mousemove", e => {
            this.onMouseMove(e);
        });
        window.addEventListener("resize", () => {
            this.screenWidth = window.innerWidth;
            this.screenHeight = window.innerHeight;
        });
    }
    onMouseMove(e) {
        this.cursor.x = e.clientX;
        this.cursor.y = e.clientY;
    }
    update() {
        requestAnimationFrame(() => {
            this.update();
        });
    }
}

export default MouseTracker;