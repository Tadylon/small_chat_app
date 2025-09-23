<template>
  <div class="group-chat-page">
    <div class="chat-header">
      <h2>{{ group?.name || '群聊' }}</h2>
      <p>{{ group?.description || '暂无描述' }}</p>
      <div class="group-actions">
        <button @click="showMemberModal = true" class="btn btn-secondary">
          群成员 ({{ groupMembers.length }})
        </button>
        <button v-if="isAdmin" @click="showApplicationsModal = true" class="btn btn-warning">
          申请管理
        </button>
      </div>
    </div>

    <div class="chat-messages" ref="messagesContainer">
      <div
        v-for="message in messages"
        :key="message.id"
        class="message"
        :class="{ 'own-message': message.sender_id === currentUserId }"
      >
        <div class="message-info">
          <span class="username">{{ message.sender_name }}</span>
          <span class="time">{{ formatTime(message.created_at) }}</span>
        </div>
        <div class="message-content">{{ message.message }}</div>
      </div>
    </div>

    <div class="chat-input">
      <form @submit.prevent="sendMessage">
        <input
          v-model="newMessage"
          id="group-message-input"
          name="group-message"
          type="text"
          placeholder="输入消息..."
          class="message-input"
          :disabled="!isApprovedMember"
          autocomplete="off"
        />
        <button
          id="send-message-btn"
          name="send-message"
          type="submit"
          class="btn btn-primary"
          :disabled="!newMessage.trim() || !isApprovedMember"
        >
          发送
        </button>
      </form>
      <div v-if="!isApprovedMember" class="warning">
        你还不是群组成员或尚未被批准，无法发送消息
      </div>
    </div>


    <!-- 群成员弹窗 -->
    <div v-if="showMemberModal" class="modal">
      <div class="modal-content">
        <h3>群成员</h3>
        <div class="member-list">
          <div
            v-for="member in groupMembers"
            :key="member.id"
            class="member-item"
          >
            <div class="member-info">
              <span class="username">{{ member.username }}</span>
              <span class="email">{{ member.email }}</span>
            </div>
            <span
              class="status-badge"
              :class="member.status === 'approved' ? 'approved' : 'pending'"
            >
              {{ member.status === 'approved' ? '已批准' : '待审核' }}
            </span>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="showMemberModal = false" class="btn btn-primary">
            关闭
          </button>
        </div>
      </div>
    </div>

    <!-- 申请管理弹窗 -->
    <div v-if="showApplicationsModal && isAdmin" class="modal">
      <div class="modal-content">
        <h3>申请管理</h3>
        <div v-if="pendingMembers.length === 0" class="empty-state">
          <p>暂无待审核的申请</p>
        </div>
        <div v-else class="member-list">
          <div
            v-for="member in pendingMembers"
            :key="member.id"
            class="member-item"
          >
            <div class="member-info">
              <span class="username">{{ member.username }}</span>
              <span class="email">{{ member.email }}</span>
            </div>
            <div class="application-actions">
              <button @click="approveMember(member.user_id, 'approved')" class="btn btn-success">
                批准
              </button>
              <button @click="approveMember(member.user_id, 'rejected')" class="btn btn-danger">
                拒绝
              </button>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="showApplicationsModal = false" class="btn btn-primary">
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../services/api.js'

export default {
  name: 'GroupChatPage',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const groupId = computed(() => route.params.id)
    const group = ref(null)
    const groupMembers = ref([])
    const messages = ref([])
    const newMessage = ref('')
    const showMemberModal = ref(false)
    const showApplicationsModal = ref(false)
    const currentUserId = ref(null)
    const messagesContainer = ref(null)

    const isAdmin = computed(() => {
      return group.value && group.value.admin_id === currentUserId.value
    })

    const isApprovedMember = computed(() => {
      // 调试信息
      console.log('Checking membership:', {
        currentUserId: currentUserId.value,
        groupMembers: groupMembers.value,
        hasMembers: groupMembers.value.length > 0
      })

      // 如果没有成员数据，假设用户是可以发送消息的（避免无限期禁用）
      if (groupMembers.value.length === 0) {
        console.log('No member data, allowing message sending')
        return true
      }

      // 检查用户是否是已批准的成员
      const isApproved = groupMembers.value.some(member =>
        member.user_id === currentUserId.value && member.status === 'approved'
      )

      console.log('Membership check result:', isApproved)
      console.log('Button should be visible:', isApproved && newMessage.value.trim())
      return isApproved
    })

    const pendingMembers = computed(() => {
      return groupMembers.value.filter(member => member.status === 'pending')
    })

    const loadGroupData = async () => {
      try {
        // 并行获取成员和消息
        const [membersRes, messagesRes] = await Promise.all([
          api.getGroupMembers(groupId.value),
          api.getGroupMessages(groupId.value)
        ])

        groupMembers.value = membersRes.data || []
        messages.value = messagesRes.data || []

        // 从成员数据中获取群组信息
        if (groupMembers.value.length > 0) {
          group.value = {
            id: groupId.value,
            name: groupMembers.value[0].name,
            description: groupMembers.value[0].description,
            admin_id: groupMembers.value[0].admin_id
          }
        }

        console.log('Loaded group data:', {
          group: group.value,
          members: groupMembers.value,
          messages: messages.value
        })
      } catch (error) {
        console.error('加载群组数据失败:', error)
      }
    }

    const sendMessage = async () => {
      if (!newMessage.value.trim()) return

      try {
        const response = await api.sendGroupMessage(groupId.value, {
          message: newMessage.value
        })

        messages.value.push(response.data)
        newMessage.value = ''
        scrollToBottom()
      } catch (error) {
        console.error('发送消息失败:', error)
        alert('发送消息失败')
      }
    }

    const approveMember = async (userId, status) => {
      try {
        await api.approveMember(groupId.value, {
          user_id: userId,
          status
        })

        await loadGroupData()
        alert(status === 'approved' ? '已批准' : '已拒绝')
      } catch (error) {
        console.error('审批失败:', error)
        alert('审批失败')
      }
    }

    const formatTime = (timeString) => {
      return new Date(timeString).toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const scrollToBottom = () => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    }

    watchEffect(() => {
      if (messages.value.length > 0) {
        setTimeout(scrollToBottom, 100)
      }
    })

    onMounted(async () => {
      // 获取当前用户信息
      try {
        const userResponse = await api.getCurrentUser()
        if (userResponse.data) {
          currentUserId.value = userResponse.data.id
          // 保存到localStorage以便其他组件使用
          localStorage.setItem('user', JSON.stringify(userResponse.data))
        }
      } catch (error) {
        console.error('获取当前用户信息失败:', error)
        // 如果API调用失败，尝试从localStorage获取
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        if (user && user.id) {
          currentUserId.value = user.id
        }
      }

      await loadGroupData()

      // 模拟实时消息更新
      setInterval(() => {
        if (document.visibilityState === 'visible') {
          loadGroupData()
        }
      }, 5000)
    })

    return {
      group,
      groupMembers,
      messages,
      newMessage,
      showMemberModal,
      showApplicationsModal,
      currentUserId,
      isAdmin,
      isApprovedMember,
      pendingMembers,
      sendMessage,
      approveMember,
      formatTime,
      messagesContainer
    }
  }
}
</script>

<style scoped>
.group-chat-page {
  height: calc(100vh - 0px);
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
  overflow: hidden;
}

.chat-header {
  background: linear-gradient(120deg, #007bff, #00bcd4);
  color: white;
  padding: 25px;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.chat-header h2 {
  margin: 0 0 8px 0;
  color: white;
  font-weight: 600;
}

.chat-header p {
  margin: 0 0 20px 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
}

.group-actions {
  display: flex;
  gap: 15px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 25px;
  padding-bottom: 130px;
  background: rgba(248, 249, 250, 0.7);
  min-height: 0;
}

.message {
  margin-bottom: 20px;
  max-width: 75%;
  padding: 12px 18px;
  border-radius: 20px;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.message.own-message {
  margin-left: auto;
  background: linear-gradient(120deg, #007bff, #00bcd4);
  color: white;
  border-bottom-right-radius: 5px;
}

.message:not(.own-message) {
  background: white;
  color: #212529;
  border-bottom-left-radius: 5px;
}

.message-info {
  margin-bottom: 8px;
  font-size: 0.8rem;
  display: flex;
  justify-content: space-between;
  opacity: 0.9;
}

.message.own-message .message-info {
  color: rgba(255, 255, 255, 0.9);
}

.message-content {
  word-wrap: break-word;
  line-height: 1.5;
}

.chat-input {
  background: white;
  padding: 20px;
  border-top: 1px solid #e0e0e0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
  min-height: 80px;
  z-index: 1000;
  position: fixed;
  top: auto;
  bottom: 20px;
  left: 0;
  width: 100%;
}

.chat-input form {
  display: flex;
  gap: 15px;
}

.message-input {
  flex: 1;
  padding: 12px 20px;
  border: 1px solid #e0e0e0;
  border-radius: 30px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s;
}

.message-input:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.message-input:disabled {
  background-color: #f5f5f5;
}

.warning {
  margin-top: 15px;
  color: #fd7e14;
  font-size: 15px;
  text-align: center;
  padding: 10px;
  background: #fff3cd;
  border-radius: 8px;
  border: 1px solid #ffeaa7;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-primary {
  background: linear-gradient(120deg, #007bff, #00bcd4);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.btn-secondary {
  background: linear-gradient(120deg, #6c757d, #adb5bd);
  color: white;
}

.btn-secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
}

.btn-success {
  background: linear-gradient(120deg, #28a745, #20c997);
  color: white;
}

.btn-success:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.btn-danger {
  background: linear-gradient(120deg, #dc3545, #e83e8c);
  color: white;
}

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}

.btn-warning {
  background: linear-gradient(120deg, #ffc107, #fd7e14);
  color: #212529;
}

.btn-warning:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
}

.btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: modalFadeIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 25px;
  color: #333;
  font-weight: 600;
  text-align: center;
}

.member-list {
  max-height: 400px;
  overflow-y: auto;
}

.member-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #e9ecef;
}

.member-item:last-child {
  border-bottom: none;
}

.member-info {
  flex: 1;
}

.member-info .username {
  display: block;
  font-weight: 600;
  margin-bottom: 5px;
  color: #333;
}

.member-info .email {
  display: block;
  font-size: 14px;
  color: #6c757d;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.status-badge.approved {
  background: linear-gradient(120deg, #28a745, #20c997);
  color: white;
}

.status-badge.pending {
  background: linear-gradient(120deg, #ffc107, #fd7e14);
  color: white;
}

.application-actions {
  display: flex;
  gap: 10px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 30px;
  gap: 10px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #6c757d;
  background: #f8f9fa;
  border-radius: 10px;
}
</style>