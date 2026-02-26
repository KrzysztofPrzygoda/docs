// import './poisson-disk-sampling.umd.js';
// import PoissonDiskSampling from 'https://cdn.jsdelivr.net/npm/poisson-disk-sampling@2.3.1/+esm';
import PoissonDiskSampling from 'poisson-disk-sampling';

self.onmessage = function(e) {
    // Input from main thread: bitmap, base points, and density parameters.
    const { imageData, pointsBase, index, density, domainWidth = 500, domainHeight = 500 } = e.data;
    const centerX = domainWidth * 0.5;
    const centerY = domainHeight * 0.5;
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;

    // Fast pixel sampling: clamp to bitmap bounds + read red/alpha channels.
    // Returns "luminance on white" (0=dark, 1=white), used by the mask.
    const samplePixelValue = function(point) {
        const x = Math.max(0, Math.min(width - 1, point[0] | 0));
        const y = Math.max(0, Math.min(height - 1, point[1] | 0));
        const pixelIndex = (x + y * width) * 4;
        const red = data[pixelIndex] / 255;
        const alpha = data[pixelIndex + 3] / 255;
        return red * alpha + (1 - alpha);
    }

    const distanceFunction = function (point, imageData) {
        const pixel = samplePixelValue(point);
        return pixel * pixel * pixel;
    }

    const linearMap = (x, a, b, c, d) => {
        return ((x - a) * (d - c)) / (b - a) + c
    }

    const maxDistance = linearMap(density, 0, 300, 10, 50);
    const poissonDisk = new PoissonDiskSampling({
        shape: [domainWidth, domainHeight],
        minDistance: 1,
        maxDistance: maxDistance,
        tries: 20,
        distanceFunction: function (point) {
            return distanceFunction(point, imageData);
        }
    });
    const points = poissonDisk.fill();

    // Drop points from "empty" background to reduce nearest-search cost.
    const candidatePoints = [];
    for (let i = 0; i < points.length; i++) {
        if (distanceFunction(points[i], imageData) < 1) {
            candidatePoints.push(points[i]);
        }
    }
    const searchPoints = candidatePoints.length > 0 ? candidatePoints : points;

    // Spatial hash (grid buckets) speeds up nearest-point lookup.
    const gridSize = Math.max(4, Math.floor(maxDistance));
    const buckets = new Map();
    const getBucketKey = (x, y) => `${x}|${y}`;
    for (let i = 0; i < searchPoints.length; i++) {
        const point = searchPoints[i];
        const gx = Math.floor(point[0] / gridSize);
        const gy = Math.floor(point[1] / gridSize);
        const key = getBucketKey(gx, gy);
        if (!buckets.has(key)) buckets.set(key, []);
        buckets.get(key).push(point);
    }

    // Convert pointsBase (which may be centered around 0) back to image coords
    const pointsBaseAbs = pointsBase.map(p => [p[0] + centerX, p[1] + centerY]);
    const nearestPoints = [];
    for (let i = 0; i < pointsBaseAbs.length; i++) {
        let nearestPoint = null;
        let nearestDistanceSq = Infinity;
        const px = pointsBaseAbs[i][0];
        const py = pointsBaseAbs[i][1];
        const gx = Math.floor(px / gridSize);
        const gy = Math.floor(py / gridSize);

        // First check nearby buckets (growing ring) to avoid full scanning.
        for (let ring = 0; ring <= 4 && !nearestPoint; ring++) {
            for (let by = gy - ring; by <= gy + ring; by++) {
                for (let bx = gx - ring; bx <= gx + ring; bx++) {
                    const bucket = buckets.get(getBucketKey(bx, by));
                    if (!bucket) continue;
                    for (let j = 0; j < bucket.length; j++) {
                        const point = bucket[j];
                        const dx = point[0] - px;
                        const dy = point[1] - py;
                        const distanceSq = dx * dx + dy * dy;
                        if (distanceSq < nearestDistanceSq) {
                            nearestDistanceSq = distanceSq;
                            nearestPoint = point;
                        }
                    }
                }
            }
        }

        // Fallback: full scan only if nothing was found locally.
        if (!nearestPoint) {
            for (let j = 0; j < searchPoints.length; j++) {
                const point = searchPoints[j];
                const dx = point[0] - px;
                const dy = point[1] - py;
                const distanceSq = dx * dx + dy * dy;
                if (distanceSq < nearestDistanceSq) {
                    nearestDistanceSq = distanceSq;
                    nearestPoint = point;
                }
            }
        }


        if (nearestPoint === null) {
            // No candidate found: keep the base point (already centered).
            nearestPoints.push(pointsBase[i][0], pointsBase[i][1]);
        } else {
            // Convert from bitmap coordinates back to centered scene coordinates.
            nearestPoints.push(nearestPoint[0] - centerX, nearestPoint[1] - centerY);
        }
    }

    // Return the nearest-points map for the current texture/index.
    self.postMessage({ nearestPoints, index });
};
