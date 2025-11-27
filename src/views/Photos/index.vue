<template>
  <MainLayout>
    <div class="photos-page">
      <section class="hero">
        <div class="hero-content">
          <h1 class="title">照片 · 足迹</h1>
          <p class="subtitle">
            把日常和旅行照片按地点分组，用地图的方式记录自己的足迹
          </p>
          <div class="hero-stats">
            <div class="stat-item">
              <span class="stat-value">{{ photoStore.groups.length }}</span>
              <span class="stat-label">个分组</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ photoStore.totalPhotos }}</span>
              <span class="stat-label">张照片</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ photoStore.cities.length }}</span>
              <span class="stat-label">个城市</span>
            </div>
          </div>
        </div>
      </section>

      <section class="content">
        <div class="layout">
          <!-- 左侧：分组和城市选择 -->
          <aside class="sidebar">
            <div class="sidebar-section">
              <h2 class="section-title">
                分组
                <span class="section-count">{{
                  photoStore.groups.length
                }}</span>
              </h2>
              <ul class="group-list">
                <li
                  v-for="group in photoStore.groups"
                  :key="group.id"
                  :class="[
                    'group-item',
                    { active: group.id === activeGroupId },
                  ]"
                  @click="selectGroup(group.id)"
                >
                  <div class="group-main">
                    <span class="group-name">{{ group.name }}</span>
                    <span class="group-meta">
                      {{ group.city }} · {{ group.photos.length }} 张
                    </span>
                  </div>
                  <button
                    class="group-delete"
                    @click.stop="deleteGroup(group.id)"
                    title="删除分组"
                  >
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
                </li>
              </ul>
              <button class="btn btn-outline" @click="showCreateGroup = true">
                + 新建分组
              </button>
            </div>

            <div class="sidebar-section">
              <h2 class="section-title">
                城市筛选
                <button
                  v-if="activeCity"
                  class="clear-filter"
                  @click="activeCity = null"
                >
                  清除
                </button>
              </h2>
              <div class="city-tags">
                <button
                  v-for="city in photoStore.cities"
                  :key="city"
                  :class="['tag', { active: city === activeCity }]"
                  @click="selectCity(city)"
                >
                  {{ city }}
                  <span class="tag-count">{{ getCityPhotoCount(city) }}</span>
                </button>
              </div>
            </div>
          </aside>

          <!-- 中间：中国地图 -->
          <section class="map-section">
            <h2 class="section-title">
              足迹地图
              <span v-if="activeCity" class="current-city">
                当前：{{ activeCity }}
              </span>
            </h2>
            <ChinaMap
              :activeCity="activeCity"
              :visitedCities="photoStore.cities"
              :cityPhotoCounts="cityPhotoCounts"
              :showConnections="true"
              @select="selectCity"
            />
          </section>

          <!-- 右侧：照片网格 -->
          <section class="photos-section">
            <div class="section-header">
              <h2 class="section-title">
                照片
                <span v-if="activeGroup" class="current-group">
                  · {{ activeGroup.name }}（{{ activeGroup.photos.length }} 张）
                </span>
              </h2>
              <button
                v-if="activeGroup"
                class="btn btn-primary btn-sm"
                @click="showUploader = !showUploader"
              >
                {{ showUploader ? "取消" : "+ 添加照片" }}
              </button>
            </div>

            <!-- 照片上传区域 -->
            <PhotoUploader
              v-if="showUploader && activeGroup"
              @upload="handlePhotoUpload"
              class="uploader-area"
            />

            <div v-if="!activeGroup" class="empty-state">
              <div class="empty-icon">📷</div>
              <p>还没有选择分组</p>
              <p class="empty-hint">在左侧选择一个分组，或者创建一个新的</p>
            </div>

            <div
              v-else-if="activeGroup.photos.length === 0"
              class="empty-state"
            >
              <div class="empty-icon">🖼️</div>
              <p>这个分组还没有照片</p>
              <p class="empty-hint">点击上方「添加照片」开始上传</p>
            </div>

            <div v-else class="photos-grid">
              <div
                v-for="(photo, index) in activeGroup.photos"
                :key="photo.id"
                class="photo-item"
                @click="openLightbox(index)"
              >
                <div class="photo-thumb">
                  <img
                    v-if="photo.url"
                    :src="photo.url"
                    :alt="photo.title"
                    loading="lazy"
                  />
                  <div v-else class="photo-placeholder">
                    <span>{{ photo.title }}</span>
                  </div>
                </div>
                <div class="photo-meta">
                  <div class="photo-title">{{ photo.title }}</div>
                  <div v-if="photo.description" class="photo-desc">
                    {{ photo.description }}
                  </div>
                  <div v-if="photo.date" class="photo-date">
                    {{ formatDate(photo.date) }}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>

      <!-- 新建分组弹窗 -->
      <CitySelector
        v-model:visible="showCreateGroup"
        @select="handleCitySelect"
      />

      <!-- 照片详情弹窗 -->
      <PhotoLightbox
        v-model:visible="showLightbox"
        :photos="activeGroup?.photos || []"
        :initialIndex="lightboxIndex"
        @delete="handlePhotoDelete"
      />
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import MainLayout from "@/layouts/MainLayout.vue";
import ChinaMap from "@/components/photos/ChinaMap.vue";
import CitySelector from "@/components/photos/CitySelector.vue";
import PhotoUploader from "@/components/photos/PhotoUploader.vue";
import PhotoLightbox from "@/components/photos/PhotoLightbox.vue";
import { usePhotoStore } from "@/stores/photos";

const photoStore = usePhotoStore();

const activeGroupId = ref<string | null>(null);
const activeCity = ref<string | null>(null);
const showCreateGroup = ref(false);
const showUploader = ref(false);
const showLightbox = ref(false);
const lightboxIndex = ref(0);

// 初始化
onMounted(() => {
  photoStore.initSampleData();
  const firstGroup = photoStore.groups[0];
  if (firstGroup) {
    activeGroupId.value = firstGroup.id;
    activeCity.value = firstGroup.city;
  }
});

const activeGroup = computed(() => {
  return photoStore.groups.find((g) => g.id === activeGroupId.value) || null;
});

// 每个城市的照片数量
const cityPhotoCounts = computed(() => {
  const counts: Record<string, number> = {};
  for (const group of photoStore.groups) {
    if (!counts[group.city]) counts[group.city] = 0;
    counts[group.city] += group.photos.length;
  }
  return counts;
});

const getCityPhotoCount = (city: string): number => {
  return cityPhotoCounts.value[city] || 0;
};

const selectGroup = (id: string) => {
  activeGroupId.value = id;
  const group = photoStore.groups.find((g) => g.id === id);
  if (group) {
    activeCity.value = group.city;
  }
  showUploader.value = false;
};

const selectCity = (city: string) => {
  activeCity.value = city;
  // 选择该城市的第一个分组
  const group = photoStore.groups.find((g) => g.city === city);
  if (group) {
    activeGroupId.value = group.id;
  }
};

const handleCitySelect = (city: string) => {
  // 弹出输入分组名称
  const name = window.prompt(`新建「${city}」的分组，请输入分组名称：`);
  if (!name) return;

  const newGroup = photoStore.addGroup(name, city);
  activeGroupId.value = newGroup.id;
  activeCity.value = city;
  showCreateGroup.value = false;
};

const deleteGroup = (id: string) => {
  const group = photoStore.groups.find((g) => g.id === id);
  if (!group) return;

  if (confirm(`确定要删除分组「${group.name}」及其所有照片吗？`)) {
    photoStore.removeGroup(id);

    // 如果删除的是当前选中的分组，选择第一个
    if (activeGroupId.value === id) {
      activeGroupId.value = photoStore.groups[0]?.id || null;
      activeCity.value = photoStore.groups[0]?.city || null;
    }
  }
};

const handlePhotoUpload = (
  photos: { url: string; title: string; description?: string; date?: string }[]
) => {
  if (!activeGroupId.value) return;

  for (const photo of photos) {
    photoStore.addPhoto(activeGroupId.value, photo);
  }

  showUploader.value = false;
};

const handlePhotoDelete = (photoId: string) => {
  if (!activeGroupId.value) return;
  photoStore.removePhoto(activeGroupId.value, photoId);
};

const openLightbox = (index: number) => {
  lightboxIndex.value = index;
  showLightbox.value = true;
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
</script>

<style scoped>
.photos-page {
  min-height: 100vh;
  background: #f8fafc;
}

.hero {
  padding: 3rem 2rem 2rem;
  background: linear-gradient(
    180deg,
    rgba(59, 130, 246, 0.05) 0%,
    transparent 100%
  );
}

.hero-content {
  max-width: 960px;
  margin: 0 auto;
  text-align: center;
}

.title {
  font-size: 2.4rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: #64748b;
  font-size: 1.1rem;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-top: 2rem;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #3b82f6;
}

.stat-label {
  font-size: 0.85rem;
  color: #64748b;
}

.content {
  padding: 1rem 2rem 4rem;
}

.layout {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 260px minmax(0, 1.2fr) minmax(0, 1.5fr);
  gap: 2rem;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.sidebar-section {
  background: #ffffff;
  border-radius: 16px;
  padding: 1.25rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #1e293b;
}

.section-count {
  font-size: 0.8rem;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.clear-filter {
  font-size: 0.75rem;
  color: #64748b;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.clear-filter:hover {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.08);
}

.group-list {
  list-style: none;
  margin: 0 0 0.75rem;
  padding: 0;
}

.group-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.7rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.group-item:hover {
  background: rgba(59, 130, 246, 0.05);
}

.group-item.active {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.group-main {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.group-name {
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #1e293b;
}

.group-meta {
  font-size: 0.8rem;
  color: #64748b;
}

.group-delete {
  opacity: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.group-item:hover .group-delete {
  opacity: 1;
}

.group-delete:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 1rem;
  border-radius: 999px;
  font-size: 0.85rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.btn-outline {
  width: 100%;
  background: transparent;
  border: 1px dashed rgba(59, 130, 246, 0.4);
  color: #3b82f6;
}

.btn-outline:hover {
  background: rgba(59, 130, 246, 0.05);
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #ffffff;
  font-weight: 500;
}

.btn-primary:hover {
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.btn-sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
}

.city-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background: transparent;
  color: #64748b;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tag:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

.tag.active {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border-color: #3b82f6;
}

.tag-count {
  font-size: 0.7rem;
  background: rgba(59, 130, 246, 0.15);
  padding: 0 0.35rem;
  border-radius: 999px;
}

.map-section {
  background: #ffffff;
  border-radius: 16px;
  padding: 1.25rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.current-city {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 400;
}

.photos-section {
  background: #ffffff;
  border-radius: 16px;
  padding: 1.25rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.current-group {
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 400;
}

.uploader-area {
  margin-bottom: 1.5rem;
}

.empty-state {
  padding: 3rem 2rem;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state p {
  color: #64748b;
  margin: 0;
}

.empty-hint {
  font-size: 0.85rem;
  margin-top: 0.5rem !important;
  color: #94a3b8 !important;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
}

.photo-item {
  background: #f8fafc;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.photo-item:hover {
  transform: translateY(-2px);
  border-color: #3b82f6;
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
}

.photo-thumb {
  aspect-ratio: 4 / 3;
  background: #e2e8f0;
  overflow: hidden;
}

.photo-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.photo-item:hover .photo-thumb img {
  transform: scale(1.05);
}

.photo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 0.85rem;
}

.photo-meta {
  padding: 0.6rem 0.7rem 0.7rem;
}

.photo-title {
  font-size: 0.9rem;
  margin-bottom: 0.1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #1e293b;
}

.photo-desc {
  font-size: 0.8rem;
  color: #64748b;
  margin-bottom: 0.25rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.photo-date {
  font-size: 0.75rem;
  color: #94a3b8;
}

@media (max-width: 1024px) {
  .layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .map-section {
    order: -1;
  }

  .hero-stats {
    gap: 1.5rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }
}

@media (max-width: 640px) {
  .hero {
    padding: 2rem 1rem 1.5rem;
  }

  .title {
    font-size: 1.8rem;
  }

  .content {
    padding-inline: 1rem;
  }

  .layout {
    gap: 1.25rem;
  }

  .photos-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
}
</style>
