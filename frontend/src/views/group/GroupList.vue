<template>
  <div class="p-6 md:p-10 h-full overflow-y-auto bg-base-200/30">
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
    >
      <div>
        <h1 class="text-3xl font-extrabold text-base-content">群组中心</h1>
        <p class="text-base-content/60 mt-1">发现并加入感兴趣的讨论组</p>
      </div>
      <button
        @click="showCreateGroupModal = true"
        class="btn btn-primary shadow-lg gap-2"
      >
        <span class="text-xl">+</span> 创建新群组
      </button>
    </div>

    <section class="mb-12">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-1.5 h-8 bg-primary rounded-full"></div>
        <h2 class="text-xl font-bold">已加入的群组</h2>
      </div>

      <div
        v-if="userGroups.length === 0"
        class="alert bg-base-100 shadow-sm border border-base-200"
      >
        <div class="opacity-70">你还没有加入任何群组，去下方申请一个吧！</div>
      </div>

      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <div
          v-for="group in userGroups"
          :key="group.id"
          @click="enterGroup(group.id)"
          class="card bg-base-100 shadow-md hover:shadow-xl transition-all duration-300 border border-base-200 cursor-pointer group-card"
        >
          <div class="card-body p-6">
            <div class="flex justify-between items-start">
              <div
                class="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl font-bold mb-2"
              >
                {{ group.name.charAt(0).toUpperCase() }}
              </div>
              <span
                class="badge"
                :class="
                  group.status === 'approved'
                    ? 'badge-success badge-outline'
                    : 'badge-warning badge-outline'
                "
              >
                {{ group.status === "approved" ? "成员" : "审核中" }}
              </span>
            </div>
            <h3 class="card-title text-lg">{{ group.name }}</h3>
            <p class="text-sm opacity-60 line-clamp-2 min-h-[2.5rem]">
              {{ group.description || "暂无描述" }}
            </p>
            <div class="card-actions justify-end mt-2">
              <button
                class="btn btn-sm btn-ghost text-primary group-hover:bg-primary group-hover:text-primary-content"
              >
                进入群聊 →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section>
      <div class="flex items-center gap-3 mb-6">
        <div class="w-1.5 h-8 bg-secondary rounded-full"></div>
        <h2 class="text-xl font-bold">探索更多</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="group in allGroups"
          :key="group.id"
          class="card bg-base-100 border border-base-200 hover:border-secondary/50 transition-colors"
        >
          <div class="card-body">
            <h3 class="card-title">{{ group.name }}</h3>
            <p class="text-sm opacity-70">
              {{ group.description || "暂无描述" }}
            </p>
            <div class="card-actions justify-end mt-4">
              <span
                v-if="isUserInGroup(group.id)"
                class="text-xs font-bold text-success flex items-center gap-1"
              >
                ✓ 已存在
              </span>
              <button
                v-else
                @click="applyToGroup(group.id)"
                class="btn btn-secondary btn-sm btn-outline"
              >
                申请加入
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="modal" :class="{ 'modal-open': showCreateGroupModal }">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-6 text-center">创建新群组</h3>
        <form @submit.prevent="createGroup" class="space-y-4">
          <div class="form-control">
            <label class="label"
              ><span class="label-text font-medium">群组名称</span></label
            >
            <input
              v-model="newGroup.name"
              type="text"
              class="input input-bordered focus:input-primary w-full"
              required
              placeholder="例如：前端交流会"
            />
          </div>
          <div class="form-control">
            <label class="label"
              ><span class="label-text font-medium">群组描述</span></label
            >
            <textarea
              v-model="newGroup.description"
              class="textarea textarea-bordered focus:textarea-primary h-24"
              placeholder="简单介绍一下这个群是做什么的..."
            ></textarea>
          </div>
          <div class="modal-action">
            <button
              type="button"
              @click="showCreateGroupModal = false"
              class="btn btn-ghost"
            >
              取消
            </button>
            <button type="submit" class="btn btn-primary px-8">立即创建</button>
          </div>
        </form>
      </div>
      <div class="modal-backdrop" @click="showCreateGroupModal = false"></div>
    </div>
  </div>
</template>

<script>
// 保持原 GroupListPage.vue 的逻辑部分不变
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "@/services/api.js"; // 注意路径可能变化

export default {
  name: "GroupList",
  setup() {
    // ... 逻辑代码保持一致 ...
    const router = useRouter();
    const userGroups = ref([]);
    const allGroups = ref([]);
    const showCreateGroupModal = ref(false);
    const newGroup = ref({ name: "", description: "" });

    const loadGroups = async () => {
      try {
        const [u, a] = await Promise.all([
          api.getUserGroups(),
          api.getGroups(),
        ]);
        userGroups.value = u.data || [];
        allGroups.value = a.data || [];
      } catch (e) {
        console.error(e);
      }
    };
    const isUserInGroup = (id) => userGroups.value.some((g) => g.id === id);
    const createGroup = async () => {
      /*...*/ showCreateGroupModal.value = false;
      loadGroups();
    };
    const applyToGroup = async (id) => {
      /*...*/ loadGroups();
    };
    const enterGroup = (id) => router.push(`/groups/${id}`); // 路由路径建议改为 /groups/:id

    onMounted(loadGroups);
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
