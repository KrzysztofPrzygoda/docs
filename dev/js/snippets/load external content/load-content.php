<?php
// Clean up any previously added headers.
header_remove(); 

// Anti cache headers.
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GMT');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Cache-Control: post-check=0, pre-check=0', false);
header('Pragma: no-cache');

// Anti CORS headers.
header('Access-Control-Allow-Origin: *');
header('Content-Type: text/html; charset=utf-8');

// Read content file.
$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_FULL_SPECIAL_CHARS);

if (!$page) {
    $page = 'content';
}

// Sanitize filename.
$file = "content/" . basename($page) . ".html";

if (str_starts_with(realpath($file), __DIR__) && file_exists($file)) {
    readfile($file);
} else {
    echo '<div class="menu_messages_error">
		<h3 class="return_label">
			File ' . basename($file) . ' not found!
		</h3>
	</div>';
}