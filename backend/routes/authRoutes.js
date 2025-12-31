const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/me", authController.getCurrentUser);
router.get("/users", authController.getAllUsers); // 用于用户列表

module.exports = router;
