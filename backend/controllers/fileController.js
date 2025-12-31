const multer = require("multer");
const path = require("path");
const db = require("../config/db");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Upload a file
const uploadFile = async (req, res) => {
  try {
    // Use multer middleware to handle file upload
    upload.single("file")(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          status: "error",
          message: err.message,
        });
      }

      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({
          status: "error",
          message: "No file uploaded",
        });
      }

      const { receiverId } = req.body;
      const senderId = req.session.userId;

      // Validate input
      if (!receiverId) {
        // Delete uploaded file if validation fails
        const fs = require("fs");
        fs.unlinkSync(req.file.path);

        return res.status(400).json({
          status: "error",
          message: "Receiver ID is required",
        });
      }

      // Also create a message record for the file transfer
      const fileMessage = `File sent: ${req.file.originalname}`;
      const [messageResult] = await db.execute(
        "INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)",
        [senderId, receiverId, fileMessage]
      );

      // Save file info to database with message_id reference
      const [fileResult] = await db.execute(
        "INSERT INTO files (sender_id, receiver_id, filename, original_name, path, size, message_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          senderId,
          receiverId,
          req.file.filename,
          req.file.originalname,
          req.file.path,
          req.file.size,
          messageResult.insertId,
        ]
      );

      // Return success response
      res.status(201).json({
        status: "success",
        message: "File uploaded successfully",
        data: {
          fileId: fileResult.insertId,
          messageId: messageResult.insertId,
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
        },
      });
    });
  } catch (error) {
    console.error("File upload error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

// Download a file
const downloadFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.session.userId;

    // Get file info from database
    const [files] = await db.execute(
      "SELECT * FROM files WHERE id = ? AND (sender_id = ? OR receiver_id = ?)",
      [fileId, userId, userId]
    );

    if (files.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "File not found",
      });
    }

    const file = files[0];

    // Set headers for file download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file.original_name}"`
    );
    res.setHeader("Content-Type", "application/octet-stream");

    // Send file
    res.sendFile(path.resolve(file.path));
  } catch (error) {
    console.error("File download error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

module.exports = {
  uploadFile,
  downloadFile,
};
