<?php
/**
 * Script de migration: Convertit data.json en fichiers JSON individuels
 * À exécuter UNE SEULE FOIS pour migrer les données existantes
 */

// Lire le fichier data.json actuel
$dataJsonPath = __DIR__ . '/../data.json';
$validatedDir = __DIR__ . '/../data/validated/';

if (!file_exists($dataJsonPath)) {
    die(json_encode(['error' => 'data.json not found']));
}

// Créer le dossier validated s'il n'existe pas
if (!is_dir($validatedDir)) {
    mkdir($validatedDir, 0777, true);
}

$dataJson = json_decode(file_get_contents($dataJsonPath), true);

if (!$dataJson || !isset($dataJson['sounds'])) {
    die(json_encode(['error' => 'Invalid data.json format']));
}

$migratedCount = 0;
$errors = [];

foreach ($dataJson['sounds'] as $sound) {
    try {
        // Générer un nom de fichier unique basé sur la catégorie, saison et titre
        $category = str_replace(' ', '_', $sound['category']);
        $season = str_replace(' ', '_', $sound['season']);
        $title = str_replace(' ', '_', $sound['title']);
        
        // Nettoyer les caractères spéciaux
        $fileName = preg_replace('/[^a-zA-Z0-9_-]/', '', $category . '_' . $season . '_' . $title);
        $fileName = $fileName . '.json';
        
        // Préparer les données du son
        $soundData = [
            'id' => $sound['id'],
            'title' => $sound['title'],
            'category' => $sound['category'],
            'season' => $sound['season'],
            'tags' => $sound['tags'],
            'path' => $sound['path'],
            'thumbnailPath' => $sound['thumbnailPath'],
            'description' => $sound['description'] ?? '',
            'source' => $sound['source'] ?? '',
            'wikiLink' => $sound['wikiLink'] ?? '',
            'submittedAt' => date('Y-m-d\TH:i:s\Z'),
            'status' => 'validated'
        ];
        
        // Écrire le fichier JSON
        $filePath = $validatedDir . $fileName;
        file_put_contents(
            $filePath,
            json_encode($soundData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
        );
        
        $migratedCount++;
    } catch (Exception $e) {
        $errors[] = [
            'sound' => $sound['title'] ?? 'Unknown',
            'error' => $e->getMessage()
        ];
    }
}

// Retourner le résultat de la migration
header('Content-Type: application/json');
echo json_encode([
    'success' => true,
    'migrated' => $migratedCount,
    'total' => count($dataJson['sounds']),
    'errors' => $errors
], JSON_PRETTY_PRINT);
