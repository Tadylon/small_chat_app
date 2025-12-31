-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  avatar VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 私聊消息表
CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  message TEXT,
  file_id INT DEFAULT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id)
);

-- 群组表
CREATE TABLE IF NOT EXISTS `groups` (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  admin_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- 群组成员表 (包含审批状态)
CREATE TABLE IF NOT EXISTS group_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_id INT NOT NULL,
  user_id INT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES `groups`(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE KEY unique_member (group_id, user_id)
);

-- 群消息表
CREATE TABLE IF NOT EXISTS group_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_id INT NOT NULL,
  sender_id INT NOT NULL,
  message TEXT,
  file_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES `groups`(id),
  FOREIGN KEY (sender_id) REFERENCES users(id)
);

-- 文件表
CREATE TABLE IF NOT EXISTS files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uploader_id INT NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  path VARCHAR(255) NOT NULL,
  size INT NOT NULL,
  mimetype VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploader_id) REFERENCES users(id)
);