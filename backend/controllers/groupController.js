const Group = require("../models/Group");
const Message = require("../models/Message");

exports.getAllGroups = async (req, res, next) => {
  try {
    const groups = await Group.findAll();
    res.json({ data: groups });
  } catch (err) {
    next(err);
  }
};

exports.getUserGroups = async (req, res, next) => {
  try {
    const groups = await Group.findUserGroups(req.session.userId);
    res.json({ data: groups });
  } catch (err) {
    next(err);
  }
};

exports.createGroup = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const adminId = req.session.userId;
    const groupId = await Group.create(name, description, adminId);

    // 创建者自动加入并设为 approve
    await Group.addMember(groupId, adminId, "approved");

    res.status(201).json({ status: "success", groupId });
  } catch (err) {
    next(err);
  }
};

exports.applyToGroup = async (req, res, next) => {
  try {
    const groupId = req.params.id;
    await Group.addMember(groupId, req.session.userId, "pending");
    res.json({ status: "success", message: "Application sent" });
  } catch (err) {
    next(err);
  }
};

exports.getGroupMembers = async (req, res, next) => {
  try {
    const members = await Group.getMembers(req.params.id);
    res.json({ data: members });
  } catch (err) {
    next(err);
  }
};

exports.approveMember = async (req, res, next) => {
  try {
    const { user_id, status } = req.body; // status: 'approved' or 'rejected'
    const groupId = req.params.id;
    // 实际项目中应检查 req.session.userId 是否是该群管理员
    await Group.updateMemberStatus(groupId, user_id, status);
    res.json({ status: "success" });
  } catch (err) {
    next(err);
  }
};

exports.getGroupMessages = async (req, res, next) => {
  try {
    const messages = await Message.getGroupHistory(req.params.id);
    res.json({ data: messages });
  } catch (err) {
    next(err);
  }
};

exports.sendGroupMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    const newMessageId = await Message.createGroup(
      req.params.id,
      req.session.userId,
      message
    );
    // 实际应返回完整消息结构以便前端展示
    const newMessage = {
      id: newMessageId,
      group_id: req.params.id,
      sender_id: req.session.userId,
      sender_name: req.session.username,
      message,
      created_at: new Date(),
    };
    res.status(201).json({ data: newMessage });
  } catch (err) {
    next(err);
  }
};
