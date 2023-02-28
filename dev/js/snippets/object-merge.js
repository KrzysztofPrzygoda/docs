/**
 * Merge deep two objects' properies.
 * 
 * @param {Object} obj1
 * @param {Object} obj2
 * @returns {Object}
 */
function merge (obj1, obj2) {
    // Create a new object that combines the properties of both input objects
    const merged = {
        ...obj1,
        ...obj2
    };

    // Loop through the properties of the merged object
    for (const key of Object.keys(merged)) {
        // Check if the property is an object
        if (typeof merged[key] === 'object' && merged[key] !== null) {
            // If the property is an object, recursively merge the objects
            merged[key] = merge(obj1[key], obj2[key]);
        }
    }

    return merged;
}

let a = {
    a: 'aa',
    b: 'ab',
    c: 'ac',
    d: {
        e: 'ae'
    }
}

let b = {
    a: 'ba',
    // b: 'bb',
    c: 'bc',
    d: {
        // e: 'be',
        f: 'bf'
    }
}

// Shallow merge
let c = { ...a, ...b };
console.error(c);

// Deep merge
c = merge(a, b);
console.error(c);