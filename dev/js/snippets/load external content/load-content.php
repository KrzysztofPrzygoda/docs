<?php
// Paste this code into IdoSell CMS HTML block
/*
<script src="https://bitsmodo.com/idosell/cms/load-content.js?v=1"></script>
<div id="external">Here should be loaded external <a href="https://bitsmodo.com/idosell/cms/content.html">https://bitsmodo.com/idosell/cms/content.html</a></div>
*/

// Clean up any previously added headers
ob_clean();
header_remove(); 

// Anti cache headers
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GMT');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Cache-Control: post-check=0, pre-check=0', false);
header('Pragma: no-cache');

// No CORS headers
// Requires JS fetch( url, { mode: 'cors', cache: 'no-cache' } )
header('Access-Control-Allow-Origin: *');
header('Content-Type: text/html; charset=utf-8');

// Read content file
$file = 'content.html';

if (file_exists($file)) {
	readfile($file);
} else {
	echo '<div class="menu_messages_error">
		<h3 class="return_label">
			File ' . $file . ' not found!
		</h3>
	</div>';
}
?>