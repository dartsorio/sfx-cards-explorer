# Guide de migration vers le système PHP avec JSON individuels

## Structure des dossiers

```
public/
├── api/
│   ├── submit-sound.php    # Endpoint pour soumettre un son
│   └── get-sounds.php       # Endpoint pour récupérer tous les sons validés
├── data/
│   ├── submissions/         # Soumissions en attente de validation
│   └── validated/           # Sons validés (affichés sur le site)
├── sounds/
│   └── submissions/         # Fichiers audio des soumissions
└── images/
    └── sounds/
        └── submissions/     # Miniatures des soumissions

```

## Format du fichier JSON individuel

Chaque son doit avoir son propre fichier JSON dans `/data/validated/`:

```json
{
  "id": "kamen_rider_build_engine",
  "title": "Engine",
  "category": "Kamen Rider",
  "season": "Kamen Rider Build",
  "tags": ["Henshin-Change"],
  "path": "/sounds/kamen-rider/build_engine.mp3",
  "thumbnailPath": "/images/sounds/kamen-rider/build_engine.png",
  "description": "",
  "source": "",
  "wikiLink": "",
  "submittedAt": "2025-01-15T10:30:00Z",
  "status": "validated"
}
```

## Processus de validation

1. **Soumission utilisateur**: Le formulaire envoie les données à `/api/submit-sound.php`
2. **Fichiers créés**:
   - JSON dans `/data/submissions/` (avec nom identifiable: `Category_Season_Title_timestamp.json`)
   - Audio **directement** dans `/sounds/[category]/` (nom: `season_title.mp3`)
   - Image **directement** dans `/images/sounds/[category]/` (nom: `season_title.png`)
3. **Validation manuelle**: 
   - Vérifiez le contenu dans `/data/submissions/`
   - Écoutez le son et vérifiez l'image (déjà au bon endroit)
   - Si valide: **déplacez simplement le JSON** de `/data/submissions/` vers `/data/validated/`
   - Si refusé: supprimez le JSON et les fichiers audio/image associés
4. **Affichage automatique**: Le site charge automatiquement tous les JSON de `/data/validated/`

## Migration des données existantes

Pour migrer le `data.json` actuel vers des fichiers individuels, **exécutez le script de migration** :

### Option 1: Via navigateur (recommandé)
Ouvrez dans votre navigateur:
```
https://votresite.com/api/migrate-data.php
```

### Option 2: Via ligne de commande
```bash
php public/api/migrate-data.php
```

Le script va:
- Lire tous les sons du `data.json`
- Créer un fichier JSON individuel pour chaque son dans `/data/validated/`
- Conserver tous les chemins existants (audio et images)
- Afficher un rapport de migration (nombre de sons migrés, erreurs éventuelles)

**Important**: Exécutez ce script **UNE SEULE FOIS** lors de la mise en place du nouveau système.

## Configuration serveur (cPanel / 02switch)

### 1. Structure des permissions
```bash
chmod 755 public/api/
chmod 644 public/api/*.php
chmod 777 public/data/submissions/
chmod 777 public/sounds/submissions/
chmod 777 public/images/sounds/submissions/
```

### 2. Configuration PHP.ini
```ini
upload_max_filesize = 10M
post_max_size = 15M
max_execution_time = 300
```

### 3. Fichier .htaccess
```apache
# Activer PHP
AddHandler application/x-httpd-php .php

# Permettre les requêtes CORS si nécessaire
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
</IfModule>

# Protéger les dossiers de données
<DirectoryMatch "^.*/data/(submissions|validated)">
    Order Allow,Deny
    Allow from all
</DirectoryMatch>
```

## Tags disponibles

- Henshin-Change
- Mecha-Pets
- Misc-Gimmick-Object
- Standby
- Villain

## Champs du formulaire

### Requis (*)
- Title
- Category
- Season
- Upload Sound File (.mp3, .wav, .ogg - max 10MB)

### Optionnels
- Tags (sélection multiple)
- Upload Thumbnail Image (.jpg, .png, .gif - max 5MB)
- Description
- Source
- Wiki Link

## Avantages du nouveau système

✅ **Performance**: Chargement plus rapide, pas de gros fichier JSON
✅ **Scalabilité**: Ajout illimité de sons sans ralentir le site
✅ **Validation manuelle**: Contrôle total avant publication
✅ **Dynamique**: Pas besoin de rebuild pour ajouter des sons
✅ **Organisation**: Fichiers bien séparés et faciles à gérer
✅ **Hébergement simple**: Compatible avec tous les hébergements PHP standard
