/**
 * Global variables can lead to naming conflicts and negatively impact code maintainability.
 * Instead, use closures or modules to encapsulate your code and limit variable scope.
 */

// Instead of global variables, use closures
(function () {
    let count = 0;

    function increment() {
        count++;
        console.log(count);
    }

    function decrement() {
        count--;
        console.log(count);
    }

    // Expose only necessary functions
    window.app = {
        increment: increment,
        decrement: decrement,
    };
})();

// Usage of the closure
app.increment(); // Output: 1
app.increment(); // Output: 2