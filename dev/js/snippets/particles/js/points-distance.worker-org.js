// import './poisson-disk-sampling.umd.js';
// import PoissonDiskSampling from 'https://cdn.jsdelivr.net/npm/poisson-disk-sampling@2.3.1/+esm';
import PoissonDiskSampling from 'poisson-disk-sampling';

self.onmessage = function(e) {
    const { imageData, pointsBase, index, density } = e.data;

    const distanceFunction = function (point, imageData) {
        const pixelRedIndex = (Math.round(point[0]) + Math.round(point[1]) * imageData.width) * 4;
        const pixel = imageData.data[pixelRedIndex] / 255;
        return pixel * pixel * pixel;
    }

    const linearMap = (x, a, b, c, d) => {
        return ((x - a) * (d - c)) / (b - a) + c
    }

    const maxDistance = linearMap(density, 0, 300, 10, 50);
    const poissonDisk = new PoissonDiskSampling({
        shape: [500, 500],
        minDistance: 1,
        maxDistance: maxDistance,
        tries: 20,
        distanceFunction: function (point) {
            return distanceFunction(point, imageData);
        }
    });
    const points = poissonDisk.fill();

    // Convert pointsBase (which may be centered around 0) back to image coords
    const pointsBaseAbs = pointsBase.map(p => [p[0] + 250, p[1] + 250]);
    const nearestPoints = [];
    for (let i = 0; i < pointsBaseAbs.length; i++) {
        let nearestPoint = null;
        let nearestDistance = Infinity;
        for (let j = 0; j < points.length; j++) {
            if (Math.random() < .75) { continue; }
            const dx = points[j][0] - pointsBaseAbs[i][0];
            const dy = points[j][1] - pointsBaseAbs[i][1];
            const distance = Math.sqrt(dx * dx + dy * dy);
            const pixelRedValue = distanceFunction(points[j], imageData);
            if (pixelRedValue < 1 && distance < nearestDistance) {
                nearestDistance = distance;
                nearestPoint = points[j];
            }
        }
        if (nearestPoint === null) {
            // fallback: push centered base point (original pointsBase was already centered)
            nearestPoints.push(pointsBase[i][0], pointsBase[i][1]);
        } else {
            // convert selected nearestPoint (image coords) to centered coords before posting
            nearestPoints.push(nearestPoint[0] - 250, nearestPoint[1] - 250);
        }
    }

    self.postMessage({ nearestPoints, index });
};
