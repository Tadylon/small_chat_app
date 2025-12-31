const db = require("../config/db");

class Message {
  // 私聊：保存
  static async createPrivate(senderId, receiverId, message, fileId = null) {
    const [result] = await db.execute(
      "INSERT INTO messages (sender_id, receiver_id, message, file_id) VALUES (?, ?, ?, ?)",
      [senderId, receiverId, message, fileId]
    );
    return result.insertId;
  }

  // 私聊：获取历史
  static async getPrivateHistory(userId1, userId2) {
    const sql = `
      SELECT m.*, f.original_name as file_name, f.size as file_size 
      FROM messages m 
      LEFT JOIN files f ON m.file_id = f.id
      WHERE (sender_id = ? AND receiver_id = ?) 
         OR (sender_id = ? AND receiver_id = ?)
      ORDER BY created_at ASC
    `;
    const [rows] = await db.execute(sql, [userId1, userId2, userId2, userId1]);
    return rows;
  }

  // 群聊：保存
  static async createGroup(groupId, senderId, message, fileId = null) {
    const [result] = await db.execute(
      "INSERT INTO group_messages (group_id, sender_id, message, file_id) VALUES (?, ?, ?, ?)",
      [groupId, senderId, message, fileId]
    );
    return result.insertId;
  }

  // 群聊：获取历史
  static async getGroupHistory(groupId) {
    const sql = `
      SELECT m.*, u.username as sender_name, f.original_name as file_name 
      FROM group_messages m
      JOIN users u ON m.sender_id = u.id
      LEFT JOIN files f ON m.file_id = f.id
      WHERE group_id = ?
      ORDER BY created_at ASC
    `;
    const [rows] = await db.execute(sql, [groupId]);
    return rows;
  }
}

module.exports = Message;
