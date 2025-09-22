const express = require('express');
const router = express.Router();
const { register, login, logout, getCurrentUser } = require('../controllers/authController');

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);

// Logout route
router.post('/logout', logout);

// Get current user
router.get('/me', getCurrentUser);

module.exports = router;