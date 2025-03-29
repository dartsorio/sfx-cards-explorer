
// This is a server-side script to handle form submissions and file uploads
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Create a router to handle form submissions
const router = express.Router();

// Set up storage for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    let uploadPath;
    
    // Determine the destination based on file type
    if (file.fieldname === 'audio') {
      uploadPath = path.join(__dirname, '../sounds');
      
      // Create category folder structure if needed
      const category = req.body.category?.toLowerCase().replace(/\s+/g, '-') || 'uncategorized';
      uploadPath = path.join(uploadPath, category);
      
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
    } else if (file.fieldname === 'image') {
      uploadPath = path.join(__dirname, '../images');
      
      // Create category folder structure if needed
      const category = req.body.category?.toLowerCase().replace(/\s+/g, '-') || 'uncategorized';
      uploadPath = path.join(uploadPath, category);
      
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
    } else {
      uploadPath = path.join(__dirname, '../uploads');
      
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
    }
    
    cb(null, uploadPath);
  },
  filename: function(req, file, cb) {
    // Create a unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Create the multer upload instance
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'audio') {
      // Accept audio files
      if (file.mimetype.startsWith('audio/')) {
        cb(null, true);
      } else {
        cb(new Error('Only audio files are allowed for sound uploads'));
      }
    } else if (file.fieldname === 'image') {
      // Accept image files
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for thumbnails'));
      }
    } else {
      cb(null, true);
    }
  }
});

// Function to save form data to the forms directory
function saveFormData(req, res) {
  try {
    const formData = req.body;
    
    // Create the forms directory if it doesn't exist
    const formsDir = path.join(__dirname, '../forms');
    if (!fs.existsSync(formsDir)) {
      fs.mkdirSync(formsDir, { recursive: true });
    }
    
    // Add file paths if files were uploaded
    if (req.files) {
      if (req.files.audio) {
        formData.audioFileName = req.files.audio[0].filename;
        formData.audioFilePath = req.files.audio[0].path.replace(/^public/, '');
      }
      
      if (req.files.image) {
        formData.imageFileName = req.files.image[0].filename;
        formData.thumbnailPath = req.files.image[0].path.replace(/^public/, '');
      }
    }
    
    // Generate a filename based on the submission timestamp and form title
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
    const safeTitle = (formData.title || 'unnamed')
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
    const fileName = `form_${safeTitle}_${timestamp}.json`;
    const filePath = path.join(formsDir, fileName);
    
    // Add submission timestamp
    formData.submittedAt = new Date().toISOString();
    
    // Write the form data to a JSON file
    fs.writeFileSync(filePath, JSON.stringify(formData, null, 2));
    
    // Return success response
    res.status(200).json({ success: true, fileName });
  } catch (error) {
    console.error('Error saving form data:', error);
    res.status(500).json({ success: false, error: 'Failed to save form data' });
  }
}

// Set up the routes for handling file uploads and form submission
router.post('/save-form', upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]), saveFormData);

// Export the router to be used by the server
module.exports = router;
