!(function () {
    // Find this <script> tag.
    const scriptElement = document.currentScript;
    if (!scriptElement) {
        console.error('Error:', '<script> tag not found.');
        return;
    }

    // Find parent.
    const parentElement = document.getElementById(scriptElement.dataset.parentId) ?? scriptElement.parentElement;
    if (!parentElement) {
        console.error('Error:', scriptName, '<script> tag parent element not found.');
        return;
    }

    const consentKey = scriptElement.dataset.consentKey ?? 'consentKey';
    if (1 == localStorage.getItem(consentKey)) {
        parentElement.style.display = 'none';
        return;
    }

    parentElement.addEventListener('click', function(e) {
        const anchor = e.target.closest('a');
        const action = anchor.dataset.action;
        if (!anchor || !action) {
            return;
        }

        switch (action) {
            case 'accept':
                localStorage.setItem(consentKey, 1);
                parentElement.style.display = 'none';
                break;

            case 'deny':
                localStorage.setItem(consentKey, 0);
                if (!anchor.href) {
                    window.location.href = "/";
                }
                break;
        }
    });
})();