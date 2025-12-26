<template>
  <div class="group-chat-page">
    <div class="chat-header">
      <h2>{{ group?.name || "群聊" }}</h2>
      <p>{{ group?.description || "暂无描述" }}</p>
      <div class="group-actions">
        <button @click="showMemberModal = true" class="btn btn-secondary">
          群成员 ({{ groupMembers.length }})
        </button>
        <button
          v-if="isAdmin"
          @click="showApplicationsModal = true"
          class="btn btn-warning"
        >
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
              {{ member.status === "approved" ? "已批准" : "待审核" }}
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
              <button
                @click="approveMember(member.user_id, 'approved')"
                class="btn btn-success"
              >
                批准
              </button>
              <button
                @click="approveMember(member.user_id, 'rejected')"
                class="btn btn-danger"
              >
                拒绝
              </button>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button
            @click="showApplicationsModal = false"
            class="btn btn-primary"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../services/api.js";

export default {
  name: "GroupChatPage",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const groupId = computed(() => route.params.id);
    const group = ref(null);
    const groupMembers = ref([]);
    const messages = ref([]);
    const newMessage = ref("");
    const showMemberModal = ref(false);
    const showApplicationsModal = ref(false);
    const currentUserId = ref(null);
    const messagesContainer = ref(null);

    const isAdmin = computed(() => {
      return group.value && group.value.admin_id === currentUserId.value;
    });

    const isApprovedMember = computed(() => {
      // 调试信息
      console.log("Checking membership:", {
        currentUserId: currentUserId.value,
        groupMembers: groupMembers.value,
        hasMembers: groupMembers.value.length > 0,
      });

      // 如果没有成员数据，假设用户是可以发送消息的（避免无限期禁用）
      if (groupMembers.value.length === 0) {
        console.log("No member data, allowing message sending");
        return true;
      }

      // 检查用户是否是已批准的成员
      const isApproved = groupMembers.value.some(
        (member) =>
          member.user_id === currentUserId.value && member.status === "approved"
      );

      console.log("Membership check result:", isApproved);
      console.log(
        "Button should be visible:",
        isApproved && newMessage.value.trim()
      );
      return isApproved;
    });

    const pendingMembers = computed(() => {
      return groupMembers.value.filter((member) => member.status === "pending");
    });

    const loadGroupData = async () => {
      try {
        // 并行获取成员和消息
        const [membersRes, messagesRes] = await Promise.all([
          api.getGroupMembers(groupId.value),
          api.getGroupMessages(groupId.value),
        ]);

        groupMembers.value = membersRes.data || [];
        messages.value = messagesRes.data || [];

        // 从成员数据中获取群组信息
        if (groupMembers.value.length > 0) {
          group.value = {
            id: groupId.value,
            name: groupMembers.value[0].name,
            description: groupMembers.value[0].description,
            admin_id: groupMembers.value[0].admin_id,
          };
        }

        console.log("Loaded group data:", {
          group: group.value,
          members: groupMembers.value,
          messages: messages.value,
        });
      } catch (error) {
        console.error("加载群组数据失败:", error);
      }
    };

    const sendMessage = async () => {
      if (!newMessage.value.trim()) return;

      try {
        const response = await api.sendGroupMessage(groupId.value, {
          message: newMessage.value,
        });

        messages.value.push(response.data);
        newMessage.value = "";
        scrollToBottom();
      } catch (error) {
        console.error("发送消息失败:", error);
        alert("发送消息失败");
      }
    };

    const approveMember = async (userId, status) => {
      try {
        await api.approveMember(groupId.value, {
          user_id: userId,
          status,
        });

        await loadGroupData();
        alert(status === "approved" ? "已批准" : "已拒绝");
      } catch (error) {
        console.error("审批失败:", error);
        alert("审批失败");
      }
    };

    const formatTime = (timeString) => {
      return new Date(timeString).toLocaleString("zh-CN", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const scrollToBottom = () => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop =
          messagesContainer.value.scrollHeight;
      }
    };

    watchEffect(() => {
      if (messages.value.length > 0) {
        setTimeout(scrollToBottom, 100);
      }
    });

    onMounted(async () => {
      // 获取当前用户信息
      try {
        const userResponse = await api.getCurrentUser();
        if (userResponse.data) {
          currentUserId.value = userResponse.data.id;
          // 保存到localStorage以便其他组件使用
          localStorage.setItem("user", JSON.stringify(userResponse.data));
        }
      } catch (error) {
        console.error("获取当前用户信息失败:", error);
        // 如果API调用失败，尝试从localStorage获取
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (user && user.id) {
          currentUserId.value = user.id;
        }
      }

      await loadGroupData();

      // 模拟实时消息更新
      setInterval(() => {
        if (document.visibilityState === "visible") {
          loadGroupData();
        }
      }, 5000);
    });

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
      messagesContainer,
    };
  },
};
</script>

<style scoped></style>
