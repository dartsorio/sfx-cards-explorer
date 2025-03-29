
// This is a simple server-side script to handle form submissions
// In a real application, this would be replaced with a proper backend endpoint

// Function to save form data to the forms directory
function saveFormData(req, res) {
  try {
    const formData = req.body;
    const fs = require('fs');
    const path = require('path');
    
    // Create the forms directory if it doesn't exist
    const formsDir = path.join(__dirname, '../forms');
    if (!fs.existsSync(formsDir)) {
      fs.mkdirSync(formsDir, { recursive: true });
    }
    
    // Generate a filename based on the submission timestamp
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
    const fileName = `form_${timestamp}.json`;
    const filePath = path.join(formsDir, fileName);
    
    // Write the form data to a JSON file
    fs.writeFileSync(filePath, JSON.stringify(formData, null, 2));
    
    // Return success response
    res.status(200).json({ success: true, fileName });
  } catch (error) {
    console.error('Error saving form data:', error);
    res.status(500).json({ success: false, error: 'Failed to save form data' });
  }
}

// Export the function to be used by the server
module.exports = saveFormData;
