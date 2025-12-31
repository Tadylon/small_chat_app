const Message = require("../models/Message");

exports.getPrivateMessages = async (req, res, next) => {
  try {
    const otherUserId = req.params.userId;
    const messages = await Message.getPrivateHistory(
      req.session.userId,
      otherUserId
    );
    res.json({ messages });
  } catch (err) {
    next(err);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const { receiverId, message } = req.body;
    const id = await Message.createPrivate(
      req.session.userId,
      receiverId,
      message
    );
    res.status(201).json({
      status: "success",
      data: {
        id,
        sender_id: req.session.userId,
        message,
        created_at: new Date(),
      },
    });
  } catch (err) {
    next(err);
  }
};
