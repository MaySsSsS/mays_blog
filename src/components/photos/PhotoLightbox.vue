<template>
  <Teleport to="body">
    <Transition name="lightbox">
      <div v-if="visible" class="lightbox-overlay" @click.self="close">
        <div class="lightbox-container">
          <!-- 关闭按钮 -->
          <button class="close-btn" @click="close">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <!-- 主图区域 -->
          <div class="main-image-area">
            <!-- 上一张 -->
            <button
              v-if="photos.length > 1"
              class="nav-btn prev"
              @click="prevPhoto"
              :disabled="currentIndex === 0"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="15,18 9,12 15,6" />
              </svg>
            </button>

            <!-- 图片 -->
            <div class="image-wrapper">
              <Transition :name="slideDirection" mode="out-in">
                <img
                  :key="currentPhoto?.id"
                  :src="currentPhoto?.url"
                  :alt="currentPhoto?.title"
                  class="main-image"
                  @load="imageLoaded = true"
                />
              </Transition>

              <!-- 加载中 -->
              <div v-if="!imageLoaded" class="image-loading">
                <div class="loader"></div>
              </div>
            </div>

            <!-- 下一张 -->
            <button
              v-if="photos.length > 1"
              class="nav-btn next"
              @click="nextPhoto"
              :disabled="currentIndex === photos.length - 1"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="9,18 15,12 9,6" />
              </svg>
            </button>
          </div>

          <!-- 底部信息栏 -->
          <div class="info-bar">
            <div class="photo-info">
              <h3 class="photo-title">{{ currentPhoto?.title }}</h3>
              <p v-if="currentPhoto?.description" class="photo-desc">
                {{ currentPhoto.description }}
              </p>
              <div class="photo-meta">
                <span v-if="currentPhoto?.date" class="meta-item">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {{ formatDate(currentPhoto.date) }}
                </span>
                <span v-if="photos.length > 1" class="meta-item counter">
                  {{ currentIndex + 1 }} / {{ photos.length }}
                </span>
              </div>
            </div>

            <!-- 缩略图导航 -->
            <div v-if="photos.length > 1" class="thumbnails">
              <button
                v-for="(photo, index) in photos"
                :key="photo.id"
                :class="['thumb', { active: index === currentIndex }]"
                @click="goToPhoto(index)"
              >
                <img :src="photo.url" :alt="photo.title" />
              </button>
            </div>

            <!-- 操作按钮 -->
            <div class="actions">
              <button class="action-btn" @click="downloadPhoto" title="下载">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7,10 12,15 17,10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
              <button
                class="action-btn delete"
                @click="confirmDelete"
                title="删除"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="3,6 5,6 21,6" />
                  <path
                    d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";

interface Photo {
  id: string;
  title: string;
  description?: string;
  date?: string;
  url?: string;
}

const props = defineProps<{
  visible: boolean;
  photos: Photo[];
  initialIndex?: number;
}>();

const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "delete", photoId: string): void;
}>();

const currentIndex = ref(0);
const imageLoaded = ref(false);
const slideDirection = ref<"slide-left" | "slide-right">("slide-left");

const currentPhoto = computed(() => props.photos[currentIndex.value]);

watch(
  () => props.visible,
  (val) => {
    if (val) {
      currentIndex.value = props.initialIndex || 0;
      imageLoaded.value = false;
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }
);

watch(currentIndex, () => {
  imageLoaded.value = false;
});

const close = () => {
  emit("update:visible", false);
};

const prevPhoto = () => {
  if (currentIndex.value > 0) {
    slideDirection.value = "slide-right";
    currentIndex.value--;
  }
};

const nextPhoto = () => {
  if (currentIndex.value < props.photos.length - 1) {
    slideDirection.value = "slide-left";
    currentIndex.value++;
  }
};

const goToPhoto = (index: number) => {
  slideDirection.value =
    index > currentIndex.value ? "slide-left" : "slide-right";
  currentIndex.value = index;
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const downloadPhoto = () => {
  if (!currentPhoto.value?.url) return;

  const link = document.createElement("a");
  link.href = currentPhoto.value.url;
  link.download = `${currentPhoto.value.title || "photo"}.jpg`;
  link.click();
};

const confirmDelete = () => {
  if (!currentPhoto.value) return;

  if (confirm(`确定要删除照片「${currentPhoto.value.title}」吗？`)) {
    emit("delete", currentPhoto.value.id);

    // 如果删除后没有照片了，关闭弹窗
    if (props.photos.length <= 1) {
      close();
    } else if (currentIndex.value >= props.photos.length - 1) {
      currentIndex.value = Math.max(0, currentIndex.value - 1);
    }
  }
};

// 键盘导航
const handleKeydown = (e: KeyboardEvent) => {
  if (!props.visible) return;

  switch (e.key) {
    case "Escape":
      close();
      break;
    case "ArrowLeft":
      prevPhoto();
      break;
    case "ArrowRight":
      nextPhoto();
      break;
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
  document.body.style.overflow = "";
});
</script>

<style scoped>
.lightbox-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.lightbox-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.main-image-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  min-height: 0;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 5;
}

.nav-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.nav-btn.prev {
  left: 1rem;
}

.nav-btn.next {
  right: 1rem;
}

.image-wrapper {
  position: relative;
  max-width: calc(100% - 140px);
  max-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-image {
  max-width: 100%;
  max-height: calc(100vh - 200px);
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.image-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loader {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #66c0f4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.info-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  padding: 1rem;
  background: rgba(22, 27, 34, 0.9);
  border-radius: 12px;
  margin-top: 1rem;
}

.photo-info {
  flex: 1;
  min-width: 0;
}

.photo-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #e6edf3;
  margin: 0 0 0.25rem;
}

.photo-desc {
  font-size: 0.9rem;
  color: #8b949e;
  margin: 0 0 0.5rem;
  line-height: 1.4;
}

.photo-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: #6e7681;
}

.meta-item.counter {
  color: #66c0f4;
  font-weight: 500;
}

.thumbnails {
  display: flex;
  gap: 0.5rem;
  max-width: 400px;
  overflow-x: auto;
  padding: 0.25rem;
}

.thumbnails::-webkit-scrollbar {
  height: 4px;
}

.thumbnails::-webkit-scrollbar-thumb {
  background: rgba(102, 192, 244, 0.3);
  border-radius: 2px;
}

.thumb {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  padding: 0;
  border: 2px solid transparent;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  opacity: 0.5;
  transition: all 0.2s ease;
}

.thumb:hover {
  opacity: 0.8;
}

.thumb.active {
  border-color: #66c0f4;
  opacity: 1;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 10px;
  color: #8b949e;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #e6edf3;
}

.action-btn.delete:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

/* 过渡动画 */
.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.3s ease;
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}

/* 图片切换动画 */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* 响应式 */
@media (max-width: 768px) {
  .lightbox-container {
    padding: 0.5rem;
  }

  .nav-btn {
    width: 40px;
    height: 40px;
  }

  .image-wrapper {
    max-width: calc(100% - 100px);
  }

  .info-bar {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .thumbnails {
    max-width: 100%;
    justify-content: center;
  }

  .actions {
    justify-content: center;
  }
}
</style>
