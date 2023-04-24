/**
 * Merge deeply two objects' with nested properties.
 * 
 * @param {Object} targetObject Original object.
 * @param {Object} sourceObject Additional object.
 * @returns {Object}
 */
function merge(targetObject = {}, sourceObject = {}) {
    // Clone the source and target objects to avoid the mutation.
    const target = JSON.parse(JSON.stringify(targetObject));
    const source = JSON.parse(JSON.stringify(sourceObject));

    // Iterate through all the keys of source object.
    Object.keys(source).forEach(key => {
        if ("object" === typeof source[key] && !Array.isArray(source[key])) {
            // If property has nested object, call the function recursively.
            target[key] = this.merge(target[key], source[key]);
        } else {
            // Merge the object source to the target.
            target[key] = source[key];
        }
    });

    return target;
}

let a = {
    a: 'aa',
    b: 'ab',
    c: 'ac',
    d: {
        e: 'ae',
        g: [1, 2, 3]
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
console.log('Shallow:', c);

// Deep merge
c = merge(a, b);
console.log('Deep:', c);