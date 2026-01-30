/**
 * Caching is an effective way to store and retrieve data to avoid redundant computations or API calls.
 * Object literals can serve as a simple caching mechanism in JavaScript.
 * @param {*} input 
 * @returns 
 */
function heavyComputation(input) {
    if (!heavyComputation.cache) {
        heavyComputation.cache = {};
    }

    if (input in heavyComputation.cache) {
        console.log("Fetching from cache...");
        return heavyComputation.cache[input];
    }

    // Perform heavy computation here
    const result = input * 2;

    // Cache the result
    heavyComputation.cache[input] = result;
    return result;
}

console.log(heavyComputation(5)); // Output: 10 (not fetched from cache)
console.log(heavyComputation(5)); // Output: 10 (fetched from cache)
