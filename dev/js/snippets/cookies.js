/**
 * Get cookie value.
 * 
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie
 * 
 * @param {String} name - Cookie name.
 * @returns {String|undefined} - Coockie value.
 */
function cookie (name) {
    return document.cookie
        .split("; ")
        .find(row => row.startsWith(`${name}=`))
        ?.split("=")[1];
}