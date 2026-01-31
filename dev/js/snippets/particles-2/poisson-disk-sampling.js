// Minimal Poisson Disk Sampling (Bridson) - fixed-density implementation
export class PoissonDiskSampling {
    constructor(options, rng) {
        this.shape = options.shape || [500, 500];
        this.minDistance = options.minDistance || 2;
        this.maxDistance = options.maxDistance || this.minDistance * 2;
        this.maxTries = Math.max(1, Math.floor(options.tries || 30));
        this.rng = rng || Math.random;
        this.dimension = 2;
        this.cellSize = this.minDistance / Math.SQRT2;
        this.cols = Math.ceil(this.shape[0] / this.cellSize);
        this.rows = Math.ceil(this.shape[1] / this.cellSize);
        this.grid = new Array(this.cols * this.rows).fill(null);
        this.samples = [];
        this.processList = [];
    }

    _gridIndex(x, y) {
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return -1;
        return col + row * this.cols;
    }

    _inNeighbourhood(x, y) {
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        const r = 2; // check neighbours within 2 cells
        const minDistSq = this.minDistance * this.minDistance;
        for (let i = Math.max(0, col - r); i <= Math.min(this.cols - 1, col + r); i++) {
            for (let j = Math.max(0, row - r); j <= Math.min(this.rows - 1, row + r); j++) {
                const idx = i + j * this.cols;
                const p = this.grid[idx];
                if (p) {
                    const dx = p[0] - x;
                    const dy = p[1] - y;
                    if (dx * dx + dy * dy < minDistSq) return true;
                }
            }
        }
        return false;
    }

    addRandomPoint() {
        const x = this.rng() * this.shape[0];
        const y = this.rng() * this.shape[1];
        return this._directAddPoint([x, y]);
    }

    _directAddPoint(point) {
        this.processList.push(point);
        this.samples.push(point);
        const idx = this._gridIndex(point[0], point[1]);
        if (idx >= 0) this.grid[idx] = point;
        return point;
    }

    next() {
        if (this.processList.length === 0) return null;
        const idx = Math.floor(this.rng() * this.processList.length);
        const point = this.processList[idx];
        let found = false;
        for (let t = 0; t < this.maxTries; t++) {
            const radius = this.minDistance + (this.maxDistance - this.minDistance) * this.rng();
            const angle = 2 * Math.PI * this.rng();
            const nx = point[0] + Math.cos(angle) * radius;
            const ny = point[1] + Math.sin(angle) * radius;
            if (nx >= 0 && nx < this.shape[0] && ny >= 0 && ny < this.shape[1] && !this._inNeighbourhood(nx, ny)) {
                this._directAddPoint([nx, ny]);
                found = true;
                break;
            }
        }
        if (!found) this.processList.splice(idx, 1);
        return found ? this.samples[this.samples.length - 1] : null;
    }

    fill() {
        if (this.samples.length === 0) this.addRandomPoint();
        while (this.next()) {}
        return this.samples;
    }
}

export default PoissonDiskSampling;
