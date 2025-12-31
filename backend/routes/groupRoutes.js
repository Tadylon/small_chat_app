const express = require("express");
const router = express.Router();
const groupController = require("../controllers/groupController");
const { requireAuth } = require("../middleware/auth");

router.use(requireAuth);

router.get("/", groupController.getAllGroups); // 广场
router.get("/user", groupController.getUserGroups); // 我的群组
router.post("/", groupController.createGroup); // 建群
router.post("/:id/join", groupController.applyToGroup); // 申请
router.get("/:id/members", groupController.getGroupMembers); // 成员
router.post("/:id/approve", groupController.approveMember); // 审批
router.get("/:id/messages", groupController.getGroupMessages); // 消息
router.post("/:id/messages", groupController.sendGroupMessage); // 发消息

module.exports = router;
