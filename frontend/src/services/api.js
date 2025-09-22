// API service for making HTTP requests to backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // Helper method to make requests
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    // Set default headers
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    // Include credentials for session-based auth
    config.credentials = 'include';

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Auth methods
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST'
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Chat methods
  async getUsers() {
    return this.request('/chat/users');
  }

  async sendMessage(messageData) {
    return this.request('/chat/messages', {
      method: 'POST',
      body: JSON.stringify(messageData)
    });
  }

  async getMessages(userId) {
    return this.request(`/chat/messages/${userId}`);
  }

  // Group methods
  async getGroups() {
    return this.request('/group');
  }

  async getUserGroups() {
    return this.request('/group/user');
  }

  async createGroup(groupData) {
    return this.request('/group', {
      method: 'POST',
      body: JSON.stringify(groupData)
    });
  }

  async applyToGroup(groupId) {
    return this.request(`/group/${groupId}/apply`, {
      method: 'POST'
    });
  }

  async approveMember(groupId, data) {
    return this.request(`/group/${groupId}/approve`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getGroup(groupId) {
    return this.request(`/group/${groupId}`);
  }

  async getGroupMembers(groupId) {
    return this.request(`/group/${groupId}/members`);
  }

  async sendGroupMessage(groupId, messageData) {
    return this.request(`/group/${groupId}/messages`, {
      method: 'POST',
      body: JSON.stringify(messageData)
    });
  }

  async getGroupMessages(groupId) {
    return this.request(`/group/${groupId}/messages`);
  }
}

// Export singleton instance
export default new ApiService();