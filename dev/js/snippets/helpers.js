/**
 * Create simple string hash.
 * 
 * @param {string} str - String to hash
 * @returns {string}
 */
function hash(str) {
    return str.split('').reduce((prev, curr) => (((prev << 5) - prev) + curr.charCodeAt(0)) | 0, 0);
}

/**
 * Hide element that matches selector.
 * 
 * @param {String} e - Selector or Element object.
 */
function hide(e) {
    e = (e instanceof Element) ? e : document.body.querySelector(e);
    if (e) e.style.display = 'none';
}

/**
 * Format string (sprintf alike).
 * 
 * @param  {string} s - String to format.
 * @param  {...any} args - 
 * @returns {string}
 */
function sf(s, ...args) {
    for (const arg of args) {
        if ('object' === typeof arg) {
            for (const prop in arg) {
                const a = s.includes(`%${prop}`) ? `%${prop}` : '%s';
                s = s.replace(a, arg[prop]);
            }
        } else {
            s = s.replace('%s', arg);
        }
    }    
    return s;
}
