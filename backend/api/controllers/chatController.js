const db = require('../../config/db');

// Get all users
const getUsers = async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, username, email FROM users WHERE id != ?',
      [req.session.userId]
    );

    res.json({
      status: 'success',
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.session.userId;

    // Validate input
    if (!receiverId || !message) {
      return res.status(400).json({
        status: 'error',
        message: 'Receiver ID and message are required'
      });
    }

    // Insert message
    const [result] = await db.execute(
      'INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)',
      [senderId, receiverId, message]
    );

    // Get the full message object with timestamp
    const [messages] = await db.execute(
      `SELECT
        m.id,
        m.sender_id,
        m.receiver_id,
        m.message,
        m.created_at,
        u.username as sender_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.id = ?`,
      [result.insertId]
    );

    const fullMessage = messages[0];

    // Return success response
    res.status(201).json({
      status: 'success',
      message: 'Message sent successfully',
      data: fullMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Get messages between two users
const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.session.userId;

    // Get messages between current user and specified user, including file information
    const [messages] = await db.execute(`
      SELECT
        m.id,
        m.sender_id,
        m.receiver_id,
        m.message,
        m.created_at,
        u.username as sender_name,
        f.id as file_id,
        f.filename as file_filename,
        f.original_name as file_original_name,
        f.size as file_size
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      LEFT JOIN files f ON m.id = f.message_id
      WHERE (m.sender_id = ? AND m.receiver_id = ?)
      OR (m.sender_id = ? AND m.receiver_id = ?)
      ORDER BY m.created_at ASC
    `, [currentUserId, userId, userId, currentUserId]);

    res.json({
      status: 'success',
      data: messages
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getUsers,
  sendMessage,
  getMessages
};