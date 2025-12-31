<template>
  <div class="flex flex-col h-full bg-base-100">
    <div
      class="navbar bg-base-200 border-b border-base-300 min-h-[4rem] px-4 shadow-sm z-10"
    >
      <div class="flex-1 flex-col items-start">
        <h2 class="text-lg font-bold">{{ group?.name || "群聊" }}</h2>
        <p class="text-xs text-base-content/60">
          {{ group?.description || "暂无描述" }}
        </p>
      </div>
      <div class="flex-none gap-2">
        <button @click="showMemberModal = true" class="btn btn-sm btn-ghost">
          群成员
          <div class="badge badge-sm">{{ groupMembers.length }}</div>
        </button>
        <button
          v-if="isAdmin"
          @click="showApplicationsModal = true"
          class="btn btn-sm btn-warning"
        >
          申请管理
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-4 space-y-4" ref="messagesContainer">
      <div
        v-for="message in messages"
        :key="message.id"
        class="chat"
        :class="message.sender_id === currentUserId ? 'chat-end' : 'chat-start'"
      >
        <div class="chat-header opacity-70 text-xs mb-1">
          {{ message.sender_name }}
          <time class="opacity-50 ml-1">{{
            formatTime(message.created_at)
          }}</time>
        </div>
        <div
          class="chat-bubble"
          :class="
            message.sender_id === currentUserId
              ? 'chat-bubble-primary'
              : 'chat-bubble-secondary'
          "
        >
          {{ message.message }}
        </div>
      </div>
    </div>

    <div class="p-4 border-t border-base-300 bg-base-100">
      <form @submit.prevent="sendMessage" class="join w-full">
        <input
          v-model="newMessage"
          id="group-message-input"
          type="text"
          placeholder="输入消息..."
          class="input input-bordered join-item w-full focus:input-primary"
          :disabled="!isApprovedMember"
          autocomplete="off"
        />
        <button
          type="submit"
          class="btn btn-primary join-item"
          :disabled="!newMessage.trim() || !isApprovedMember"
        >
          发送
        </button>
      </form>
      <div
        v-if="!isApprovedMember"
        class="alert alert-warning mt-2 py-2 text-sm shadow-sm"
      >
        <span>你还不是群组成员或尚未被批准，无法发送消息</span>
      </div>
    </div>

    <div class="modal" :class="{ 'modal-open': showMemberModal }">
      <div class="modal-box relative">
        <button
          @click="showMemberModal = false"
          class="btn btn-sm btn-circle absolute right-2 top-2"
        >
          ✕
        </button>
        <h3 class="text-lg font-bold mb-4">群成员列表</h3>

        <div class="max-h-60 overflow-y-auto space-y-2">
          <div
            v-for="member in groupMembers"
            :key="member.id"
            class="flex items-center justify-between p-2 bg-base-200 rounded-lg"
          >
            <div class="flex flex-col">
              <span class="font-bold">{{ member.username }}</span>
              <span class="text-xs opacity-70">{{ member.email }}</span>
            </div>
            <span
              class="badge"
              :class="
                member.status === 'approved' ? 'badge-success' : 'badge-warning'
              "
            >
              {{ member.status === "approved" ? "已批准" : "待审核" }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div
      class="modal"
      :class="{ 'modal-open': showApplicationsModal && isAdmin }"
    >
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">申请管理</h3>

        <div
          v-if="pendingMembers.length === 0"
          class="text-center py-8 text-base-content/50 italic"
        >
          暂无待审核的申请
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="member in pendingMembers"
            :key="member.id"
            class="card card-compact bg-base-200"
          >
            <div class="card-body flex-row items-center justify-between">
              <div>
                <div class="font-bold">{{ member.username }}</div>
                <div class="text-xs opacity-70">{{ member.email }}</div>
              </div>
              <div class="join">
                <button
                  @click="approveMember(member.user_id, 'approved')"
                  class="btn btn-sm btn-success join-item text-white"
                >
                  批准
                </button>
                <button
                  @click="approveMember(member.user_id, 'rejected')"
                  class="btn btn-sm btn-error join-item text-white"
                >
                  拒绝
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-action">
          <button @click="showApplicationsModal = false" class="btn">
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
import api from "@/services/api.js";

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
