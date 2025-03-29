
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const saveFormRouter = require('./public/api/save-form');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api', saveFormRouter);

// Serve the frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
