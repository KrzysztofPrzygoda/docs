!(function (page = '') {
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
	async function loadContentIntoElement(url, element) {
		if (!url || !element) return;

		await fetch(url, {
			mode: 'cors', // Response requires header('Access-Control-Allow-Origin: *');
			cache: 'no-cache',
		})
			.then((response) => response.text())
			.then((content) => {
				// Insert HTML with scripts execution using Range.
				const documentFragment = document.createRange().createContextualFragment(content);
				element.replaceChildren(documentFragment);
			})
			.catch((error) => {
				console.error('Error: ', error);
			});
	}

	switch (window.location.pathname) {
		case '/panel/cms-texts.php':
			// Skip these pages.
			return;

		default:
			// Find this <script> tag.
			const scriptElement = document.currentScript;
			if (!scriptElement) {
				console.error('Error:', '<script> tag not found.');
				return;
			}

            // Find this <script> URL path.
            const scriptUrl = scriptElement.getAttribute("src");
            if (!scriptUrl) {
				console.error('Error:', '<script> tag src attribute URL not found.');
				return;
			}

			// Find this <script> tag parent.
			const contentElement = scriptElement.parentElement;
			// const contentElement = document.getElementById('external');
			if (!contentElement) {
				console.error('Error:', scriptName, '<script> tag parent element not found.');
				return;
			}

            // Prepare content URL.
            // URL query param content takes precedence over data-content attribute.
			const urlParams = new URLSearchParams(window.location.search);
			contentId = urlParams.get('content') ?? scriptElement.dataset.content;

            // Attribute data-url takes precedence over default content location (same as this script).
            let contentUrl = scriptElement.dataset.url ?? scriptUrl.substring(0, scriptUrl.lastIndexOf('/') + 1);
			contentUrl = contentUrl + 'load-content.php' + (contentId ? '?content=' + contentId : '');

            // Load content.
            try {
                new URL(contentUrl);
                loadContentIntoElement(contentUrl, contentElement);
            } catch (error) {
                console.error('Error:', 'Invalid content URL', contentUrl);
            }
	}
})();