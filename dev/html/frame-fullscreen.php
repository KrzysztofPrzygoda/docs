<?php
    $url = 'https://domain.tld/path/to';
?>
<html>
    <head>
        <title>Frames</title>
        <meta http-equiv="content-type" content="text/html; charset=UTF-8">
    </head>
    
    <frameset cols="100%, *" border="0">
        <frame name="alias" src="<?php echo $url; ?>" frameborder="0" marginwidth="0" marginheight="0" scrolling="auto">
    </frameset>
    
    <noframes>
        <a href="<?php echo $url; ?>">Click here</a>.
    </noframes>
</html>