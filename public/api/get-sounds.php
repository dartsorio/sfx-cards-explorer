<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Dossier contenant les fichiers JSON validés
$validatedDir = __DIR__ . '/../../data/validated/';

$sounds = [];
$categories = [];

// Lire tous les fichiers JSON dans le dossier validated
if (file_exists($validatedDir)) {
    $files = glob($validatedDir . '*.json');
    
    foreach ($files as $file) {
        $content = file_get_contents($file);
        $soundData = json_decode($content, true);
        
        if ($soundData && isset($soundData['id'])) {
            $sounds[] = $soundData;
            
            // Construire la liste des catégories
            $categoryName = $soundData['category'];
            $seasonName = $soundData['season'];
            
            // Trouver ou créer la catégorie
            $categoryIndex = -1;
            foreach ($categories as $index => $cat) {
                if ($cat['name'] === $categoryName) {
                    $categoryIndex = $index;
                    break;
                }
            }
            
            if ($categoryIndex === -1) {
                $categories[] = [
                    'name' => $categoryName,
                    'path' => '/' . $categoryName,
                    'seasons' => []
                ];
                $categoryIndex = count($categories) - 1;
            }
            
            // Ajouter la saison si elle n'existe pas
            $seasonExists = false;
            foreach ($categories[$categoryIndex]['seasons'] as $season) {
                if ($season['name'] === $seasonName) {
                    $seasonExists = true;
                    break;
                }
            }
            
            if (!$seasonExists) {
                $categories[$categoryIndex]['seasons'][] = [
                    'name' => $seasonName,
                    'path' => '/' . $categoryName . '/' . $seasonName,
                    'tags' => []
                ];
            }
        }
    }
}

// Réponse au format attendu par l'application
$response = [
    'categories' => $categories,
    'sounds' => $sounds
];

echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
