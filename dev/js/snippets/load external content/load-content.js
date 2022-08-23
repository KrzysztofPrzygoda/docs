!(function () {
	/**
	 * Load content into DOM element using modern JS fetch API.
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
	 * @see https://davidwalsh.name/fetch
	 * @see https://gomakethings.com/getting-html-with-fetch-in-vanilla-js/
	 *
	 * @param {String} url - Address for the content to fetch.
	 * @param {Element} element - DOM Element to load content into.
	 * @return {void}
	 */
	async function loadContentIntoElement( url, element ) {
		if ( ! url || ! element ) return;
		
		await fetch( url, {
			mode: 'cors', // Response requires header('Access-Control-Allow-Origin: *');
			cache: 'no-cache',
		})
		.then( ( response ) => response.text() )
		.then( ( content ) => {
			element.innerHTML = content;
		})
		.catch(( error ) => {
			console.error( 'Error: ', error );
		});
	}
	
	switch ( window.location.pathname ) {
		case '/panel/cms-texts.php':
			// Skip these pages
			return;
		
		default:
			const scriptName = 'load-content.js';
			const contentUrl = 'https://bitsmodo.com/idosell/cms/load-content.php';
			
			// Find this <script> tag
			const scriptElement = document.querySelector( 'script[src*="' + scriptName + '"]' );
			if ( ! scriptElement ) {
				console.error( 'Error:', scriptName, '<script> tag not found.' );
				return;
			}
			
			// Find this <script> tag parent
			const contentElement = scriptElement.parentElement;
			if ( ! contentElement ) {
				console.error( 'Error:', scriptName, '<script> tag parent element not found.' );
				return;
			}
			
			loadContentIntoElement( contentUrl, contentElement );
	}
})();