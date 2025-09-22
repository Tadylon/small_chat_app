const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const db = require('./config/db');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Requested-With']
}));
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Simple in-memory storage for online users (in production, use Redis or similar)
const onlineUsers = new Map();

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ status: 'error', message: 'Authentication required' });
  }
};

// Routes
app.use('/api/auth', require('./api/routes/auth'));
app.use('/api/chat', requireAuth, require('./api/routes/chat'));
app.use('/api/file', requireAuth, require('./api/routes/file'));
app.use('/api/group', requireAuth, require('./api/routes/group'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'success', message: 'Server is running' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;