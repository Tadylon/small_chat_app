const db = require("../config/db");

class Group {
  static async create(name, description, adminId) {
    const [result] = await db.execute(
      "INSERT INTO `groups` (name, description, admin_id) VALUES (?, ?, ?)",
      [name, description, adminId]
    );
    return result.insertId;
  }

  static async addMember(groupId, userId, status = "pending") {
    // 使用 INSERT IGNORE 防止重复插入报错
    const [result] = await db.execute(
      "INSERT IGNORE INTO group_members (group_id, user_id, status) VALUES (?, ?, ?)",
      [groupId, userId, status]
    );
    return result;
  }

  static async findAll() {
    const [rows] = await db.execute("SELECT * FROM `groups`");
    return rows;
  }

  static async findUserGroups(userId) {
    // 获取用户所在的群组以及他在群里的状态
    const sql = `
      SELECT g.*, gm.status, gm.joined_at 
      FROM \`groups\` g 
      JOIN group_members gm ON g.id = gm.group_id 
      WHERE gm.user_id = ?
    `;
    const [rows] = await db.execute(sql, [userId]);
    return rows;
  }

  static async getMembers(groupId) {
    const sql = `
      SELECT u.id, u.username, u.email, gm.status 
      FROM users u 
      JOIN group_members gm ON u.id = gm.user_id 
      WHERE gm.group_id = ?
    `;
    const [rows] = await db.execute(sql, [groupId]);
    return rows;
  }

  static async updateMemberStatus(groupId, userId, status) {
    const [result] = await db.execute(
      "UPDATE group_members SET status = ? WHERE group_id = ? AND user_id = ?",
      [status, groupId, userId]
    );
    return result;
  }
}

module.exports = Group;
