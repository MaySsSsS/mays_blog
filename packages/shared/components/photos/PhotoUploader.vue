<template>
  <div
    class="photo-uploader"
    :class="{ 'drag-over': isDragging }"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="handleDrop"
  >
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      multiple
      class="file-input"
      @change="handleFileSelect"
    />

    <div
      v-if="!previewImages.length"
      class="upload-area"
      @click="triggerFileSelect"
    >
      <div class="upload-icon">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17,8 12,3 7,8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </div>
      <p class="upload-text">拖拽图片到这里，或点击选择</p>
      <p class="upload-hint">支持 JPG、PNG、WebP 格式</p>
    </div>

    <div v-else class="preview-area">
      <div class="preview-grid">
        <div
          v-for="(img, index) in previewImages"
          :key="index"
          class="preview-item"
        >
          <img :src="img.preview" :alt="img.file.name" />
          <button class="remove-btn" @click="removeImage(index)">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <div class="image-info">
            <span class="image-name">{{ truncateName(img.file.name) }}</span>
            <span class="image-size">{{ formatSize(img.file.size) }}</span>
          </div>
        </div>

        <!-- 添加更多按钮 -->
        <div class="add-more" @click="triggerFileSelect">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span>添加更多</span>
        </div>
      </div>

      <!-- 照片信息表单 -->
      <div class="photo-form">
        <div class="form-group">
          <label class="form-label">照片标题</label>
          <input
            v-model="photoTitle"
            type="text"
            class="form-input"
            placeholder="给这组照片起个名字..."
          />
        </div>
        <div class="form-group">
          <label class="form-label">描述（可选）</label>
          <textarea
            v-model="photoDescription"
            class="form-textarea"
            placeholder="记录一些当时的感受..."
            rows="2"
          ></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">拍摄日期</label>
          <input v-model="photoDate" type="date" class="form-input" />
        </div>
      </div>

      <div class="upload-actions">
        <button class="btn btn-secondary" @click="clearAll">清空</button>
        <button
          class="btn btn-primary"
          :disabled="!canUpload || isUploading"
          @click="uploadPhotos"
        >
          <span v-if="isUploading" class="loading-spinner"></span>
          {{ isUploading ? "处理中..." : `确认添加 (${previewImages.length})` }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

interface PreviewImage {
  file: File;
  preview: string;
}

const emit = defineEmits<{
  (
    e: "upload",
    photos: {
      url: string;
      title: string;
      description?: string;
      date?: string;
    }[]
  ): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);
const isUploading = ref(false);
const previewImages = ref<PreviewImage[]>([]);

const photoTitle = ref("");
const photoDescription = ref("");
const photoDate = ref(new Date().toISOString().split("T")[0]);

const canUpload = computed(() => {
  return previewImages.value.length > 0 && photoTitle.value.trim();
});

const triggerFileSelect = () => {
  fileInput.value?.click();
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    processFiles(Array.from(target.files));
  }
};

const handleDrop = (event: DragEvent) => {
  isDragging.value = false;
  const files = event.dataTransfer?.files;
  if (files) {
    processFiles(Array.from(files).filter((f) => f.type.startsWith("image/")));
  }
};

const processFiles = async (files: File[]) => {
  for (const file of files) {
    // 限制文件大小（10MB）
    if (file.size > 10 * 1024 * 1024) {
      alert(`文件 ${file.name} 太大，请选择小于 10MB 的图片`);
      continue;
    }

    // 生成预览
    const preview = await createPreview(file);
    previewImages.value.push({ file, preview });
  }
};

const createPreview = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  });
};

const removeImage = (index: number) => {
  previewImages.value.splice(index, 1);
};

const clearAll = () => {
  previewImages.value = [];
  photoTitle.value = "";
  photoDescription.value = "";
  photoDate.value = new Date().toISOString().split("T")[0];
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

const uploadPhotos = async () => {
  if (!canUpload.value) return;

  isUploading.value = true;

  try {
    // 压缩图片并转换为 Base64
    const photos = await Promise.all(
      previewImages.value.map(async (img, index) => {
        const compressedUrl = await compressImage(img.file);
        return {
          url: compressedUrl,
          title:
            previewImages.value.length === 1
              ? photoTitle.value
              : `${photoTitle.value} (${index + 1})`,
          description: photoDescription.value || undefined,
          date: photoDate.value || undefined,
        };
      })
    );

    emit("upload", photos);
    clearAll();
  } catch (error) {
    console.error("Upload failed:", error);
    alert("处理图片时出错，请重试");
  } finally {
    isUploading.value = false;
  }
};

// 图片压缩
const compressImage = (
  file: File,
  maxWidth = 1200,
  quality = 0.8
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      // 按比例缩放
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // 转换为 WebP 或 JPEG
      const mimeType = "image/jpeg";
      const dataUrl = canvas.toDataURL(mimeType, quality);
      resolve(dataUrl);
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
};

const truncateName = (name: string, maxLength = 20): string => {
  if (name.length <= maxLength) return name;
  const ext = name.split(".").pop() || "";
  const base = name.slice(0, maxLength - ext.length - 4);
  return `${base}...${ext}`;
};

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
</script>

<style scoped>
.photo-uploader {
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 16px;
  transition: all 0.3s ease;
}

.photo-uploader.drag-over {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
}

.file-input {
  display: none;
}

.upload-area {
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
}

.upload-area:hover {
  background: rgba(59, 130, 246, 0.03);
}

.upload-icon {
  color: #3b82f6;
  margin-bottom: 1rem;
}

.upload-text {
  font-size: 1rem;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.upload-hint {
  font-size: 0.85rem;
  color: #64748b;
}

.preview-area {
  padding: 1.5rem;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.preview-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  background: #e2e8f0;
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.preview-item:hover .remove-btn {
  opacity: 1;
}

.remove-btn:hover {
  background: #ef4444;
}

.image-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.5rem;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.image-name {
  font-size: 0.7rem;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-size {
  font-size: 0.65rem;
  color: #d1d5db;
}

.add-more {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  color: #3b82f6;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-more:hover {
  background: rgba(59, 130, 246, 0.08);
  border-color: #3b82f6;
}

.photo-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-label {
  font-size: 0.85rem;
  color: #64748b;
}

.form-input,
.form-textarea {
  padding: 0.65rem 0.9rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  color: #1e293b;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s ease;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #94a3b8;
}

.form-textarea {
  resize: vertical;
  min-height: 60px;
}

.upload-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: transparent;
  border: 1px solid #e2e8f0;
  color: #64748b;
}

.btn-secondary:hover {
  background: #f8fafc;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
  color: #ffffff;
}

.btn-primary:hover:not(:disabled) {
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
