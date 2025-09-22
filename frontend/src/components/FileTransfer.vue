<template>
  <div class="file-transfer">
    <input
      type="file"
      ref="fileInput"
      @change="handleFileSelect"
      style="display: none;"
      :disabled="uploading"
    />
    <button
      @click="triggerFileSelect"
      :disabled="uploading"
      class="file-transfer-button"
    >
      {{ uploading ? 'Uploading...' : 'Send File' }}
    </button>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useChatStore } from '../stores/chat.js';

export default {
  name: 'FileTransfer',
  props: {
    receiverId: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    const chatStore = useChatStore();
    const fileInput = ref(null);
    const uploading = ref(false);

    const triggerFileSelect = () => {
      fileInput.value.click();
    };

    const handleFileSelect = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit');
        return;
      }

      uploading.value = true;
      try {
        // Upload file
        const formData = new FormData();
        formData.append('file', file);
        formData.append('receiverId', props.receiverId);

        const response = await fetch('http://localhost:3000/api/file/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include',
          // Add header for proper CORS handling
          headers: {
            'X-Requested-With': 'XMLHttpRequest'
          }
        });

        const result = await response.json();

        if (response.ok) {
          // Add a message about the file transfer to the chat
          chatStore.addFileMessage({
            fileName: result.data.originalName,
            fileSize: result.data.size,
            fileId: result.data.fileId
          }, props.receiverId);

          // Clear file input
          fileInput.value.value = '';
        } else {
          throw new Error(result.message || 'File upload failed');
        }
      } catch (error) {
        console.error('File upload error:', error);
        alert('File upload failed: ' + error.message);
      } finally {
        uploading.value = false;
      }
    };

    return {
      fileInput,
      uploading,
      triggerFileSelect,
      handleFileSelect
    };
  }
};
</script>

<style scoped>
.file-transfer-button {
  padding: 12px 24px;
  background: linear-gradient(120deg, #28a745, #20c997);
  color: white;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
}

.file-transfer-button:hover:not(:disabled) {
  background: linear-gradient(120deg, #218838, #1eac80);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
}

.file-transfer-button:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
</style>