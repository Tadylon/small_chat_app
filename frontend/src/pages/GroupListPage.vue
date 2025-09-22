<template>
  <div class="group-list-page">
    <div class="page-header">
      <h1>群聊列表</h1>
      <button @click="showCreateGroupModal = true" class="btn btn-primary">
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
          <p>{{ group.description || '暂无描述' }}</p>
          <div class="group-status">
            <span
              class="status-badge"
              :class="group.status === 'approved' ? 'approved' : 'pending'"
            >
              {{ group.status === 'approved' ? '已加入' : '待审核' }}
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
        <div
          v-for="group in allGroups"
          :key="group.id"
          class="group-card"
        >
          <h3>{{ group.name }}</h3>
          <p>{{ group.description || '暂无描述' }}</p>
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
            <button type="button" @click="showCreateGroupModal = false" class="btn btn-secondary">
              取消
            </button>
            <button type="submit" class="btn btn-primary">
              创建
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api.js'

export default {
  name: 'GroupListPage',
  setup() {
    const router = useRouter()
    const userGroups = ref([])
    const allGroups = ref([])
    const showCreateGroupModal = ref(false)
    const newGroup = ref({
      name: '',
      description: ''
    })

    const loadGroups = async () => {
      try {
        const [userGroupsRes, allGroupsRes] = await Promise.all([
          api.getUserGroups(),
          api.getGroups()
        ])

        userGroups.value = userGroupsRes.data || []
        allGroups.value = allGroupsRes.data || []
      } catch (error) {
        console.error('加载群组列表失败:', error)
      }
    }

    const isUserInGroup = (groupId) => {
      return userGroups.value.some(group => group.id === groupId)
    }

    const createGroup = async () => {
      try {
        await api.createGroup(newGroup.value)
        showCreateGroupModal.value = false
        newGroup.value = { name: '', description: '' }
        await loadGroups()
      } catch (error) {
        console.error('创建群组失败:', error)
        alert('创建群组失败')
      }
    }

    const applyToGroup = async (groupId) => {
      try {
        await api.applyToGroup(groupId)
        alert('申请已提交，等待管理员审核')
        await loadGroups()
      } catch (error) {
        console.error('申请加入群组失败:', error)
        alert('申请失败')
      }
    }

    const enterGroup = (groupId) => {
      router.push(`/group/${groupId}`)
    }

    onMounted(() => {
      loadGroups()
    })

    return {
      userGroups,
      allGroups,
      showCreateGroupModal,
      newGroup,
      isUserInGroup,
      createGroup,
      applyToGroup,
      enterGroup
    }
  }
}
</script>

<style scoped>
.group-list-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.page-header h1 {
  margin: 0;
  color: #333;
  font-weight: 600;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  font-size: 16px;
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

.groups-section {
  margin-bottom: 40px;
}

.groups-section h2 {
  margin: 0 0 20px 0;
  color: #333;
  font-weight: 600;
  padding: 10px 0;
}

.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.group-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e9ecef;
}

.group-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.group-card h3 {
  margin: 0 0 12px 0;
  color: #333;
  font-weight: 600;
}

.group-card p {
  margin: 0 0 20px 0;
  color: #666;
  font-size: 15px;
  line-height: 1.5;
}

.group-status,
.group-actions {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e9ecef;
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

.empty-state {
  text-align: center;
  padding: 60px;
  color: #6c757d;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
  max-width: 500px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: modalFadeIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}

.already-member {
  color: #6c757d;
  font-size: 15px;
  font-weight: 500;
}
</style>