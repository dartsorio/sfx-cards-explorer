<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Chemin vers le fichier categories.json
$categoriesFile = __DIR__ . '/../data/categories.json';

// Vérifier si le fichier existe
if (!file_exists($categoriesFile)) {
    http_response_code(404);
    echo json_encode([
        'error' => 'Categories file not found'
    ]);
    exit();
}

// Lire et retourner le contenu du fichier
$content = file_get_contents($categoriesFile);
$data = json_decode($content, true);

if ($data === null) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Invalid JSON in categories file'
    ]);
    exit();
}

echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
