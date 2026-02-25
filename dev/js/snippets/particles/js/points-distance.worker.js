// import './poisson-disk-sampling.umd.js';
// import PoissonDiskSampling from 'https://cdn.jsdelivr.net/npm/poisson-disk-sampling@2.3.1/+esm';
import PoissonDiskSampling from 'poisson-disk-sampling';

self.onmessage = function(e) {
    const { imageData, pointsBase, index, density, domainWidth = 500, domainHeight = 500 } = e.data;
    const centerX = domainWidth * 0.5;
    const centerY = domainHeight * 0.5;

    const distanceFunction = function (point, imageData) {
        const pixelRedIndex = (Math.round(point[0]) + Math.round(point[1]) * imageData.width) * 4;
        if (pixelRedIndex < 0 || pixelRedIndex + 3 >= imageData.data.length) {
            return 1;
        }
        const red = imageData.data[pixelRedIndex] / 255;
        const alpha = imageData.data[pixelRedIndex + 3] / 255;
        const pixel = red * alpha + (1 - alpha);
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

    // Convert pointsBase (which may be centered around 0) back to image coords
    const pointsBaseAbs = pointsBase.map(p => [p[0] + centerX, p[1] + centerY]);
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
            nearestPoints.push(nearestPoint[0] - centerX, nearestPoint[1] - centerY);
        }
    }

    self.postMessage({ nearestPoints, index });
};
