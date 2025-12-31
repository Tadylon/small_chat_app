const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const { requireAuth } = require("../middleware/auth");

router.use(requireAuth); // 所有 chat 路由都需要登录

router.get("/history/:userId", chatController.getPrivateMessages);
router.post("/send", chatController.sendMessage);

module.exports = router;
