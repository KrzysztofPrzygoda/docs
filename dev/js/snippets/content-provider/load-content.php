<?php
/**
 * Return HTML content file.
 * 
 * @author "Krzysztof Przygoda <no@email.com>"
 */

// Remove all previously set headers.
header_remove();

// Anti cache headers.
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GMT');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Cache-Control: post-check=0, pre-check=0', false);
header('Pragma: no-cache');

// Anti CORS headers.
// Requires JS fetch( url, { mode: 'cors', cache: 'no-cache' } )
header('Access-Control-Allow-Origin: *');

// Mime type headers.
header('Content-Type: text/html; charset=utf-8');

// Read content file.
$page = filter_input(INPUT_GET, 'content', FILTER_SANITIZE_FULL_SPECIAL_CHARS);

if (!$page) {
    $page = 'default-page';
}

// Sanitize filename.
$file = "content/" . basename($page) . ".html";
$realPath = realpath($file);
$baseDir = realpath(__DIR__ . "/content");

if ($realPath && str_starts_with($realPath, $baseDir) && file_exists($realPath)) {
    readfile($realPath);
} else {
    echo '<div class="menu_messages_error">
		<h3 class="return_label">
			File ' . basename($realPath) . ' not found!
		</h3>
	</div>';
}