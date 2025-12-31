require("dotenv").config();
const app = require("./app");
const http = require("http");

const PORT = process.env.PORT || 3000;

// 创建 HTTP 服务器 (为之后可能的 Socket.io 预留)
const server = http.createServer(app);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
