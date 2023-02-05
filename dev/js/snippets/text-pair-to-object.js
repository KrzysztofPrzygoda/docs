/**
 * Convert text pair to object.
 * @param {string} text - A multiline key=value text.
 * @returns {Object} - Returns {key: value} object.
 */
function textPairToObject(text = '') {
    let pairArray = text.trim().split('\n').map(e => e.split('='));
    return Object.fromEntries(pairArray);
}

// Example usage.
async function getIpInfoFromCloudflare() {
    let dataText = await fetch('https://www.cloudflare.com/cdn-cgi/trace').then(r => r.text());
    return textPairToObject(dataText);
}
getIpInfoFromCloudflare().then(console.log);