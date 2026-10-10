<?php

// Laravel's development server uses this router when present at the project root.
$publicPath = getcwd();
$uri = rawurldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/');
$segments = [];
foreach (explode('/', str_replace('\\', '/', $uri)) as $segment) {
    if ($segment === '..') {
        array_pop($segments);
    } elseif ($segment !== '' && $segment !== '.') {
        $segments[] = $segment;
    }
}
$uri = '/'.implode('/', $segments);
if (preg_match('~^/storage/(proposals|reports|report-images)(/|$)~i', $uri)) {
    http_response_code(404);

    return;
}
if ($uri !== '/' && file_exists($publicPath.$uri)) {
    return false;
}
require_once $publicPath.'/index.php';
