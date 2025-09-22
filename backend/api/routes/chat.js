const express = require('express');
const router = express.Router();
const { getUsers, sendMessage, getMessages } = require('../controllers/chatController');

// Get all users
router.get('/users', getUsers);

// Send a message
router.post('/messages', sendMessage);

// Get messages with a specific user
router.get('/messages/:userId', getMessages);

module.exports = router;