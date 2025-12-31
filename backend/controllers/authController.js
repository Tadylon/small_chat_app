const bcrypt = require("bcryptjs");
const User = require("../models/User");

exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    // 检查是否存在
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }
    // 哈希密码
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await User.create(username, email, hashedPassword);

    res
      .status(201)
      .json({ status: "success", message: "User registered", userId });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body; // 注意：你前端可能发的是 username 或 email
    // 这里简单起见，假设前端发的是 username 字段，但实际上我们可以查 user 表
    // 如果你前端改成了用 email 登录，这里要对应修改

    // 假设用 email 查，如果不确定，可以两个都查
    // 这里为了演示，我们查询所有用户做匹配 (生产环境请精确查询)
    // 简化逻辑：我们假设前端传的是 email 字段给 'username' 参数，或者你需要修改 SQL 支持 username 登录
    // 这里我们假设 User.js 增加一个 findByUsername, 或者我们只用 email 登录
    // 修正：根据你之前的代码，我还是按 email 查
    const user = await User.findByEmail(req.body.email || username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 设置 Session
    req.session.userId = user.id;
    req.session.username = user.username;

    res.json({
      status: "success",
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    next(err);
  }
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.json({ status: "success", message: "Logged out" });
};

exports.getCurrentUser = async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ message: "Not logged in" });
  const user = await User.findById(req.session.userId);
  res.json(user);
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAllExcluding(req.session.userId);
    res.json(users);
  } catch (err) {
    next(err);
  }
};
