<template>
  <div class="group-list-page">
    <div class="page-header">
      <h1>群聊列表</h1>
      <button @click="showCreateGroupModal = true" class="btn-primary">
        创建群组
      </button>
    </div>

    <div class="groups-section">
      <h2>我的群组</h2>
      <div v-if="userGroups.length === 0" class="empty-state">
        <p>你还没有加入任何群组</p>
      </div>
      <div v-else class="groups-grid">
        <div
          v-for="group in userGroups"
          :key="group.id"
          class="group-card"
          @click="enterGroup(group.id)"
        >
          <h3>{{ group.name }}</h3>
          <p>{{ group.description || "暂无描述" }}</p>
          <div class="group-status">
            <span
              class="status-badge"
              :class="group.status === 'approved' ? 'approved' : 'pending'"
            >
              {{ group.status === "approved" ? "已加入" : "待审核" }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="groups-section">
      <h2>所有群组</h2>
      <div v-if="allGroups.length === 0" class="empty-state">
        <p>暂无群组</p>
      </div>
      <div v-else class="groups-grid">
        <div v-for="group in allGroups" :key="group.id" class="group-card">
          <h3>{{ group.name }}</h3>
          <p>{{ group.description || "暂无描述" }}</p>
          <div class="group-actions">
            <button
              v-if="!isUserInGroup(group.id)"
              @click="applyToGroup(group.id)"
              class="btn btn-secondary"
            >
              申请加入
            </button>
            <span v-else class="already-member">已申请/加入</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建群组弹窗 -->
    <div v-if="showCreateGroupModal" class="modal">
      <div class="modal-content">
        <h3>创建群组</h3>
        <form @submit.prevent="createGroup">
          <div class="form-group">
            <label for="groupName">群组名称</label>
            <input
              id="groupName"
              v-model="newGroup.name"
              type="text"
              required
            />
          </div>
          <div class="form-group">
            <label for="groupDescription">群组描述</label>
            <textarea
              id="groupDescription"
              v-model="newGroup.description"
              rows="3"
            ></textarea>
          </div>
          <div class="modal-actions">
            <button
              type="button"
              @click="showCreateGroupModal = false"
              class="btn btn-secondary"
            >
              取消
            </button>
            <button type="submit" class="btn btn-primary">创建</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "../services/api.js";

export default {
  name: "GroupListPage",
  setup() {
    const router = useRouter();
    const userGroups = ref([]);
    const allGroups = ref([]);
    const showCreateGroupModal = ref(false);
    const newGroup = ref({
      name: "",
      description: "",
    });

    const loadGroups = async () => {
      try {
        const [userGroupsRes, allGroupsRes] = await Promise.all([
          api.getUserGroups(),
          api.getGroups(),
        ]);

        userGroups.value = userGroupsRes.data || [];
        allGroups.value = allGroupsRes.data || [];
      } catch (error) {
        console.error("加载群组列表失败:", error);
      }
    };

    const isUserInGroup = (groupId) => {
      return userGroups.value.some((group) => group.id === groupId);
    };

    const createGroup = async () => {
      try {
        await api.createGroup(newGroup.value);
        showCreateGroupModal.value = false;
        newGroup.value = { name: "", description: "" };
        await loadGroups();
      } catch (error) {
        console.error("创建群组失败:", error);
        alert("创建群组失败");
      }
    };

    const applyToGroup = async (groupId) => {
      try {
        await api.applyToGroup(groupId);
        alert("申请已提交，等待管理员审核");
        await loadGroups();
      } catch (error) {
        console.error("申请加入群组失败:", error);
        alert("申请失败");
      }
    };

    const enterGroup = (groupId) => {
      router.push(`/group/${groupId}`);
    };

    onMounted(() => {
      loadGroups();
    });

    return {
      userGroups,
      allGroups,
      showCreateGroupModal,
      newGroup,
      isUserInGroup,
      createGroup,
      applyToGroup,
      enterGroup,
    };
  },
};
</script>

<style scoped></style>
