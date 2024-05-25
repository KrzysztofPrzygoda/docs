<?php
header('Content-Type: application/json');
echo file_get_contents('https://audycje.tokfm.pl/getsch?ver=2021');