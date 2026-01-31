import './poisson-disk-sampling.umd.js';

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

    const nearestPoints = []
    for (let i = 0; i < pointsBase.length; i++) {
        let nearestPoint = null;
        let nearestDistance = Infinity;
        for (let j = 0; j < points.length; j++) {
            if (Math.random() < .75) { continue; }
            const distance = Math.sqrt(Math.pow(points[j][0] - pointsBase[i][0], 2) + Math.pow(points[j][1] - pointsBase[i][1], 2));
            const pixelRedValue = distanceFunction(points[j], imageData);
            if (pixelRedValue < 1 && distance < nearestDistance) {
                nearestDistance = distance;
                nearestPoint = points[j];
            }
        }
        if (nearestPoint === null) {
            // fallback: push base point
            nearestPoints.push(pointsBase[i][0], pointsBase[i][1]);
        } else {
            nearestPoints.push(
                nearestPoint[0] - 250,
                nearestPoint[1] - 250
            );
        }
    }

    self.postMessage({ nearestPoints, index });
};
