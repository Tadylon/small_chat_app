const express = require("express");
const router = express.Router();
const fileController = require("../controllers/fileController");
const upload = require("../middleware/upload");
const { requireAuth } = require("../middleware/auth");

router.use(requireAuth);

router.post("/upload", upload.single("file"), fileController.uploadFile);
router.get("/download/:id", fileController.downloadFile);

module.exports = router;
