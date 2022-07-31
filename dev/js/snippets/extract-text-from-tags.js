/**
 * Extract all texts from tags.
 */

const root = document.createElement('div');
root.innerHTML = "My name is <b>Bob</b>, I'm <b>20</b> years old, I like <b>programming</b>.";

// Tags inner text
let texts = [].map.call( root.querySelectorAll('b'), function( el ){
    return el.textContent || el.innerText || "";
});
console.log( texts ); // ['Bob', '20', 'programming']

// Tags included
texts = root.innerHTML.match(/<b>(.*?)<\/b>/g);
console.log( texts ); // ['<b>Bob</b>', '<b>20</b>', '<b>programming</b>']

/**
 * Extract text from one tag.
 */

const text = "<promo>Discsount code</promo>"
console.log( text.value.replace( /<\/?pramo>/g, '' ) ); // 'Discount code'