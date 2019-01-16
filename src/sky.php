<?php
$allBase = file_get_contents('db.json');

echo json_encode($allBase,  JSON_UNESCAPED_UNICODE | JSON_FORCE_OBJECT);