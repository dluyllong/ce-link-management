<?php
$link=($_POST["data"]);
$file = "links.json";
$fh = fopen($file, 'w+') or die("can't open file");
fwrite($fh, $link);
fclose($fh);
?>