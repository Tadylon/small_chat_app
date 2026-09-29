import axios from "axios";

// 1. 创建 Axios 实例
const apiClient = axios.create({
  baseURL: "http://localhost:3000/api", // 确保这是你的后端地址
  withCredentials: true, // 允许携带 Cookie/Session
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. 封装 API 服务对象
const apiService = {
  // === 核心方法 (解决 api.get is not a function 问题) ===
  // 直接暴露 axios 的基础方法，供 store 灵活调用
  get(url, config) {
    return apiClient.get(url, config);
  },
  post(url, data, config) {
    return apiClient.post(url, data, config);
  },
  put(url, data, config) {
    return apiClient.put(url, data, config);
  },
  delete(url, config) {
    return apiClient.delete(url, config);
  },

  // === Auth 方法 ===
  register(userData) {
    return apiClient.post("/auth/register", userData);
  },
  login(credentials) {
    return apiClient.post("/auth/login", credentials);
  },
  logout() {
    return apiClient.post("/auth/logout");
  },
  getCurrentUser() {
    return apiClient.get("/auth/me");
  },

  // === Chat 方法 ===
  getUsers() {
    return apiClient.get("/chat/users");
  },
  sendMessage(messageData) {
    return apiClient.post("/chat/messages", messageData);
  },
  getMessages(userId) {
    return apiClient.get(`/chat/messages/${userId}`);
  },

  // === Group 方法 ===
  getGroups() {
    return apiClient.get("/group");
  },
  getUserGroups() {
    return apiClient.get("/group/user");
  },
  createGroup(groupData) {
    return apiClient.post("/group", groupData);
  },
  applyToGroup(groupId) {
    return apiClient.post(`/group/${groupId}/apply`);
  },
  approveMember(groupId, data) {
    return apiClient.post(`/group/${groupId}/approve`, data);
  },
  getGroup(groupId) {
    return apiClient.get(`/group/${groupId}`);
  },
  getGroupMembers(groupId) {
    return apiClient.get(`/group/${groupId}/members`);
  },
  sendGroupMessage(groupId, messageData) {
    return apiClient.post(`/group/${groupId}/messages`, messageData);
  },
  getGroupMessages(groupId) {
    return apiClient.get(`/group/${groupId}/messages`);
  },
};

export default apiService;
