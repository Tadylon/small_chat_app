const express = require('express');
const router = express.Router();
const { uploadFile, downloadFile } = require('../controllers/fileController');

// Upload a file
router.post('/upload', uploadFile);

// Download a file
router.get('/download/:fileId', downloadFile);

module.exports = router;