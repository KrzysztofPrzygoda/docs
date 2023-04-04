<?php
/**
 * Exit Page that changes Referer header for security sake.
 * 
 * @see https://developer.mozilla.org/en-US/docs/Web/Security/Referer_header:_privacy_and_security_concerns
 * @see https://geekthis.net/post/hide-http-referer-headers/#exit-page-redirect
 */

/**
 * Sets the HTTP headers to redirect the user to a different page
 * along with settings the HTTP status code to 307 Temporary Redirect.
 */
function redirect($url) {
    header("Location: {$url}", true, 307);
    die();
}

/**
 * Check if the URL is valid and uses the HTTP or HTTPS scheme.
 */
function is_valid_url($url) {
    if (false === filter_var($url, FILTER_VALIDATE_URL, FILTER_FLAG_SCHEME_REQUIRED | FILTER_FLAG_HOST_REQUIRED)) {
        return false;
    }

    $scheme = parse_url($url, PHP_URL_SCHEME);
    if (!in_array($scheme, ['http', 'https'])) {
        return false;
    }

    return true;
}


if (!isset($_GET['url'])) {
    // Missing required argument.
    redirect("/");
} else {
    $url = $_GET['url'];
    if (is_valid_url($url)) {
        redirect($url);
    } else {
        // Invalid URL.
        redirect("/");
    }
}
