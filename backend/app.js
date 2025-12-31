const express = require("express");
const session = require("express-session");
const cors = require("cors");
const path = require("path");

// 路由文件导入
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const groupRoutes = require("./routes/groupRoutes");
const fileRoutes = require("./routes/fileRoutes");

const app = express();

// 1. 中间件配置
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务 (上传的文件)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// CORS
app.use(
  cors({
    origin: "http://localhost:8080", // 前端地址
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// Session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // HTTPS 时设为 true
      maxAge: 24 * 60 * 60 * 1000, // 1天
    },
  })
);

// 2. 路由挂载
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/group", groupRoutes);
app.use("/api/file", fileRoutes);

// 3. 全局错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ status: "error", message: "Something went wrong!" });
});

module.exports = app;
