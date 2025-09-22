const bcrypt = require('bcryptjs');
const db = require('../../config/db');

// Register a new user
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Username, email, and password are required'
      });
    }

    // Check if user already exists
    const [existingUsers] = await db.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        status: 'error',
        message: 'Username or email already exists'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const [result] = await db.execute(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    // Return success response
    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: { userId: result.insertId, username, email }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Username and password are required'
      });
    }

    // Find user
    const [users] = await db.execute(
      'SELECT id, username, email, password_hash FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid username or password'
      });
    }

    const user = users[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid username or password'
      });
    }

    // Set session
    req.session.userId = user.id;
    req.session.username = user.username;

    // Return success response
    res.json({
      status: 'success',
      message: 'Login successful',
      data: { userId: user.id, username: user.username, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Logout user
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        status: 'error',
        message: 'Could not log out'
      });
    }

    res.clearCookie('connect.sid'); // Default session cookie name
    res.json({
      status: 'success',
      message: 'Logout successful'
    });
  });
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, username, email FROM users WHERE id = ?',
      [req.session.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      data: users[0]
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getCurrentUser
};