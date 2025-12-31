const db = require("../config/db");

class File {
  static async create(
    uploaderId,
    originalName,
    filename,
    path,
    size,
    mimetype
  ) {
    const [result] = await db.execute(
      "INSERT INTO files (uploader_id, original_name, filename, path, size, mimetype) VALUES (?, ?, ?, ?, ?, ?)",
      [uploaderId, originalName, filename, path, size, mimetype]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await db.execute("SELECT * FROM files WHERE id = ?", [id]);
    return rows[0];
  }
}

module.exports = File;
