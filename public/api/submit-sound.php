<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Configuration
$uploadDir = __DIR__ . '/../../data/submissions/';
$soundsDir = __DIR__ . '/../../sounds/';
$imagesDir = __DIR__ . '/../../images/sounds/';

// Créer les dossiers s'ils n'existent pas
if (!file_exists($uploadDir)) mkdir($uploadDir, 0777, true);
if (!file_exists($soundsDir)) mkdir($soundsDir, 0777, true);
if (!file_exists($imagesDir)) mkdir($imagesDir, 0777, true);

try {
    // Récupérer les données du formulaire
    $title = $_POST['title'] ?? '';
    $category = $_POST['category'] ?? '';
    $season = $_POST['season'] ?? '';
    $tags = isset($_POST['tags']) ? explode(',', $_POST['tags']) : [];
    $description = $_POST['description'] ?? '';
    $source = $_POST['source'] ?? '';
    $wikiLink = $_POST['wikiLink'] ?? '';
    
    // Validation des champs requis
    if (empty($title) || empty($category) || empty($season)) {
        throw new Exception('Missing required fields');
    }
    
    if (!isset($_FILES['audio'])) {
        throw new Exception('Audio file is required');
    }
    
    // Créer un ID unique
    $timestamp = date('Ymd_His');
    $cleanTitle = preg_replace('/[^a-zA-Z0-9]/', '_', $title);
    $id = strtolower($category) . '_' . strtolower($cleanTitle) . '_' . $timestamp;
    
    // Traiter le fichier audio
    $audioFile = $_FILES['audio'];
    $audioExt = strtolower(pathinfo($audioFile['name'], PATHINFO_EXTENSION));
    $allowedAudioExts = ['mp3', 'wav', 'ogg'];
    
    if (!in_array($audioExt, $allowedAudioExts)) {
        throw new Exception('Invalid audio file format. Only MP3, WAV, and OGG are allowed.');
    }
    
    if ($audioFile['size'] > 10 * 1024 * 1024) {
        throw new Exception('Audio file is too large. Maximum size is 10MB.');
    }
    
    // Créer sous-dossier par catégorie
    $categorySlug = strtolower(str_replace(' ', '-', $category));
    $categorySoundsDir = $soundsDir . $categorySlug . '/';
    if (!file_exists($categorySoundsDir)) {
        mkdir($categorySoundsDir, 0777, true);
    }
    
    $audioFileName = $id . '.' . $audioExt;
    $audioPath = $categorySoundsDir . $audioFileName;
    
    if (!move_uploaded_file($audioFile['tmp_name'], $audioPath)) {
        throw new Exception('Failed to upload audio file');
    }
    
    // Traiter l'image (optionnel)
    $thumbnailPath = '';
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $imageFile = $_FILES['image'];
        $imageExt = strtolower(pathinfo($imageFile['name'], PATHINFO_EXTENSION));
        $allowedImageExts = ['jpg', 'jpeg', 'png', 'gif'];
        
        if (!in_array($imageExt, $allowedImageExts)) {
            throw new Exception('Invalid image file format. Only JPG, PNG, and GIF are allowed.');
        }
        
        if ($imageFile['size'] > 5 * 1024 * 1024) {
            throw new Exception('Image file is too large. Maximum size is 5MB.');
        }
        
        // Créer sous-dossier par catégorie
        $categoryImagesDir = $imagesDir . $categorySlug . '/';
        if (!file_exists($categoryImagesDir)) {
            mkdir($categoryImagesDir, 0777, true);
        }
        
        $imageFileName = $id . '.' . $imageExt;
        $imagePath = $categoryImagesDir . $imageFileName;
        
        if (!move_uploaded_file($imageFile['tmp_name'], $imagePath)) {
            throw new Exception('Failed to upload image file');
        }
        
        $thumbnailPath = '/images/sounds/' . $categorySlug . '/' . $imageFileName;
    }
    
    // Créer le JSON
    $soundData = [
        'id' => $id,
        'title' => $title,
        'category' => $category,
        'season' => $season,
        'tags' => $tags,
        'path' => '/sounds/' . $categorySlug . '/' . $audioFileName,
        'thumbnailPath' => $thumbnailPath,
        'description' => $description,
        'source' => $source,
        'wikiLink' => $wikiLink,
        'submittedAt' => date('c'),
        'status' => 'pending'
    ];
    
    // Nom du fichier JSON
    $jsonFileName = str_replace(' ', '_', $category) . '_' . str_replace(' ', '_', $season) . '_' . $cleanTitle . '.json';
    $jsonPath = $uploadDir . $jsonFileName;
    
    // Sauvegarder le JSON
    if (file_put_contents($jsonPath, json_encode($soundData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) === false) {
        throw new Exception('Failed to save JSON file');
    }
    
    // Réponse de succès
    echo json_encode([
        'success' => true,
        'message' => 'Sound submitted successfully',
        'fileName' => $jsonFileName,
        'id' => $id
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
