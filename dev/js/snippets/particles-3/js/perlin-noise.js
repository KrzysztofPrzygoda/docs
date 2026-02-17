/**
 * 1D Perlin Noise Class
 * It generates smooth noise values for a given 1D input.
 * Used here to create smooth variations in particle properties.
 */
export class PerlinNoise1D {
    constructor() {
        this.MAX_VERTICES = 256;
        this.MAX_VERTICES_MASK = this.MAX_VERTICES - 1;
        this.amplitude = 1;
        this.scale = 1;
        this.randoms = [];
        for (let i = 0; i < this.MAX_VERTICES; ++i) {
            this.randoms.push(Math.random());
        }
    }
    getValue(x) {
        let scaledX = x * this.scale;
        let xFloor = Math.floor(scaledX);
        let t = scaledX - xFloor;
        let fade = t * t * (3 - 2 * t);
        let idx0 = xFloor % this.MAX_VERTICES_MASK;
        let idx1 = (idx0 + 1) % this.MAX_VERTICES_MASK;
        let lerped = this.lerp(this.randoms[idx0], this.randoms[idx1], fade);
        return lerped * this.amplitude;
    }
    lerp(a, b, t) {
        return a * (1 - t) + b * t;
    }
}

export default PerlinNoise1D;