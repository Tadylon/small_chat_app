const db = require('../../config/db');

// 创建群组
const createGroup = async (req, res) => {
  const { name, description } = req.body;
  const adminId = req.user.id;

  try {
    const [result] = await db.query(
      'INSERT INTO `groups` (name, description, admin_id) VALUES (?, ?, ?)',
      [name, description, adminId]
    );

    // 自动将创建者添加为群组成员
    await db.query(
      'INSERT INTO `group_members` (group_id, user_id, status) VALUES (?, ?, "approved")',
      [result.insertId, adminId]
    );

    res.status(201).json({
      status: 'success',
      message: '群组创建成功',
      data: {
        group_id: result.insertId,
        name,
        description
      }
    });
  } catch (error) {
    console.error('创建群组错误:', error);
    res.status(500).json({
      status: 'error',
      message: '创建群组失败'
    });
  }
};

// 申请加入群组
const applyToGroup = async (req, res) => {
  const { id: groupId } = req.params;
  const userId = req.user.id;

  try {
    // 检查是否已经在群组中
    const [existingMember] = await db.query(
      'SELECT * FROM `group_members` WHERE group_id = ? AND user_id = ?',
      [groupId, userId]
    );

    if (existingMember.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: '你已经申请过或已经在此群组中'
      });
    }

    await db.query(
      'INSERT INTO `group_members` (group_id, user_id, status) VALUES (?, ?, "pending")',
      [groupId, userId]
    );

    res.json({
      status: 'success',
      message: '申请已提交，等待管理员审核'
    });
  } catch (error) {
    console.error('申请加入群组错误:', error);
    res.status(500).json({
      status: 'error',
      message: '申请失败'
    });
  }
};

// 审批群组成员
const approveMember = async (req, res) => {
  const { id: groupId } = req.params;
  const { user_id: memberUserId, status } = req.body;
  const adminId = req.user.id;

  try {
    // 检查是否是群组管理员
    const [group] = await db.query(
      'SELECT admin_id FROM \`groups\` WHERE id = ?',
      [groupId]
    );

    if (group.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '群组不存在'
      });
    }

    if (group[0].admin_id !== adminId) {
      return res.status(403).json({
        status: 'error',
        message: '没有权限执行此操作'
      });
    }

    // 更新成员状态
    await db.query(
      'UPDATE `group_members` SET status = ? WHERE group_id = ? AND user_id = ?',
      [status, groupId, memberUserId]
    );

    res.json({
      status: 'success',
      message: status === 'approved' ? '已批准加入' : '已拒绝加入'
    });
  } catch (error) {
    console.error('审批成员错误:', error);
    res.status(500).json({
      status: 'error',
      message: '审批失败'
    });
  }
};

// 获取群组列表
const getGroups = async (req, res) => {
  try {
    const [groups] = await db.query('SELECT * FROM `groups` ORDER BY created_at DESC');

    res.json({
      status: 'success',
      data: groups
    });
  } catch (error) {
    console.error('获取群组列表错误:', error);
    res.status(500).json({
      status: 'error',
      message: '获取群组列表失败'
    });
  }
};

// 获取群组成员
const getGroupMembers = async (req, res) => {
  const { id: groupId } = req.params;

  try {
    // 获取群组信息
    const [groups] = await db.query(
      'SELECT * FROM `groups` WHERE id = ?',
      [groupId]
    );

    const [members] = await db.query(`
      SELECT gm.*, u.username, u.email
      FROM group_members gm
      JOIN users u ON gm.user_id = u.id
      WHERE gm.group_id = ?
      ORDER BY gm.applied_at ASC
    `, [groupId]);

    // 将群组信息添加到每个成员记录中
    const membersWithGroupInfo = members.map(member => ({
      ...member,
      name: groups[0]?.name || '',
      description: groups[0]?.description || '',
      admin_id: groups[0]?.admin_id || null
    }));

    res.json({
      status: 'success',
      data: membersWithGroupInfo
    });
  } catch (error) {
    console.error('获取群组成员错误:', error);
    res.status(500).json({
      status: 'error',
      message: '获取群组成员失败'
    });
  }
};

// 发送群组消息
const sendGroupMessage = async (req, res) => {
  const { id: groupId } = req.params;
  const { message } = req.body;
  const userId = req.user.id;

  try {
    // 检查是否是已批准的群组成员
    const [member] = await db.query(
      'SELECT * FROM `group_members` WHERE group_id = ? AND user_id = ? AND status = "approved"',
      [groupId, userId]
    );

    if (member.length === 0) {
      return res.status(403).json({
        status: 'error',
        message: '你不是此群组的成员或尚未被批准'
      });
    }

    const [result] = await db.query(
      'INSERT INTO `group_messages` (group_id, user_id, message) VALUES (?, ?, ?)',
      [groupId, userId, message]
    );

    // 获取发送的消息详情，格式与私聊消息保持一致
    const [newMessage] = await db.query(
      `SELECT
        gm.id,
        gm.user_id as sender_id,
        gm.group_id as receiver_id,
        gm.message,
        gm.created_at,
        u.username as sender_name
      FROM \`group_messages\` gm
      JOIN users u ON gm.user_id = u.id
      WHERE gm.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      status: 'success',
      message: '消息发送成功',
      data: newMessage[0]
    });
  } catch (error) {
    console.error('发送群组消息错误:', error);
    res.status(500).json({
      status: 'error',
      message: '发送消息失败'
    });
  }
};

// 获取群组消息
const getGroupMessages = async (req, res) => {
  const { id: groupId } = req.params;

  try {
    const [messages] = await db.query(
      `SELECT
        gm.id,
        gm.user_id as sender_id,
        gm.group_id as receiver_id,
        gm.message,
        gm.created_at,
        u.username as sender_name
      FROM \`group_messages\` gm
      JOIN users u ON gm.user_id = u.id
      WHERE gm.group_id = ?
      ORDER BY gm.created_at ASC`,
      [groupId]
    );

    res.json({
      status: 'success',
      data: messages
    });
  } catch (error) {
    console.error('获取群组消息错误:', error);
    res.status(500).json({
      status: 'error',
      message: '获取群组消息失败'
    });
  }
};

// 获取用户加入的群组
const getUserGroups = async (req, res) => {
  const userId = req.user.id;

  try {
    const [groups] = await db.query(`
      SELECT g.*, gm.status
      FROM \`groups\` g
      JOIN group_members gm ON g.id = gm.group_id
      WHERE gm.user_id = ?
      ORDER BY gm.applied_at DESC
    `, [userId]);

    res.json({
      status: 'success',
      data: groups
    });
  } catch (error) {
    console.error('获取用户群组错误:', error);
    res.status(500).json({
      status: 'error',
      message: '获取用户群组失败'
    });
  }
};

module.exports = {
  createGroup,
  applyToGroup,
  approveMember,
  getGroups,
  getGroupMembers,
  sendGroupMessage,
  getGroupMessages,
  getUserGroups
};